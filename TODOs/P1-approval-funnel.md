# P1 — Approval funnel

**Phase goal:** Every page with AI-gig intent captures a subscriber, and we can tell real people from crawlers.
**Window:** 2026-09-17 → 2026-10-01 · **Gate:** 2026-10-17 (see [plan.md](./plan.md#day-30-gate-2026-10-17))
**Positioning:** [docs/POSITIONING.md](../docs/POSITIONING.md) v2.0

Other sessions commit to `master` concurrently: `git pull` before starting a task, one commit per task.

---

## 1. Expire stale jobs

Ingestion upserts but never deactivates, so listings gone from the source feeds stay `isActive: true` forever.

- [x] At the end of each source's ingest in `packages/ingestion`, set `isActive = false` for stale jobs (`f5d42b5`). As built: `postedAt` > `JOB_MAX_AGE_DAYS` (30) **and** `lastSeenAt` > `JOB_STALE_DAYS` (3); featured jobs never expire
- [x] Only deactivate a source if its fetch succeeded, so a feed outage doesn't wipe that source (skips when the fetch throws or returns 0 jobs)
- [x] Runs inside the existing 6h cron; **no new timer**
- [ ] Verify after 2026-09-20: active count drops. On 2026-09-17, 421/421 active, no null `lastSeenAt` (column default backfilled), 221 jobs are >30 days old and missing from the latest run, so they should expire on the first run 3 days after they were last seen

## 2. Bot filtering on `/go`

- [x] In the `/go/:id` handler, flag crawler user agents (`packages/api-core/src/bot-filter.ts`, `f5d42b5`). As built: rows are kept with `isBot = true` rather than skipped, so **filter `isBot = false` in every metric query**. Crawlers still get redirected
- [x] Skip repeat clicks from the same `ipHash` on the same target within `REPEAT_CLICK_WINDOW_MS`
- [x] Record `userAgent` on `GigClick` too; columns confirmed in prod 2026-09-17
- [ ] Verify: `curl -A "Googlebot"` the redirect → 302 and no new row; a browser click → one row

## 3. Real signup test

- [x] Homepage approval-alerts payload → row with `source = "home-approval-alerts"`, `wantsGigAlerts = true` (live API, 2026-09-17)
- [x] Homepage prep waitlist payload → row with `source = "prep-waitlist"`; an existing subscriber joining the waitlist is switched to `prep-waitlist` (2026-09-17)
- [~] WhatsApp number: API accepts `+919876543210` and stores it; the in-browser normalization of `+91 98765 43210` is not yet clicked through
- [x] Delete the test rows afterwards (2 `rf-signup-test-*` rows deleted)

## 4. Gig detail pages: Outlier → Mercor → Alignerr

Page: `apps/web/app/ai-gigs/[slug]/page.tsx` (slugs `outlier-ai`, `mercor`, `alignerr`). Ship one platform per commit, in that order.

For each platform:

- [ ] **"How to get approved on {Platform} from India"** section above "Real Earnings from India": eligibility and KYC/ID, the qualification steps, common rejection reasons, realistic review time, payout method in India
- [ ] **Approval-alert capture**: `EmailCapture` with `source = "gig-{slug}-alerts"`, gig alerts on, job alerts off. Copy: "Get notified when {Platform} opens onboarding for your skills"
- [ ] **Prep waitlist capture**: `EmailCapture` with `source = "prep-waitlist"`, platform named in the description
- [ ] Referral CTA stays; keep referral terms in mind (no bonus-sharing language)
- [ ] Guardrail: prep and process only; **no assessment questions or answers**
- [ ] Verify: `pnpm --filter web lint`, page renders with API down (`apiFetch` returns `null`), one live signup lands with the right `source`

Content is the moat. If editorial content lives outside the page file, keep it per-platform (e.g. a content map keyed by slug), not in the DB, until it needs editing without a deploy.

| Platform | Section | Alert capture | Waitlist capture | Live |
|---|---|---|---|---|
| Outlier AI | [ ] | [ ] | [ ] | [ ] |
| Mercor | [ ] | [ ] | [ ] | [ ] |
| Alignerr | [ ] | [ ] | [ ] | [ ] |

## 5. Five approval SEO pages

Model on `apps/web/app/guides/ai-gigs-india-starter` (metadata helper in `apps/web/lib/seo.ts`). Each page: one H1 matching the query, the approval-alert capture (`source = "guide-{slug}"`), the prep waitlist capture, links to the relevant gig detail pages, and an entry in `apps/web/app/sitemap.ts`.

| # | Target query | Route (proposed) | Written | Shipped | In sitemap |
|---|---|---|---|---|---|
| 1 | outlier ai review india | `/guides/outlier-ai-review-india` | [ ] | [ ] | [ ] |
| 2 | outlier assessment failed india | `/guides/outlier-assessment-failed` | [ ] | [ ] | [ ] |
| 3 | mercor interview tips | `/guides/mercor-interview-tips` | [ ] | [ ] | [ ] |
| 4 | alignerr approval time india | `/guides/alignerr-approval-time-india` | [ ] | [ ] | [ ] |
| 5 | ai training jobs india 2026 | `/guides/ai-training-jobs-india-2026` | [ ] | [ ] | [ ] |

- [ ] Only publish pay figures and review times we can source or have collected; no invented user counts
- [ ] Submit the sitemap in Google Search Console after all five ship

## 6. Housekeeping

- [x] Rewrite `plan.md` to match POSITIONING v2 (2026-09-17)
- [x] Tick verified P0 deploy items; drop the 1,000-jobs goal (2026-09-17)
- [x] Uptime-check warning: `/health` only (in `plan.md`)

---

## Exit criteria (2026-10-01)

- [ ] All three gig detail pages and five guides live, each with both captures
- [ ] `/go` clicks exclude crawlers; stale jobs expire on every ingest
- [ ] First week of clean numbers recorded in `plan.md` targets table
