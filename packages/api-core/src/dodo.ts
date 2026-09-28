import { createHmac, timingSafeEqual } from "crypto";

// Dodo Payments is a merchant of record: it is the legal seller, collects GST,
// and issues the invoice. We only ever hand it a product id and metadata, and
// learn the outcome from a webhook — there is no client-side payment SDK.
const TEST_BASE_URL = "https://test.dodopayments.com";
const LIVE_BASE_URL = "https://live.dodopayments.com";

// Standard Webhooks signs a timestamp so a captured request can't be replayed
// later. Anything outside this window is rejected even if the HMAC matches.
const SIGNATURE_TOLERANCE_MS = 5 * 60 * 1000;

export type DodoProduct = "featured" | "premium" | "employerStarter";

// Prices live in the Dodo dashboard, not here. These env vars point at the
// products created there; the paise constants in handlers.ts are only for
// display and as a fallback when a payload omits the amount.
const PRODUCT_ENV_KEYS: Record<DodoProduct, string> = {
  featured: "DODO_PRODUCT_FEATURED",
  premium: "DODO_PRODUCT_PREMIUM",
  employerStarter: "DODO_PRODUCT_EMPLOYER_STARTER",
};

export interface DodoConfig {
  apiKey: string;
  baseUrl: string;
  mode: "test" | "live";
}

export function getDodoConfig(): DodoConfig | null {
  const apiKey = process.env.DODO_PAYMENTS_API_KEY?.trim();
  if (!apiKey) return null;
  // Default to test mode: an unset DODO_MODE must never charge a real card.
  const mode = process.env.DODO_MODE?.trim().toLowerCase() === "live" ? "live" : "test";
  return { apiKey, mode, baseUrl: mode === "live" ? LIVE_BASE_URL : TEST_BASE_URL };
}

export function getDodoProductId(product: DodoProduct): string | null {
  return process.env[PRODUCT_ENV_KEYS[product]]?.trim() || null;
}

export function getDodoWebhookSecret(): string | null {
  return process.env.DODO_WEBHOOK_SECRET?.trim() || null;
}

/**
 * Why callers check this before any DB work: with Dodo unconfigured every
 * checkout click would otherwise run a query first, and waking the Neon
 * compute to then return 503 is pure cost. Returns null when ready.
 */
export function dodoConfigError(product: DodoProduct): string | null {
  if (!getDodoConfig()) return "Payments not configured";
  if (!getDodoProductId(product)) {
    return `Payments not configured (${PRODUCT_ENV_KEYS[product]} unset)`;
  }
  return null;
}

export interface CheckoutSessionInput {
  product: DodoProduct;
  returnUrl: string;
  /** Echoed back on every webhook for this payment or subscription. */
  metadata: Record<string, string>;
  customer?: { email?: string | null; name?: string | null };
}

export type CheckoutSessionResult =
  | { ok: true; sessionId: string; checkoutUrl: string }
  | { ok: false; status: 502 | 503; error: string };

export async function createDodoCheckoutSession(
  input: CheckoutSessionInput,
): Promise<CheckoutSessionResult> {
  const config = getDodoConfig();
  if (!config) return { ok: false, status: 503, error: "Payments not configured" };

  const productId = getDodoProductId(input.product);
  if (!productId) {
    return {
      ok: false,
      status: 503,
      error: `Payments not configured (${PRODUCT_ENV_KEYS[input.product]} unset)`,
    };
  }

  const email = input.customer?.email?.trim();
  const name = input.customer?.name?.trim();

  let res: Response;
  try {
    res = await fetch(`${config.baseUrl}/checkouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        product_cart: [{ product_id: productId, quantity: 1 }],
        return_url: input.returnUrl,
        metadata: input.metadata,
        ...(email ? { customer: { email, ...(name ? { name } : {}) } } : {}),
      }),
    });
  } catch (err) {
    return { ok: false, status: 502, error: err instanceof Error ? err.message : "Checkout request failed" };
  }

  if (!res.ok) {
    return { ok: false, status: 502, error: (await res.text().catch(() => "")) || `Dodo returned ${res.status}` };
  }

  const json = (await res.json().catch(() => null)) as
    | { session_id?: string; checkout_url?: string | null }
    | null;

  // checkout_url is null when a session is confirmed server-side with a saved
  // payment method. We never do that, so its absence is a real failure.
  if (!json?.checkout_url) {
    return { ok: false, status: 502, error: "Dodo did not return a checkout_url" };
  }

  return { ok: true, sessionId: json.session_id ?? "", checkoutUrl: json.checkout_url };
}

export interface DodoWebhookHeaders {
  id: string;
  timestamp: string;
  signature: string;
}

export type VerifyResult = { ok: true } | { ok: false; reason: string };

/**
 * Standard Webhooks verification: HMAC-SHA256 over `{id}.{timestamp}.{body}`,
 * keyed by the base64 secret, compared in constant time.
 */
export function verifyDodoWebhook(
  rawBody: string,
  headers: DodoWebhookHeaders,
  secret: string,
  now: number = Date.now(),
): VerifyResult {
  if (!headers.id || !headers.timestamp || !headers.signature) {
    return { ok: false, reason: "Missing webhook signature headers" };
  }

  const sentAtSeconds = Number(headers.timestamp);
  if (!Number.isFinite(sentAtSeconds)) return { ok: false, reason: "Malformed webhook timestamp" };
  if (Math.abs(now - sentAtSeconds * 1000) > SIGNATURE_TOLERANCE_MS) {
    return { ok: false, reason: "Webhook timestamp outside tolerance" };
  }

  // The secret is base64 once the `whsec_` prefix is stripped.
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  if (key.length === 0) return { ok: false, reason: "Malformed webhook secret" };

  const expected = createHmac("sha256", key)
    .update(`${headers.id}.${headers.timestamp}.${rawBody}`)
    .digest("base64");
  const expectedBuf = Buffer.from(expected);

  // The header carries a space-separated list so secrets can be rotated
  // without dropping in-flight deliveries; any one match is enough.
  const matched = headers.signature.split(" ").some((part) => {
    const separator = part.indexOf(",");
    if (separator < 0) return false;
    if (part.slice(0, separator) !== "v1") return false;
    const candidate = Buffer.from(part.slice(separator + 1));
    return candidate.length === expectedBuf.length && timingSafeEqual(candidate, expectedBuf);
  });

  return matched ? { ok: true } : { ok: false, reason: "Invalid webhook signature" };
}

export interface DodoPaymentPayload {
  payload_type?: "Payment";
  payment_id?: string;
  total_amount?: number;
  currency?: string;
  /** Set when this charge belongs to a subscription cycle. */
  subscription_id?: string | null;
  metadata?: Record<string, string> | null;
}

export interface DodoSubscriptionPayload {
  payload_type?: "Subscription";
  subscription_id?: string;
  status?: string;
  next_billing_date?: string | null;
  previous_billing_date?: string | null;
  recurring_pre_tax_amount?: number;
  currency?: string;
  product_id?: string;
  customer_id?: string;
  metadata?: Record<string, string> | null;
}

export interface DodoRefundPayload {
  payload_type?: "Refund";
  refund_id?: string;
  payment_id?: string;
  metadata?: Record<string, string> | null;
}

export interface DodoWebhookEvent {
  business_id?: string;
  type: string;
  timestamp?: string;
  data: DodoPaymentPayload & DodoSubscriptionPayload & DodoRefundPayload;
}
