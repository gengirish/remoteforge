# P1 — Monetization & affiliates

**Phase goal:** Activate hire-bounty and gig referral revenue; featured employer slots.

Reference: scaffold Part 5 (revenue model) + affiliate master list.

**Status (2026-09-18): legacy.** Per [plan.md](./plan.md), referrals stay live but no new job-side affiliate or featured-slot work until the Day-30 gate. Current work is in [P1-approval-funnel.md](./P1-approval-funnel.md).

---

## Affiliate enrollment (human tasks)

- [ ] Enroll **Turing.com** referrals (`AFFILIATE_TURING_REF`) — P1, $150–$3k/hire, India fit
- [ ] Enroll **Toptal** Referral Partners (`AFFILIATE_TOPTAL_REF`) — P1, $2k client / $100 talent
- [ ] Activate **Outlier AI** dashboard referral link on gig platform records
- [ ] Document ref URLs in secure ops doc (not committed to git)

## Product wiring

- [ ] Senior-role job detail: show Turing/Toptal CTA when tags match (engineering, senior, etc.)
- [ ] Gig detail: primary CTA uses Outlier/personal referral URL from seed
- [~] `/go/[id]` tracker: log `utmSource`, `referrer`, `ipHash` on every outbound click. Job clicks log all three plus `userAgent`, `isBot`, `isDuplicate`; gig clicks log everything except `referrer`
- [ ] Admin view or SQL query for top clicked jobs/platforms (conversion reporting v1)

## Apply flow strategy

- [ ] Prefer direct company careers URL when available in source
- [ ] WWR/RemoteOK listings → source URL for discovery (no fake affiliate)
- [ ] High-skill roles → Turing/Toptal referral overlay

## Featured employer slots (Razorpay)

- [ ] Complete FeaturedCheckout flow end-to-end in prod
- [ ] Razorpay webhook sets `isFeatured` + `FeaturedSlot` record
- [ ] Employer upsell banner on featured job pages (Vettd cross-sell)
- [ ] Pricing page or modal copy (₹4,999/mo slot — confirm amount)

## Alerts (retention → clicks)

- [x] Weekly email digest: new India-friendly jobs + gig updates. Sent through AgentMail by the Monday cron; `?to=` sends to one address for testing (DEPLOY.md §5)
- [ ] WhatsApp alerts via Sarvam (optional phone on subscribe)
- [~] Unsubscribe / preference management: signed one-click unsubscribe shipped (`f5d42b5`); no preference management yet

## P2 affiliates (defer until P1 stable)

- [ ] FlexJobs ShareASale (`AFFILIATE_FLEXJOBS_ID`) — paywall upsell
- [ ] TopResume / JobCopilot CTAs on resume score flow

---

## Do NOT build

- [ ] ~~WWR TopAccess affiliate CTAs~~ — no public program (re-check quarterly)
- [ ] ~~`AFFILIATE_WWR_REF` CTAs~~ — inactive until confirmed payout

---

## Done when

- [ ] At least 2 P1 affiliate programs live with tracked outbound clicks
- [ ] Featured slot purchase works in prod test mode
- [ ] One digest email sent successfully to test list
