# RemoteForge — Master Plan

**Last updated:** 2026-09-18
**Positioning:** [docs/POSITIONING.md](../docs/POSITIONING.md) v2.0: help Indians **get approved on AI training platforms**; remote jobs are secondary
**Replaces:** the June 2026 plan ("India's home for remote jobs and AI gig work", >1,000 jobs goal)

---

## Targets that matter (read first)

Count **distinct humans**, not raw clicks: crawlers inflated job clicks ~6× in Jun–Sep.

| Metric | Now (2026-09-17) | Day 30 (2026-10-17) | Day 90 (2026-12-16) |
|---|---|---|---|
| **Prep waitlist** (`source = "prep-waitlist"` or a `prep-waitlist:*` signal) | 0 | **50 → build the Outlier pack** | 20 paid packs |
| **Subscribers** (any source) | 0 (form was broken until 2026-09-17) | 150 | 1,000 |
| Gig referral clicks, unique IPs/week | ~10 | 30 | 100 |
| Sessions landing on `/ai-gigs/*` or `/guides/*` | unmeasured | > 40% | > 50% |

### Day-30 gate (2026-10-17)

| Prep waitlist | Decision |
|---|---|
| **≥ 50** | Build the Outlier assessment prep pack; sell via existing Razorpay checkout |
| **25–49** | Extend 2 weeks; add the waitlist capture to more guide pages |
| **< 25** | Drop prep packs. Put all capture effort into a skill-tagged worker list for sourcing (stream 3 in POSITIONING §5) |

Check it with:

```sql
select source, count(*) from "Subscriber" group by 1 order by 2 desc;

-- Prep waitlist. A new signup from a guide page keeps source = 'guide-{slug}'
-- and records the intent only in signals, so count both.
select count(*) from "Subscriber"
where source = 'prep-waitlist'
   or exists (select 1 from unnest(signals) s where s like 'prep-waitlist:%');

-- Per-platform intent
select s as signal, count(*) from "Subscriber", unnest(signals) s group by 1 order by 2 desc;
```

Run it once, by hand. Never put it on a timer or dashboard poll (see Cost guardrail).

---

## Phase status

| Phase | Status | Tasks |
|---|---|---|
| P0 — Production stable | **Mostly done** (deploy, cron, region, auth) | [P0-production-launch.md](./P0-production-launch.md) |
| **P1 — Approval funnel** (current) | **In progress** | [P1-approval-funnel.md](./P1-approval-funnel.md) |
| P1 — Affiliates (legacy) | Partial; referrals stay live, no new job-side affiliate work | [P1-monetization-affiliates.md](./P1-monetization-affiliates.md) |
| P2 — Companies & jobs SEO | **Deferred** until the Day-30 gate | [P2-companies-and-seo.md](./P2-companies-and-seo.md) |
| P3 — Integrations | Deferred | [P3-integrations.md](./P3-integrations.md) |

---

## Current 2-week plan (2026-09-17 → 2026-10-01)

Detail and acceptance criteria: [P1-approval-funnel.md](./P1-approval-funnel.md).

### This week: make the funnel measurable

1. **Expire stale jobs**: shipped (`f5d42b5`); confirm the active count drops after 2026-09-20
2. **Bot filtering on `/go`**: shipped (`f5d42b5`); crawler and repeat clicks are flagged `isBot` / `isDuplicate`, so filter both in every metric
3. **Real signup test**: homepage captures verified 2026-09-17; WhatsApp normalization still to click through

### Next 2 weeks: capture where the intent is

4. **Gig detail pages** for Outlier, Mercor and Alignerr: shipped and live (`9787d8c`); live signup test pending
5. **Five approval SEO pages** (POSITIONING §7): shipped and in the sitemap (`9787d8c`); Search Console submission pending

### Housekeeping

6. **This file**: done 2026-09-17, refreshed 2026-09-18

---

## Cost guardrail: uptime checks on `/health` only

Neon scales to zero after 5 min idle; anything that touches Postgres on a shorter interval bills 24/7 (this cost ~$33/mo before).

- Uptime monitors, Fly checks, and status pages point at **`/health`** only (liveness, no DB).
- **Never** poll `/api/health/deep`, `/api/home`, `/api/gigs`, or any DB-backed route on a schedule.
- The only recurring DB touches allowed are the GitHub Actions crons (ingest every 6h, digest Mondays).
- Metrics above are read by hand, not by a scheduled job.

---

## Hidden / not building

| Surface | Why |
|---|---|
| `/employer`, featured slots | 0 sales, no audience to sell to |
| `/premium` (job-seeker) | Weak wedge vs free; conflicts with positioning |
| `/data-api` | B2B motion; needs data density first |
| New job-board affiliates, `/companies` expansion | Jobs have no monetization path (WWR/RemoteOK/Remotive pay nothing) |
| ">1,000 active jobs" goal | **Dropped**: job volume doesn't serve the approval promise |

---

## Key decisions

| Date | Decision |
|---|---|
| 2026-06 | No WWR TopAccess affiliate (no public program); WWR/RemoteOK are discovery links only |
| 2026-09-17 | Positioning v2.0: approval, not comparison; revenue order prep packs → referrals → sourcing → community |
| 2026-09-17 | Prep content only, never assessment answers |
| 2026-09-17 | Fly region `sin` (`bom` deprecated by Fly) |
| 2026-09-17 | Signed-in user comes from a verified Clerk token, not `X-Clerk-User-Id` |
| 2026-09-17 | Canonical domain is `remoteforge.intelliforge.tech`; `remoteforge.in` does not resolve |
| 2026-09-17 | Per-platform intent is a `Subscriber.signals` entry (`approval-alert:{slug}`, `prep-waitlist:{slug}`), not a per-platform `source` |

---

## References

- Positioning and monetization: [docs/POSITIONING.md](../docs/POSITIONING.md)
- Deploy runbook: [DEPLOY.md](../DEPLOY.md)
- Original architecture spec: [remotejobs-affiliate-engine-scaffold-prompt.md](../remotejobs-affiliate-engine-scaffold-prompt.md)
