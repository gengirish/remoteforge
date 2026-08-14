---
name: whatsapp-notifications
description: WhatsApp notifications via Twilio (sandbox) and AiSensy/Gupshup (production) for LocalFlash. Use when sending claim codes, daily digests, merchant alerts, subscription renewals, or any consumer/merchant message via WhatsApp. Covers F9 (production WhatsApp), F11 (daily digest), and F4 (claim code delivery) from YC_FEATURES.md.
---

# LocalFlash WhatsApp + Notifications

> Patterns ported from a sister Next.js + Twilio project. When applying to LocalFlash, swap the event table and templates for LocalFlash flows (offer claims, digests, merchant alerts) and add an AiSensy/Gupshup adapter behind the same `sendWhatsApp()` interface so we can switch BSPs without rewriting callers.

## Channels

1. **In-app** — Bell icon with unread count badge. Stored in `notifications` table.
2. **WhatsApp** — Via Twilio API. Sent on key business events.

## WhatsApp via Twilio

```typescript
// lib/notifications/whatsapp.ts
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function sendWhatsApp(to: string, body: string): Promise<void> {
  if (!to || !body) return;
  const phone = to.startsWith('+') ? to : `+91${to}`;
  await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM!,
    to: `whatsapp:${phone}`,
    body,
  });
}
```

## Notification Events (LocalFlash)

| Event | Channel | Recipients | Template |
|-------|---------|-----------|----------|
| Claim created | WhatsApp | Consumer | `claim_code` |
| Claim expiring soon (5 min before) | WhatsApp | Consumer (opt-in) | `claim_expiring` |
| Daily digest (8 AM IST) | WhatsApp | Opted-in consumers | `daily_digest` |
| Saved offer expiring (2h) | WhatsApp | Consumer | `saved_expiring` |
| Offer claimed by customer | WhatsApp + In-app | Merchant OWNER | `merchant_alert` |
| Offer paused (limit hit) | In-app | Merchant OWNER + STAFF | `offer_paused` |
| Subscription renewed | WhatsApp | Merchant OWNER | `subscription_renew` |
| Subscription payment failed | WhatsApp + In-app | Merchant OWNER | `dunning` |
| Wallet low balance (<₹100) | WhatsApp | Merchant OWNER | `wallet_low` |
| Referral reward earned | WhatsApp + In-app | Referring merchant | `referral_reward` |

## Message Templates

All templates in `src/lib/whatsapp/templates.ts`. Use emoji for visual scanning. Include `*LocalFlash*` branding. Key data in bold (`*text*`). All templates must be Meta-approved before production use.

```typescript
export const T = {
  claimCode: (code: string, storeName: string) =>
    `🎟️ *LocalFlash code: ${code}*\nShow at *${storeName}*. Expires in 30 min.`,

  dailyDigest: (offers: { title: string; storeName: string }[], shortUrl: string) =>
    `🔥 *Top offers near you today*\n` +
    offers.map((o, i) => `${i + 1}. ${o.title} @ ${o.storeName}`).join('\n') +
    `\n\nTap → ${shortUrl}`,

  merchantAlert: (customerNameMasked: string, offerTitle: string) =>
    `✅ *${customerNameMasked}* just claimed your offer "*${offerTitle}*".`,

  subscriptionRenew: (planName: string, dateIST: string, amountINR: string) =>
    `🔄 Your *LocalFlash ${planName}* renews on *${dateIST}* for *${amountINR}*.`,
};
```

## In-App Notification Schema

```typescript
interface Notification {
  id: string;
  orgId: string;
  recipientId: string;
  type: string;           // e.g., 'order_submitted', 'tour_plan_approved'
  title: string;
  body?: string;
  channel: 'in_app' | 'whatsapp' | 'email';
  referenceId?: string;   // Link to related entity
  referenceType?: string; // 'order', 'tour_plan', 'expense_report', etc.
  isRead: boolean;
  sentAt?: Date;
  createdAt: Date;
}
```

## Key Rules

1. **Always wrap WhatsApp calls in try/catch** — don't let provider failure break the main flow (claim creation, payment, etc.)
2. **Indian phone format** — prepend `+91` if not already present, validate with `+91XXXXXXXXXX` regex
3. **All amounts in templates use `formatINR()`** — display ₹, not raw paise
4. **Dates in templates use DD/MM/YYYY IST** via `toIST()` helper
5. **Provider abstraction** — `sendWhatsApp()` should hide whether Twilio (sandbox), AiSensy, or Gupshup is the BSP. Switch via `WHATSAPP_PROVIDER` env var.
6. **Frequency caps** — max 1 daily digest/day, max 2 push/day per consumer (enforce in cron, not template)
7. **Delivery webhook** — log delivery status to `Claim`/`Subscription`/`NotificationLog` for debugging
8. **DPDP-compliant consent** — opt-in toggle in consumer profile, default ON post-onboarding with clear consent text
9. **Never send to consumers with 0 offers in radius** — skip silently rather than spam
10. **Skip raw phone numbers in any frontend response** — mask to last 4 digits for merchant UI
