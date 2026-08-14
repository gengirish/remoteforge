---
name: razorpay-integration
description: "Integrate Razorpay payments and RazorpayX payouts into Indian SaaS apps — checkout, subscriptions, vendor payouts to bank accounts, webhook signature verification, idempotency, GST invoicing, TDS handling, and reconciliation. Use when adding Razorpay or RazorpayX, processing payouts to salon partners or vendors in INR, building subscription billing for an Indian SaaS, debugging webhook signature failures, or designing the Razorpay data model in Prisma."
risk: high
source: ChairOS authored
date_added: "2026-05-08"
when_to_use: any Razorpay or RazorpayX work in a Node.js/Next.js codebase targeting India
---

# Razorpay Integration

You are an expert in **Razorpay** and **RazorpayX** for Indian payment flows. This skill covers the full surface area:

- **Razorpay Standard Checkout / Orders API** — collect money from customers (UPI, cards, netbanking, wallets)
- **RazorpayX Payouts** — send money out to vendor bank accounts (Fund Transfers via NEFT/IMPS/RTGS/UPI)
- **Razorpay Subscriptions** — recurring billing
- **Razorpay Route** (briefly) — split-at-charge for marketplaces (different product; usually not what you want)
- **Webhooks** — signed event delivery from Razorpay → your app
- **Compliance** — GST invoicing, TDS deduction, PAN/KYC, Indian financial-year handling

---

## Step 0 — Pick the right product

This is the single most common bug. Razorpay and RazorpayX are **different products with different KYC, dashboards, API endpoints, and pricing**.

| You want to… | Use | Why |
|---|---|---|
| Charge customers (one-off / subscriptions) | **Razorpay** | Orders, Payments, Subscriptions APIs |
| Pay vendors / partners / payroll from your business account | **RazorpayX** | Contacts → Fund Accounts → Payouts (separate KYC) |
| Auto-split a customer payment between you + a vendor at the moment of charge | **Razorpay Route** | One transaction, instant split. Vendor never holds your money. |
| Collect from customer first, then later send vendor's share separately | Razorpay (collect) **+** RazorpayX (pay out) | Two-step flow. Money sits in your bank between. |

**ChairOS / typical commission-based marketplace pattern:** customer pays salon directly (cash/UPI/the salon's own QR) → salon reports session revenue → owner pays salon's share via **RazorpayX Payouts**. The owner never touches customer money on Razorpay's side, so Route is the wrong choice. Use **RazorpayX Payouts only** for this pattern.

If money flows from customer → owner → salon (owner does the collection), then you need **Razorpay (collect) + RazorpayX (payout)**, two products.

If unsure, ask the user: "Who collects payment from the customer — you or the salon?" The answer picks the product.

---

## Step 1 — Environment & SDK

```bash
npm i razorpay
# Optional but recommended:
npm i -D @types/razorpay  # community types; verify they match your installed version
```

```env
# Razorpay (collections)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=          # set per webhook in dashboard

# RazorpayX (payouts) — SAME key id/secret if you've enabled X on the same account,
# OR a separate key if you have a separate RazorpayX account. CHECK YOUR DASHBOARD.
RAZORPAYX_ACCOUNT_NUMBER=          # virtual account number, format: "2323230012345678"
```

### lib/razorpay.ts (canonical client)

```typescript
import Razorpay from "razorpay";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("Razorpay env vars missing");
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// RazorpayX uses the same SDK but hits /v1/payouts, /v1/contacts, /v1/fund_accounts.
// The SDK methods live under razorpay.contacts, razorpay.fundAccount, razorpay.payouts.
```

---

## Step 2 — Money is paise, paise is BigInt

**Never use Float for money.** Razorpay APIs all use integer paise:
- `amount: 14900` means ₹149.00
- `amount: 100` is the **minimum payout** (₹1.00)
- `amount: 50000000` is ₹5,00,000 (NEFT limit varies; IMPS is ₹5L, RTGS is ₹2L+)

In Prisma, store as `BigInt`:

```prisma
model Payout {
  amountPs    BigInt   // paise; can comfortably hold ₹92 quadrillion
  gstPs       BigInt   @default(0)
  tdsPs       BigInt   @default(0)
  totalPs     BigInt
  // ...
}
```

`Int` (PostgreSQL int4) tops out at ~₹21.4 cr cumulative. For a single chair that's fine, but `SELECT SUM(amount_ps)` reports cross that threshold quickly. Use `BigInt`.

When passing to Razorpay's SDK, convert: `Number(amountPs)` — safe up to `Number.MAX_SAFE_INTEGER` (= ₹90 trillion), which is plenty per-transaction.

---

## Step 3 — Idempotency (the bug that costs you the most)

Razorpay's payout API supports an idempotency key via the `X-Payout-Idempotency` header. **Always send one.** A duplicate "Process Payout" click without idempotency double-pays the vendor.

### Schema

```prisma
model Payout {
  id              String   @id @default(cuid())
  idempotencyKey  String   @unique           // your-side dedup
  razorpayPayoutId String? @unique           // Razorpay's id, set after success
  // ...
}
```

### Client call

```typescript
import crypto from "crypto";

async function processPayout(args: {
  contactId: string;
  fundAccountId: string;
  amountPs: bigint;
  notes?: Record<string, string>;
  payoutDbId: string;   // your local Payout.id, used to derive the idempotency key
}) {
  const idempotencyKey = `payout_${args.payoutDbId}`;

  const response = await fetch("https://api.razorpay.com/v1/payouts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Payout-Idempotency": idempotencyKey,
      "Authorization":
        "Basic " +
        Buffer.from(
          `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
        ).toString("base64"),
    },
    body: JSON.stringify({
      account_number: process.env.RAZORPAYX_ACCOUNT_NUMBER,
      fund_account_id: args.fundAccountId,
      amount: Number(args.amountPs),
      currency: "INR",
      mode: "IMPS",                    // or "NEFT" / "RTGS" / "UPI"
      purpose: "payout",
      queue_if_low_balance: true,
      reference_id: args.payoutDbId,
      narration: "ChairOS payout",
      notes: args.notes,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`RazorpayX payout failed: ${JSON.stringify(err)}`);
  }

  return await response.json();
}
```

**Why a fetch + Basic auth instead of the SDK?** The current `razorpay` npm package's `payouts` namespace doesn't expose the `X-Payout-Idempotency` header reliably. Direct HTTP is the safest path. Alternatively, monkey-patch the SDK to add the header.

### Penny-drop verification before first payout

Before the first real payout to a salon partner's account, do a ₹1 penny-drop test (RazorpayX has `Fund Account Validation` API). Log the result on your `SalonPartner` row.

---

## Step 4 — Webhooks (signature verification, idempotency, ordering)

Razorpay sends webhooks for both Razorpay and RazorpayX events. **Three things will hurt you if you skip them:**

1. **Signature verification** — without it, anyone can POST `payment.captured` and trick your DB
2. **Idempotency** — Razorpay retries on 5xx; you'll process the same event twice
3. **Out-of-order delivery** — `payout.processed` may arrive before `payout.initiated`

### Schema for webhook dedup

```prisma
model WebhookEvent {
  id          String   @id @default(cuid())
  provider    String   // "razorpay" | "razorpayx" | "clerk" | "iot"
  eventId     String                       // x-razorpay-event-id header value
  eventType   String                       // "payout.processed", "payment.captured", etc.
  payload     Json
  receivedAt  DateTime @default(now())
  processedAt DateTime?
  error       String?

  @@unique([provider, eventId])
}
```

### Verifier + handler

```typescript
// app/api/webhook/razorpay/route.ts
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();                          // important: raw bytes
  const signature = req.headers.get("x-razorpay-signature");
  const eventId = req.headers.get("x-razorpay-event-id");
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (
    !signature ||
    !crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    )
  ) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody);
  const eventType = body.event;                              // "payout.processed", etc.
  const provider = eventType.startsWith("payout.") ? "razorpayx" : "razorpay";

  // Dedup: try to insert the event; if unique constraint fires, we've seen it.
  try {
    await prisma.webhookEvent.create({
      data: {
        provider,
        eventId: eventId ?? `derived_${body.payload?.payout?.entity?.id ?? Date.now()}`,
        eventType,
        payload: body,
      },
    });
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ ok: true, dedup: true });   // already handled
    }
    throw e;
  }

  // Handle by event type
  switch (eventType) {
    case "payout.processed":
      await handlePayoutProcessed(body.payload.payout.entity);
      break;
    case "payout.failed":
    case "payout.reversed":
      await handlePayoutFailure(body.payload.payout.entity);
      break;
    case "payment.captured":
      await handlePaymentCaptured(body.payload.payment.entity);
      break;
    // …
  }

  await prisma.webhookEvent.update({
    where: { provider_eventId: { provider, eventId: eventId ?? "" } },
    data: { processedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
```

### Critical: raw body for signature

In Next.js App Router, `req.text()` gives you the raw body. **Do NOT** `req.json()` first and then re-stringify — JSON re-serialization changes whitespace and breaks the HMAC.

In Express, use `bodyParser.raw({ type: "application/json" })` for the webhook route specifically.

### Razorpay event reference (the ones you'll actually wire)

| Event | When | What to do |
|---|---|---|
| `payment.captured` | customer payment succeeded | mark order paid, fulfill |
| `payment.failed` | customer payment failed | notify, allow retry |
| `order.paid` | order fully paid | aggregate-level confirmation |
| `subscription.activated` | subscription started | grant access |
| `subscription.charged` | recurring charge succeeded | record invoice |
| `subscription.cancelled` | user cancelled | revoke at period end |
| `payout.processed` | bank confirmed money sent | mark `Payout.status=COMPLETED`, `paidAt=now` |
| `payout.failed` | payout failed | mark `FAILED`, store `failureReason`, alert owner |
| `payout.reversed` | bank reversed payout | mark `FAILED`, revert any internal credit |

---

## Step 5 — Onboarding a vendor (RazorpayX)

Two-step pattern. Both objects live on RazorpayX, not your DB; you store only the IDs.

### Step 5a — Create a Contact

```typescript
const contact = await fetch("https://api.razorpay.com/v1/contacts", {
  method: "POST",
  headers: { /* auth + json */ },
  body: JSON.stringify({
    name: salon.ownerName,
    email: salon.email,
    contact: salon.phone,      // E.164 with +91
    type: "vendor",            // "vendor" | "customer" | "employee" | "self"
    reference_id: salon.id,    // your DB id
    notes: { gstin: salon.gstin ?? "", pan: salon.panNumber ?? "" },
  }),
}).then(r => r.json());

// Store contact.id on SalonPartner.razorpayContactId
```

### Step 5b — Create a Fund Account (bank account)

```typescript
const fundAccount = await fetch("https://api.razorpay.com/v1/fund_accounts", {
  method: "POST",
  headers: { /* ... */ },
  body: JSON.stringify({
    contact_id: contact.id,
    account_type: "bank_account",
    bank_account: {
      name: salon.bankAccountName,
      ifsc: salon.bankIfscCode,
      account_number: salon.bankAccountNumber,
    },
  }),
}).then(r => r.json());

// Store fundAccount.id on SalonPartner.razorpayFundAccountId
```

### Stop storing PII once you have the IDs

After you've created the Contact + Fund Account, **delete `bankAccountNumber` from your DB**. Razorpay holds it; you only need their `fund_account_id` to make a payout. This collapses your PII blast radius from "every salon's full bank details" to "nothing".

If you must keep a fingerprint for UX ("Account ending ••1234"), store the last 4 digits only.

---

## Step 6 — GST invoicing on payouts

**Decide direction first.** In a chair-placement model where the owner pays the salon for placement / commission:
- Salon is the supplier (supplying placement/commission service)
- Salon issues an invoice to owner
- Owner pays salon + GST (if salon is GST-registered)

So `gstPs` rides ON TOP of the salon's share, not deducted from it.

```typescript
function computePayoutAmounts(args: {
  salonSharePs: bigint;
  salonGstRegistered: boolean;
  gstPct?: number;        // default 18
  ownerTdsPct?: number;   // default 2 for §194C; 10 for §194J professional fees
}): { basePs: bigint; gstPs: bigint; tdsPs: bigint; totalPs: bigint } {
  const gstPct = BigInt(args.gstPct ?? 18);
  const tdsPct = BigInt(args.ownerTdsPct ?? 2);

  const basePs = args.salonSharePs;
  const gstPs = args.salonGstRegistered ? (basePs * gstPct) / 100n : 0n;
  const tdsPs = (basePs * tdsPct) / 100n;
  const totalPs = basePs + gstPs - tdsPs;
  return { basePs, gstPs, tdsPs, totalPs };
}
```

**TDS:** Under Indian §194C (works contracts) or §194H (commission), the owner withholds 1–10% TDS on payouts crossing aggregate ₹30k/year per vendor and pays it directly to the government. The vendor receives `total - tds`. You file Form 26Q quarterly. Do not skip this — it's a personal liability for the deductor.

If owner isn't yet a TDS deductor (turnover under audit threshold), set `tdsPct = 0` and document the decision.

### Invoice PDF generation

Use `@react-pdf/renderer`. Required fields on a GST-compliant tax invoice:
1. Words "Tax Invoice"
2. Invoice number (sequential, format `INV/FY26-27/0001`), date
3. Supplier (salon) name + address + GSTIN
4. Recipient (owner / your entity) name + address + GSTIN
5. Place of supply (state — affects IGST vs CGST+SGST split)
6. HSN/SAC code (for chair placement: `999799` "Other miscellaneous services")
7. Description, quantity, taxable value
8. CGST + SGST (intra-state, 9%+9%) **OR** IGST (inter-state, 18%)
9. Total in words
10. Signature

Store the PDF in Supabase Storage. Append-only — never overwrite.

---

## Step 7 — Subscriptions (if you sell ChairOS-as-a-SaaS to other owners)

```typescript
// 1. Create plan (one-time, on deploy)
const plan = await razorpay.plans.create({
  period: "monthly",
  interval: 1,
  item: { name: "ChairOS Pro", amount: 99900, currency: "INR" }, // ₹999/mo
});

// 2. Create subscription per customer
const sub = await razorpay.subscriptions.create({
  plan_id: plan.id,
  total_count: 12,            // 12 monthly charges
  customer_notify: 1,
  notes: { userId: user.id },
});

// 3. Frontend opens Razorpay checkout with sub.id
// 4. Webhook subscription.charged → record invoice
```

---

## Step 8 — Reconciliation

Once a month, pull settlements and match against your `Payout` rows:

```typescript
const settlements = await razorpay.settlements.all({
  from: startOfMonth, to: endOfMonth, count: 100,
});
// settlement.amount is what hit your bank. Compare to sum of Payout.amountPs
// for the same window. Drift > ₹10 means investigate.
```

Razorpay also exposes a `settlements/recon/combined` report — pull it as CSV and reconcile in `xlsx` (use the `anthropic-xlsx` skill).

---

## Common bugs and how to spot them

| Symptom | Root cause | Fix |
|---|---|---|
| `Authentication failed` on `/v1/payouts` | RazorpayX not enabled on this account | Enable RazorpayX in dashboard, redo KYC if needed |
| Payout signature webhook 401 | Re-stringified JSON before HMAC | Use raw body, never `JSON.stringify(req.body)` |
| Webhook fired twice, payout shows up twice in DB | No idempotency on `Payout` row | Add `idempotencyKey @unique` and pass `X-Payout-Idempotency` |
| `INVALID_FUND_ACCOUNT` | Salon's IFSC/account no wrong; bank rejected | Penny-drop test before going live |
| Amount off by 100x | Treating rupees as paise | Audit every place you touch `amount` — should always be paise int |
| Payout `processing` for hours | NEFT outside batch hours / RBI cutoffs | Switch mode to IMPS for sub-₹5L; RTGS for >₹2L. Document SLA in UI. |
| Settlements don't match payout sum | TDS withheld but not subtracted in your reconciliation | Sum `(amountPs + gstPs - tdsPs)` on your side |
| Live mode key works, test mode 401 | Mixed `rzp_test_*` and `rzp_live_*` keys | Force a single env var for the active mode; never both |
| `e.error.description: "Account does not have permission to make payout"` | RazorpayX feature flag not enabled for the account | Email `x.support@razorpay.com` with your account number |

---

## Limits to design around (current as of 2026, verify in dashboard)

| Mode | Per-transaction limit | Speed | Hours |
|---|---|---|---|
| UPI | ₹1L | Seconds | 24×7 |
| IMPS | ₹5L | Seconds | 24×7 |
| NEFT | ₹10L | Up to 2 hrs | RBI batches, 24×7 since 2020 |
| RTGS | ₹2L+ (no upper) | Real-time | 24×7 since 2020 |

Default to `mode: "IMPS"` for payouts up to ₹5L; fall back to `NEFT` above that. Always set `queue_if_low_balance: true` so RazorpayX queues the payout until you top up the X account.

---

## Indian financial year + reporting

- FY runs **April 1 → March 31**. Don't use Jan–Dec for any aggregation — your CA will have to redo everything.
- TDS quarterly filings: **Q1** Apr–Jun (file by 31 Jul), **Q2** Jul–Sep (31 Oct), **Q3** Oct–Dec (31 Jan), **Q4** Jan–Mar (31 May).
- Generate a CSV per quarter with `vendorPan`, `vendorName`, `grossPayoutPs`, `tdsPs`, `tdsSection` (e.g. "194C"). Your accountant feeds this into TRACES.

```typescript
function indianFinancialYear(d: Date): { fyStart: Date; fyLabel: string } {
  // April-March
  const m = d.getMonth();   // 0-indexed
  const y = d.getFullYear();
  const start = m >= 3 ? y : y - 1;
  const fyStart = new Date(start, 3, 1);   // April 1
  const fyLabel = `FY${String(start).slice(2)}-${String(start + 1).slice(2)}`;
  return { fyStart, fyLabel };
}
```

---

## Test mode & local dev

- Razorpay's test mode credentials let you exercise the full flow including webhooks.
- For local webhook delivery, expose your Next.js app via `ngrok http 3000` and register the public URL in the Razorpay dashboard.
- RazorpayX in test mode uses a **fake virtual account number** — your test payouts won't actually move money, but they will trigger the full webhook chain.

```bash
# Local webhook tunnel
ngrok http 3000
# Register https://<random>.ngrok-free.app/api/webhook/razorpay in dashboard
```

---

## Checklist before going live

- [ ] RazorpayX KYC complete (separate from Razorpay KYC)
- [ ] Webhook signature verification implemented and unit-tested with a known body+secret pair
- [ ] `WebhookEvent` table with unique `(provider, eventId)` to dedup retries
- [ ] `Payout.idempotencyKey` unique constraint + `X-Payout-Idempotency` header
- [ ] Penny-drop validation API integrated for new vendor onboarding
- [ ] Bank account numbers no longer stored locally (only `razorpayContactId` + `razorpayFundAccountId`)
- [ ] All money columns are `BigInt` paise, never Float, never `Number` rupees
- [ ] TDS calculation + quarterly export in place (or explicit decision to defer)
- [ ] Tax invoice PDF generator unit-tested for inter-state vs intra-state GST split
- [ ] Reconciliation script that compares Razorpay settlements ↔ your Payout sum, alerts on drift
- [ ] Monitoring: Sentry alert on every `payout.failed` and on settlement drift > ₹10
- [ ] Mode-aware UI: show "expected by 5pm IST" for NEFT, "instant" for IMPS/UPI
- [ ] Live mode environment variables are set in Vercel/Fly, not committed to repo
- [ ] One human approval step required for the first payout > ₹50k to any new vendor

---

## Don'ts

- **Don't** use Razorpay Route as a "marketplace splitter" if you also need to handle reversals and chargebacks per leg. Route splits at charge time and assumes the customer payment is final.
- **Don't** call the payout API from the browser. Always server-side.
- **Don't** retry a 5xx payout request without the idempotency header — every retry is a potential duplicate.
- **Don't** rely on Razorpay's polling (`GET /payouts/:id`) instead of webhooks. Webhooks are the source of truth; polling is for reconciliation.
- **Don't** store CVV, full card numbers, or full bank account numbers. PCI-DSS scope explosion.
- **Don't** assume `payout.processed` means the bank has credited the vendor — it means Razorpay handed it to the rails. The vendor's bank may take longer for NEFT.

---

## When to escalate

- Settlement drift you can't explain → Razorpay support with the settlement ID + your local Payout IDs
- Vendor reports payout received in their bank but `payout.processed` webhook never fired → check `WebhookEvent` table, then Razorpay dashboard's Webhook Logs
- KYC stuck → email `x.support@razorpay.com` with account number; CC your relationship manager if you have one
- Anything involving > ₹10 lakh in a single payout: pause, run the reconciliation script first, then process

---

*Authored 2026-05-08 from ChairOS introspection notes. Update this file as Razorpay's API evolves — they ship breaking changes more often than they admit.*
