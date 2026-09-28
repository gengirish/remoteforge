import { createHmac } from "node:crypto";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { verifyDodoWebhook } from "./dodo";

// The webhook is the only place a paid entitlement is granted, so a forged
// request that passes verification hands out free subscriptions. These cases
// are here because typecheck cannot catch a signature check that accepts too
// much: every assertion below fails loudly if the comparison is loosened.
//
// Run with: pnpm --filter @intelliforge/api-core test

const SECRET = `whsec_${Buffer.from("remoteforge-test-signing-key").toString("base64")}`;
const BODY = JSON.stringify({
  type: "subscription.renewed",
  data: { payload_type: "Subscription", subscription_id: "sub_abc" },
});
const EVENT_ID = "evt_2Nq1";

function nowSeconds(offset = 0): string {
  return String(Math.floor(Date.now() / 1000) + offset);
}

function sign(id: string, timestamp: string, body: string, secret = SECRET): string {
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  return `v1,${createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest("base64")}`;
}

describe("verifyDodoWebhook", () => {
  it("accepts a correctly signed delivery", () => {
    const timestamp = nowSeconds();
    const result = verifyDodoWebhook(
      BODY,
      { id: EVENT_ID, timestamp, signature: sign(EVENT_ID, timestamp, BODY) },
      SECRET,
    );
    assert.equal(result.ok, true);
  });

  it("accepts one valid signature among several, so secrets can be rotated", () => {
    const timestamp = nowSeconds();
    const signature = `v1,ZGVhZGJlZWY= ${sign(EVENT_ID, timestamp, BODY)}`;
    assert.equal(verifyDodoWebhook(BODY, { id: EVENT_ID, timestamp, signature }, SECRET).ok, true);
  });

  it("rejects a tampered body", () => {
    const timestamp = nowSeconds();
    const signature = sign(EVENT_ID, timestamp, BODY);
    const tampered = JSON.stringify({
      type: "subscription.renewed",
      data: { payload_type: "Subscription", subscription_id: "sub_attacker" },
    });
    assert.equal(verifyDodoWebhook(tampered, { id: EVENT_ID, timestamp, signature }, SECRET).ok, false);
  });

  it("rejects a signature replayed under a different event id", () => {
    // Without the id in the signed payload, a captured signature could be
    // reused with a fresh webhook-id to defeat the idempotency claim.
    const timestamp = nowSeconds();
    const signature = sign(EVENT_ID, timestamp, BODY);
    assert.equal(verifyDodoWebhook(BODY, { id: "evt_other", timestamp, signature }, SECRET).ok, false);
  });

  it("rejects a signature made with a different secret", () => {
    const timestamp = nowSeconds();
    const wrong = `whsec_${Buffer.from("not-our-key").toString("base64")}`;
    const signature = sign(EVENT_ID, timestamp, BODY, wrong);
    assert.equal(verifyDodoWebhook(BODY, { id: EVENT_ID, timestamp, signature }, SECRET).ok, false);
  });

  it("rejects a stale timestamp even when the HMAC matches", () => {
    // A request captured 10 minutes ago must not be replayable.
    const timestamp = nowSeconds(-600);
    const signature = sign(EVENT_ID, timestamp, BODY);
    const result = verifyDodoWebhook(BODY, { id: EVENT_ID, timestamp, signature }, SECRET);
    assert.equal(result.ok, false);
    assert.match(result.ok ? "" : result.reason, /timestamp/i);
  });

  it("rejects a timestamp far in the future", () => {
    const timestamp = nowSeconds(600);
    const signature = sign(EVENT_ID, timestamp, BODY);
    assert.equal(verifyDodoWebhook(BODY, { id: EVENT_ID, timestamp, signature }, SECRET).ok, false);
  });

  it("accepts a timestamp within the tolerance window", () => {
    const timestamp = nowSeconds(-60);
    const signature = sign(EVENT_ID, timestamp, BODY);
    assert.equal(verifyDodoWebhook(BODY, { id: EVENT_ID, timestamp, signature }, SECRET).ok, true);
  });

  it("rejects a non-numeric timestamp", () => {
    const signature = sign(EVENT_ID, "abc", BODY);
    assert.equal(verifyDodoWebhook(BODY, { id: EVENT_ID, timestamp: "abc", signature }, SECRET).ok, false);
  });

  it("rejects an unknown signature version", () => {
    const timestamp = nowSeconds();
    const signature = sign(EVENT_ID, timestamp, BODY).replace("v1,", "v2,");
    assert.equal(verifyDodoWebhook(BODY, { id: EVENT_ID, timestamp, signature }, SECRET).ok, false);
  });

  it("rejects a bare signature with no version prefix", () => {
    const timestamp = nowSeconds();
    const signature = sign(EVENT_ID, timestamp, BODY).slice("v1,".length);
    assert.equal(verifyDodoWebhook(BODY, { id: EVENT_ID, timestamp, signature }, SECRET).ok, false);
  });

  it("rejects an empty signature", () => {
    assert.equal(
      verifyDodoWebhook(BODY, { id: EVENT_ID, timestamp: nowSeconds(), signature: "" }, SECRET).ok,
      false,
    );
  });

  for (const missing of ["id", "timestamp", "signature"] as const) {
    it(`rejects a delivery with no webhook-${missing} header`, () => {
      const timestamp = nowSeconds();
      const headers = {
        id: EVENT_ID,
        timestamp,
        signature: sign(EVENT_ID, timestamp, BODY),
        [missing]: "",
      };
      assert.equal(verifyDodoWebhook(BODY, headers, SECRET).ok, false);
    });
  }

  it("rejects a malformed secret rather than treating it as an empty key", () => {
    const timestamp = nowSeconds();
    assert.equal(
      verifyDodoWebhook(BODY, { id: EVENT_ID, timestamp, signature: "v1,x" }, "whsec_").ok,
      false,
    );
  });

  it("does not throw on a signature whose length differs from the digest", () => {
    // timingSafeEqual throws on unequal lengths, so the guard has to come first.
    const timestamp = nowSeconds();
    assert.doesNotThrow(() => {
      verifyDodoWebhook(BODY, { id: EVENT_ID, timestamp, signature: "v1,short" }, SECRET);
    });
  });
});
