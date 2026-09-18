# RemoteForge — Positioning & Monetization

**Version:** 2.0 · September 2026 (replaces v1.0, June 2026)
**Status:** Active direction — approval-led AI gig work; remote jobs secondary
**Owner:** IntelliForge / RemoteForge

---

## 1. What changed from v1.0 and why

v1.0 bet on **comparing** AI gig platforms, paid for by referral and affiliate clicks. After three months the data (production DB, 2026-09-17) says that model will not pay:

| Signal | Number | Read |
|---|---|---|
| Distinct IPs on gig referral clicks, Jun–Sep | ~133 | Real but tiny intent; Outlier leads (24 unique) |
| Job clicks / distinct IPs | 3,146 / 541 | Inflated by crawlers (one week: 230 clicks from 1 IP = every job) |
| Subscribers, users, featured slots, premium, employer subs, referrals | 0 each | No revenue and no owned audience |
| Last job ingested | 2026-06-23 | Cron failing on empty GitHub secrets; job listings stale |
| Signup form | Broken until v2.0 | `handleSubscribe` passed a non-column field to Prisma; every signup threw |

Conclusions:

1. **Comparison isn't the painful part.** Picking a platform is a five-minute Reddit search. The expensive pain comes **after** choosing: failing the assessment, weeks of review limbo, and "approved but no tasks."
2. **Referral income per approved worker × low approval rate × tiny traffic ≈ ₹0.** Keep referrals, but they can't be the business.
3. **The job vertical has no monetization path** (WWR, RemoteOK and Remotive pay no commissions). Keep it for SEO and breadth only.
4. **We had no way to reach anyone again.** An owned WhatsApp/email list is the prerequisite for every revenue stream below.

---

## 2. One-liner

### Primary (use everywhere)

> **RemoteForge helps Indians get approved on AI training platforms — which ones accept India, what they pay, how long approval takes, and how to pass the assessment.**

### Secondary (meta, footer, jobs pages)

> Also: remote jobs that actually hire from India, with INR pay context.

### Elevator (30 seconds)

> Thousands of Indians hear about Outlier, Mercor or Alignerr and apply blind. Half the platforms geo-block India, assessments reject people without saying why, and approved workers sit with empty task queues. RemoteForge is the approval layer: which platforms take you, how to pass their qualification tests, and alerts when onboarding reopens. Free to browse; paid prep when you're serious.

### Do not say

- "Guaranteed approval" / "get hired faster" — we can't promise it, and platforms ban cheating.
- "Answers", "leaked tests", "assessment solutions" — gets users banned and kills the brand.
- User counts or earnings claims we can't back with our own data.
- "Platform" or "marketplace" in consumer copy.

---

## 3. ICP

### Primary — AI gig applicant (India)

| Attribute | Detail |
|---|---|
| **Who** | STEM grads, working coders, Indic-language speakers, students with strong English |
| **Goal** | $15–40/hr from RLHF, evaluation, coding or language tasks |
| **Pain** | Geo-blocks, opaque rejections, long review loops, empty task queues after approval |
| **Hair on fire?** | **Yes** — time-bound (bills, semester break, job loss) and money is on the line |
| **Pays for** | Anything that raises approval odds or shortens time to first paid task |
| **Most valuable segment** | Coders, math/STEM and Indic-language speakers — the scarce expertise platforms pay most for, and what sourcing buyers (§5, stream 3) want |

### Secondary — India remote job seeker

Still served by `/jobs` for SEO and retention. Not a monetization target; no new product investment until the gig side is paying.

### Not ICP (hidden until further notice)

Employers posting jobs, Data API buyers, job-seeker premium subscribers.

---

## 4. Positioning statement (internal)

**For** Indians trying to earn from AI training work,
**who** lose weeks to geo-blocks, failed assessments and empty task queues,
**RemoteForge** is the approval layer
**that** shows which platforms take you and prepares you to pass their qualification tests.
**Unlike** Reddit threads, generic job boards or Remote OK,
**we** are India-first, platform-specific, and focused on what happens after you click apply.

---

## 5. Monetization

**User-facing principle:** Browsing is free. Serious applicants pay for prep. Companies pay for vetted people.

| # | Stream | Buyer | Status | Gate to start |
|---|---|---|---|---|
| 1 | **Assessment prep packs** — practice tasks, rubric walkthroughs, application review; ₹499–₹1,499 per platform (Outlier, Mercor, Alignerr first) | Applicant | **Waitlist live** (`source = "prep-waitlist"`) | ≥ 50 waitlist signups → build the Outlier pack, sell via existing Razorpay |
| 2 | **Referral bonuses** (Outlier, Mercor, others) | Platform | Live | Keep; read each platform's terms before paid promotion |
| 3 | **Sourcing / talent supply** — pay per qualified Indian expert (coders, STEM, Indic languages) | AI data vendors, platforms | Not started | ≥ 1,000 opted-in workers with skill tags |
| 4 | **Community subscription** — task-availability alerts, "who's getting work" WhatsApp group | Applicant | Not started | Stream 1 shows people will pay |

### Stop or hide

| Surface | Action |
|---|---|
| Employer job posts, featured slots (`/employer`) | Footer only; no sales effort |
| Job-seeker premium (`/premium`) | Footer only |
| Data API (`/data-api`) | Developer footer only |
| Hire bounties (Turing, Toptal) | Leave existing CTAs; don't build more |

### Guardrails

- **Prep, never answers.** Nothing that reproduces live assessment content.
- **Referral terms.** Some platforms forbid paid ads on referral links or sharing the bonus with the referee. Check before running either.
- **Honest numbers.** Only show pay bands and approval times we can source or have collected.

---

## 6. Messaging hierarchy

### Layer 1 — Homepage (`apps/web/app/(marketing)/page.tsx`)

```
Eyebrow:     For Indians breaking into AI training work
Headline:    Get approved on AI training platforms from India
Subhead:     Which platforms actually accept Indians, what they pay, how long approval
             takes, and how to pass the assessment — before you lose weeks on the wrong one.
CTA primary:   Find platforms that accept India → /ai-gigs
CTA secondary: Read the approval guide → /guides/ai-gigs-india-starter
Stat pills:  N AI platforms reviewed · N accept India · Also: remote jobs that hire from India → /jobs
```

Then, in order:

1. **Three steps:** Pick a platform that takes you → Pass the assessment → Keep getting tasks
2. **Approval alerts capture** (`source = "home-approval-alerts"`, gig alerts on by default): "Know when a platform opens onboarding for Indians"
3. **Tabs:** AI Gig Work (default) · Remote Jobs · For You (signed in only)
4. **Prep waitlist capture** (`source = "prep-waitlist"`): "Assessment prep packs — join the waitlist"

The job count is left out of the hero on purpose: listings are stale until ingestion is fixed, and jobs aren't the promise.

### Layer 2 — Gig detail page (next to build)

- India eligibility, pay band, payout method, approval timeline
- **"How to get approved on {platform} from India"** section — the editorial moat
- Referral CTA
- Platform-specific approval alert + prep waitlist capture

### Layer 3 — Job pages

Unchanged: India badge, INR context, apply CTA. Cross-link: "Earn while you search → AI gigs that accept India."

---

## 7. Next 30 days

| # | Ship | Why | Status (2026-09-18) |
|---|---|---|---|
| 1 | **Fix ingestion cron** — set the API URL and `CRON_SECRET` repo secrets `.github/workflows/cron.yml` reads | Stale listings undermine trust; the digest cron likely fails the same way | Done 2026-09-17 |
| 2 | **Deploy the subscribe fix + new homepage** | Owned audience starts at 0; this is the first working capture | Done 2026-09-17 (`ed4579a`) |
| 3 | **Approval capture + prep waitlist on gig detail pages** (Outlier, Mercor, Alignerr first) | Where the only real intent is (see §1) | Live (`9787d8c`) |
| 4 | **Five approval SEO pages** | "outlier assessment failed india", "mercor interview tips", "alignerr approval time india", "outlier ai review india", "ai training jobs india 2026" | Live under `/guides/` (`9787d8c`) |
| 5 | **Bot filtering on `/go` click tracking** | Conversion rates are meaningless while crawlers inflate clicks | Done (`f5d42b5`); filter `isBot` and `isDuplicate` |

Tracking: [TODOs/P1-approval-funnel.md](../TODOs/P1-approval-funnel.md).

---

## 8. Metrics that prove the positioning

Measure on **distinct humans**, not raw clicks.

| Metric | Day-30 target | Day-90 target |
|---|---|---|
| Subscribers (any source) | 150 | 1,000 |
| Prep waitlist (`source = "prep-waitlist"` or a `prep-waitlist:*` entry in `signals`) | 50 → build the Outlier pack | First 20 paid packs |
| Gig referral clicks, unique/week | 30 | 100 |
| Share of sessions landing on `/ai-gigs/*` or `/guides/*` | > 40% | > 50% |
| Sourcing conversations with vendors | — | 3 (only if ≥ 1,000 skill-tagged subscribers) |

**Kill criterion:** if the waitlist stays under 25 signups after 30 days with the gig pages live, drop stream 1 and go straight to building the list for stream 3.

---

## 9. Copy bank

### Site metadata (`apps/web/app/layout.tsx`)

```
Title: Get Approved on AI Training Platforms from India (2026) | RemoteForge
Description: Which AI training platforms accept Indians, what Outlier, Mercor, Alignerr and others pay, how long approval takes, and how to pass the assessment. Plus remote jobs that hire from India.
```

### AI gigs listing

```
H1: AI training platforms that accept Indians
Sub: Pay, payout method, and approval time for each — plus how to pass their qualification tests.
```

### Gig detail

```
H2: How to get approved on {Platform} from India
Alert: Get notified when {Platform} opens onboarding for your skills
```

### Remote jobs listing

```
H1: Remote jobs that hire from India
Sub: Filtered listings with INR pay context. No US-only noise.
```

---

## 10. Decision log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06 | Gig-led primary for 90 days | Unfair advantage + hair-on-fire problem + low competition |
| 2026-06 | Demote Premium, Data API, employer hype | Avoid sprawl before consumer PMF |
| 2026-09-17 | **Shift from comparison to approval** | Pain and willingness to pay come after choosing a platform; comparison alone earned nothing |
| 2026-09-17 | **Revenue order: prep packs → referrals → sourcing → community** | Prep can earn now on existing Razorpay; sourcing is bigger but needs an owned worker list first |
| 2026-09-17 | Hide employer, featured slots, premium, Data API | All at 0 with no audience to sell to |
| 2026-09-17 | Fix signup capture before any growth work | Form had failed on every submit; subscriber list was 0 |
