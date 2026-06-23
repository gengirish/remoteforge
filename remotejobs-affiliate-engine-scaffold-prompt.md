# RemoteForge — Remote Jobs + AI Gig Work Affiliate Engine
## Complete Architecture + Cursor Scaffold Prompt
### IntelliForge Digital Services | IF-PROD-2026-REMOTEJOBS-v2

---

## PART 1 — COMPETITION ANALYSIS (Real Data)

### Remote Jobs Market

| Platform | Monthly Traffic | Revenue Model | Job Post Price | Affiliate? | Weakness |
|---|---|---|---|---|---|
| We Work Remotely | 6M visits | Employer posts + candidate subs ($15–30/mo) | $299/mo (employers) | No (see below) | Paywalls apply; TopAccess bundles competitors |
| Remote OK | 600–800K visits | Employer posts | $599–$4,143 | No | Solo project, no SEO content; bundled in WWR TopAccess |
| Remotive | ~500K visits | Free API + employer | $299 | No | Thin filtering |
| FlexJobs | 5.2M visits | Candidate pays $47–$99/mo | N/A | Yes (ShareASale) | Paywalls candidates |
| Remote.co | 1.3M visits | Employer posts | ~$299 | No | Limited categories |
| Working Nomads | 1.3M visits | Employer posts | ~$150 | No | Minimal SEO |

WWR revenue ~$6M/year. Remote OK $3.4M solo-founder. India is Remote OK's #1 traffic source — but they give zero India-specific UX. That's the wedge.

### WWR TopAccess — Competitive Intel (Jun 2026)

WWR has pivoted from employer-only to a **dual revenue model** (employer posts + candidate subscriptions). They now compete directly with aggregators like RemoteForge — but paid and US-centric.

| Plan | Price | Commitment | Scope |
|---|---|---|---|
| Basic (Free) | $0 | None | Browse, save jobs, upload resume, follow companies |
| WWR Pro | $2.95 first mo → $14.95/mo | 12 months | Unlimited applies, 5 job alerts, subscriber events |
| TopAccess Bundle | $29.95/mo | 12 months | Pro + Toptal + Arc + PeoplePerHour + Remote OK + NoDesk |

**TopAccess claimed value**: $180+/mo bundled for $29.95/mo. Same aggregation thesis as RemoteForge — but paywalled with a 12-month lock-in and zero India-specific UX.

**Apply flow risk**: WWR Pro is required for "unlimited job applications." Outbound apply links to `weworkremotely.com` may hit a paywall. RSS ingestion likely still works for discovery; monitor API/RSS stability as Remote OK is now bundled.

**RemoteForge positioning vs TopAccess**: Free discovery · India filters + INR pay context · WhatsApp alerts · AI gig vertical WWR doesn't touch. Content angle: "WWR TopAccess vs free job aggregators."

### WWR Affiliate Investigation — No Public Program

**Verdict (Jun 2026)**: No public third-party affiliate or referral program for WWR Pro or TopAccess. Not on ShareASale/Awin, Impact, or similar networks. Job-board directories list WWR alongside Remote OK as having zero public affiliate programs.

| WWR "program" | Who it's for | Payout | RemoteForge useful? |
|---|---|---|---|
| TopAccess Performance Rewards | TopAccess subscribers only | Up to $500 cash (Toptal/Arc at $1k earnings) or $100 sub credit (Upwork/Fiverr) | No — subscriber retention, not publisher CPA |
| Sponsorships | B2B advertisers | Custom deals via partnerships@weworkremotely.com | Maybe later (newsletter/ads), not recurring affiliate |
| `?ref=` param | Unknown / unverified | None confirmed | **Inactive** — do not build CTAs around WWR TopAccess onboarding |

**Do not compete on bundling paid subs.** Compete on free discovery + India UX + hire-bounty CPA (Turing, Toptal).

**Monetization stack for WWR-sourced jobs**:
```
User finds job on RemoteForge (free)
  ├─ Direct apply (company careers page) — best UX, no commission
  ├─ High-skill role → Turing / Toptal referral CTA ($100–$3,000 CPA)
  ├─ WWR/RemoteOK listing → link to source for discovery only (no affiliate)
  └─ Optional: FlexJobs upsell for paywall seekers (15–30% recurring, P2)
```

### AI Gig Work Market

| Platform | Pay Range | India? | Onboarding | Referral Program | Weakness |
|---|---|---|---|---|---|
| Outlier AI (Scale AI) | $20–$40/hr (STEM: up to $50) | Yes (100+ countries) | 1–7 days | Yes — dashboard referrals | Task availability inconsistent |
| DataAnnotation.tech | $20–$40/hr | No (US/UK/CA/AU/NZ only) | 3–14 days | No | Geo-blocked for India |
| Alignerr (Labelbox) | $20–$35/hr | Yes | 1–4 weeks | No | Newer, still scaling |
| Appen | $9–$20/hr | Yes (170+ countries) | 2–6 weeks | No | Slow onboarding, low pay |
| TELUS International | $12–$15/hr | Yes | 2–8 weeks | No | Lower rates |
| Prolific | Research tasks | Yes | Same-day | No | Low volume |
| Toloka / Clickworker | $1–$10/hr | Yes | Same-day | No | Micro-task, very low pay |

**Key insight**: No aggregator surfaces India eligibility, pay ranges, onboarding timelines, and referral links in one place. That's your content moat + referral income stream.

### Affiliate Programs Master List

| Program | Type | Commission | Cookie | Priority |
|---|---|---|---|---|
| Turing.com | Remote jobs + AI gigs | $150–$3,000/hire (turing.com/referrals) | 90 days | P1 |
| Toptal | Remote jobs | $2,000/client hire · $100/talent accepted | 30 days | P1 |
| Remote.com | Remote jobs | 10–15% recurring | 90 days | P1 |
| Outlier AI | AI gigs | Dashboard referral (cash) | N/A | P1 |
| FlexJobs | Remote jobs | 15–30% subscription (ShareASale) | 30 days | P2 |
| JobCopilot | Career tool | 30% recurring | 30 days | P2 |
| TopResume | Resume service | 20% per sale | 30 days | P2 |
| Jooble | Job board | CPC + CPA | Net45 | P3 |
| ~~WWR TopAccess~~ | ~~Candidate sub~~ | ~~None — no public program~~ | — | **N/A** |

**Toptal note**: TopAccess bundles Toptal access, but signups through WWR TopAccess do **not** credit `AFFILIATE_TOPTAL_REF`. Always use direct Toptal referral links on job detail CTAs.

**WWR note**: `AFFILIATE_WWR_REF` retained in env for future use but **inactive** — no confirmed payout. Re-check quarterly via partnerships@weworkremotely.com.

---

## PART 2 — COMPLETE PRODUCT ARCHITECTURE

**Product name**: RemoteForge
**Domain**: remoteforge.in / remotejobs.intelliforge.tech
**Tagline**: "India's home for remote jobs and AI gig work"

### Two-Vertical Model

```
┌─────────────────────────────────────────────────────────────────┐
│                     REMOTEFORGE PLATFORM                         │
│                                                                  │
│  ┌──────────────────────┐   ┌──────────────────────────────┐   │
│  │   VERTICAL 1         │   │   VERTICAL 2                 │   │
│  │   Remote Jobs        │   │   AI Gig Work                │   │
│  │                      │   │                              │   │
│  │  Remotive API        │   │  Outlier · Appen             │   │
│  │  WWR RSS             │   │  TELUS · Alignerr            │   │
│  │  RemoteOK JSON       │   │  DataAnnotation              │   │
│  │  ATS scrapers        │   │  80+ annotation cos          │   │
│  │                      │   │                              │   │
│  │  Audience:           │   │  Audience:                   │   │
│  │  Career switchers    │   │  Students, freelancers       │   │
│  │  Engineers           │   │  MTech grads                 │   │
│  │  Designers           │   │  Side-income seekers         │   │
│  └──────────────────────┘   └──────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              SHARED INFRASTRUCTURE                        │   │
│  │  BullMQ workers · Supabase · /go/[id] tracker            │   │
│  │  WhatsApp alerts · Email digest · SEO page gen           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Full System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     INGESTION LAYER                              │
│                                                                  │
│  Remote Jobs sources:          AI Gig sources:                  │
│  Remotive API (free JSON)      GigPlatform seed data (manual)   │
│  WWR RSS feed                  Outlier jobs API (if available)   │
│  RemoteOK JSON API             Company careers pages (scrape)   │
│  Greenhouse / Lever ATS        dataannotationcompanies.com      │
└──────────────────────────┬──────────────────────────────────────┘
                           │ BullMQ workers (every 6h)
┌──────────────────────────▼──────────────────────────────────────┐
│                   PROCESSING LAYER                               │
│  Dedup (title+company hash)    India eligibility tagging        │
│  Schema normalisation          Pay range extraction (USD)       │
│  Slug generation               INR conversion (env rate)        │
│  Tag extraction (NLP)          Onboarding timeline parsing      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                   DATA LAYER (Supabase / Prisma)                 │
│  Job · GigPlatform · JobClick · GigClick                        │
│  Subscriber · FeaturedSlot · BlogPost (MDX)                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                   WEB LAYER (Next.js 14 App Router)             │
│                                                                  │
│  /                         Landing — hero tabs Remote / AI Gig  │
│  /jobs                     Remote job listings (ISR 1h)         │
│  /jobs/[slug]              Individual job page (SSG)            │
│  /jobs/category/[cat]      Category pages (ISR)                 │
│  /jobs/tag/[tag]           Tag pages (ISR) — SEO moat           │
│  /ai-gigs                  AI gig platform comparison (ISR)     │
│  /ai-gigs/[slug]           Platform detail page (SSG)           │
│  /go/[id]                  Unified affiliate redirect tracker   │
│  /api/jobs                 Paginated job listing API            │
│  /api/gigs                 Gig platform listing API             │
│  /api/subscribe            Email + WhatsApp alert signup        │
│  /api/jobs/ingest          Cron trigger (Bearer token)          │
│  /api/webhooks/razorpay    Featured slot payment webhook        │
└─────────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                   MONETIZATION LAYER                             │
│                                                                  │
│  Remote Jobs:                  AI Gig Work:                     │
│  Hire-bounty CPA (Turing,      Outlier referral (dashboard)     │
│    Toptal — NOT WWR subs)      Platform comparison content      │
│  FlexJobs sub upsell (P2)      "How to get approved" guides     │
│  Employer featured slots       Email digest (AI gig alerts)     │
│  Resume review (Razorpay)                                       │
│  Email newsletter sponsors                                      │
└─────────────────────────────────────────────────────────────────┘
```

### Database Schema (Prisma — Full)

```prisma
// packages/@intelliforge/db/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── REMOTE JOBS VERTICAL ────────────────────────────────────────

model Job {
  id            String    @id @default(cuid())
  slug          String    @unique
  title         String
  company       String
  companyLogo   String?
  description   String
  tags          String[]
  salaryMin     Int?      // USD cents
  salaryMax     Int?
  currency      String    @default("USD")
  location      String    @default("Remote")
  category      String    // "engineering" | "design" | "marketing" | "sales" | "support" | "writing" | "product"
  sourceBoard   String    // "remotive" | "wwr" | "remoteok" | "greenhouse" | "lever"
  sourceId      String
  sourceUrl     String
  affiliateUrl  String?
  isActive      Boolean   @default(true)
  isFeatured    Boolean   @default(false)
  indiaFriendly Boolean   @default(true)  // false if explicitly US-only
  postedAt      DateTime
  expiresAt     DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  clicks        JobClick[]
  featuredSlot  FeaturedSlot?

  @@unique([sourceBoard, sourceId])
  @@index([category, isActive])
  @@index([postedAt(sort: Desc)])
  @@index([isFeatured, isActive])
}

model JobClick {
  id          String   @id @default(cuid())
  jobId       String
  job         Job      @relation(fields: [jobId], references: [id])
  utmSource   String?
  utmMedium   String?
  utmCampaign String?
  ipHash      String?
  userAgent   String?
  referrer    String?
  converted   Boolean  @default(false)
  createdAt   DateTime @default(now())

  @@index([jobId])
  @@index([createdAt(sort: Desc)])
}

// ─── AI GIG WORK VERTICAL ────────────────────────────────────────

model GigPlatform {
  id                String    @id @default(cuid())
  slug              String    @unique
  name              String    // "Outlier AI", "Appen", "TELUS International"
  logoUrl           String?
  description       String
  type              String    // "rlhf" | "annotation" | "evaluator" | "multilingual" | "microtask"
  specialties       String[]  // ["code", "math", "writing", "image", "translation"]

  // India eligibility
  indiaAccepted     Boolean
  indiaPayNote      String?   // "Pay scales to $8-12/hr for India region"

  // Pay
  payMin            Int       // USD cents per hour
  payMax            Int
  payNote           String?   // "Expert tier $40-50/hr requires STEM PhD"

  // Onboarding
  onboardingDays    String    // "1-7", "7-14", "14-42"
  onboardingNote    String?   // key gotchas

  // Monetization
  referralUrl       String?   // your personal referral link (Outlier dashboard)
  affiliateUrl      String?   // if separate affiliate program
  referralReward    String?   // "Cash per approved referral"

  // Trust signals
  trustpilotScore   Float?
  trustpilotCount   Int?
  founded           Int?

  // Status
  isActive          Boolean   @default(true)
  isFeatured        Boolean   @default(false)
  sortOrder         Int       @default(0)

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  clicks            GigClick[]

  @@index([type, isActive])
  @@index([indiaAccepted, isActive])
}

model GigClick {
  id            String      @id @default(cuid())
  platformId    String
  platform      GigPlatform @relation(fields: [platformId], references: [id])
  clickType     String      // "apply" | "referral" | "guide"
  utmSource     String?
  utmMedium     String?
  ipHash        String?
  createdAt     DateTime    @default(now())

  @@index([platformId])
  @@index([createdAt(sort: Desc)])
}

// ─── SHARED MODELS ───────────────────────────────────────────────

model Subscriber {
  id              String   @id @default(cuid())
  email           String   @unique
  phone           String?  // E.164 for WhatsApp
  // Job alert prefs
  jobCategories   String[]
  jobTags         String[]
  // Gig alert prefs
  gigTypes        String[] // "rlhf" | "annotation" etc
  wantsGigAlerts  Boolean  @default(false)
  // Settings
  frequency       String   @default("weekly") // "daily" | "weekly"
  source          String   @default("web")
  isVerified      Boolean  @default(false)
  createdAt       DateTime @default(now())
}

model FeaturedSlot {
  id           String   @id @default(cuid())
  jobId        String   @unique
  job          Job      @relation(fields: [jobId], references: [id])
  razorpayId   String?
  amountPaise  Int      // INR paise
  startsAt     DateTime
  expiresAt    DateTime
  createdAt    DateTime @default(now())
}
```

---

## PART 3 — CURSOR SCAFFOLD PROMPT

Paste this entire block into Cursor as your project initialization prompt:

---

```
You are building "RemoteForge" — an AI-native platform aggregating remote jobs AND AI gig work
(data annotation, RLHF, SFT evaluation roles) for the Indian market.

Tech stack: Next.js 14 App Router, TypeScript, Prisma, Supabase (PostgreSQL), Clerk auth,
Razorpay, BullMQ + Redis (Fly.io bom region), Tailwind + shadcn/ui, Turborepo monorepo.
Conventions: integer paise for INR, E.164 phones, IST timestamps, DD/MM/YYYY dates,
ApiResponse<T> envelope on all API routes, Zod on all inputs. USD_TO_INR from env (default 84).

Scaffold the following Turborepo monorepo structure COMPLETELY — generate every file in full:

remoteforge/
├── apps/
│   └── web/                               # Next.js 14 App Router
│       ├── app/
│       │   ├── (marketing)/
│       │   │   ├── page.tsx               # Landing: hero with two tabs "Remote Jobs" / "AI Gig Work"
│       │   │   └── layout.tsx
│       │   ├── jobs/
│       │   │   ├── page.tsx               # /jobs — filtered listing, ISR 1h
│       │   │   ├── [slug]/
│       │   │   │   └── page.tsx           # /jobs/[slug] — individual job SSG + JSON-LD
│       │   │   ├── category/
│       │   │   │   └── [cat]/
│       │   │   │       └── page.tsx       # /jobs/category/[cat] — ISR
│       │   │   └── tag/
│       │   │       └── [tag]/
│       │   │           └── page.tsx       # /jobs/tag/[tag] — ISR, SEO moat
│       │   ├── ai-gigs/
│       │   │   ├── page.tsx               # /ai-gigs — platform comparison grid, ISR 1h
│       │   │   └── [slug]/
│       │   │       └── page.tsx           # /ai-gigs/[slug] — platform detail SSG
│       │   ├── go/
│       │   │   └── [id]/
│       │   │       └── route.ts           # Unified redirect tracker — handles both Job and GigPlatform
│       │   └── api/
│       │       ├── jobs/
│       │       │   ├── route.ts           # GET /api/jobs — paginated, Zod query params
│       │       │   └── ingest/
│       │       │       └── route.ts       # POST /api/jobs/ingest — cron trigger, Bearer auth
│       │       ├── gigs/
│       │       │   └── route.ts           # GET /api/gigs — platform list with filters
│       │       ├── subscribe/
│       │       │   └── route.ts           # POST /api/subscribe — email + WhatsApp opt-in
│       │       └── webhooks/
│       │           └── razorpay/
│       │               └── route.ts       # Razorpay webhook for featured slot payments
│       ├── components/
│       │   ├── job-card.tsx               # Remote job card — salary in USD + INR, tags, affiliate CTA
│       │   ├── gig-platform-card.tsx      # AI gig card — pay range, India badge, onboarding time, referral CTA
│       │   ├── job-filters.tsx            # Category, tag, salary, India-friendly toggle
│       │   ├── gig-filters.tsx            # Type (rlhf/annotation/evaluator), India-only toggle, pay filter
│       │   ├── search-bar.tsx             # Debounced, shared across both verticals
│       │   ├── salary-badge.tsx           # "$20–$40/hr · ₹1,680–₹3,360/hr"
│       │   ├── india-badge.tsx            # Green "India ✓" or Red "India ✗" pill
│       │   ├── onboarding-timeline.tsx    # Visual days-to-start indicator for gig platforms
│       │   └── email-capture.tsx          # Newsletter + WhatsApp subscribe with vertical preference
│       └── lib/
│           ├── affiliate.ts               # wrapAffiliateLink + getRedirectTarget (Job | GigPlatform)
│           ├── seo.ts                     # generateMetadata helpers for job and gig pages
│           └── currency.ts               # usdToInr(cents: number): string — reads USD_TO_INR env
│
├── workers/
│   └── ingestion/                         # Fly.io worker (bom region)
│       ├── src/
│       │   ├── index.ts                   # BullMQ Worker bootstrap, registers all queues
│       │   ├── sources/
│       │   │   ├── remotive.ts            # GET https://remotive.com/api/remote-jobs?limit=100
│       │   │   ├── wwr.ts                 # Parse WWR RSS feed → normalized jobs
│       │   │   └── remoteok.ts            # GET https://remoteok.com/api — JSON array
│       │   ├── processors/
│       │   │   ├── normalize-job.ts       # Maps raw source → Prisma Job shape
│       │   │   ├── normalize-gig.ts       # Maps raw platform data → Prisma GigPlatform shape
│       │   │   ├── dedup.ts               # Hash(title+company) or Hash(name) dedup
│       │   │   ├── slug.ts                # generateSlug(title, company) → url-safe unique string
│       │   │   ├── tags.ts                # extractTags(description) → string[] tech tags
│       │   │   └── india-check.ts         # detectIndiaEligibility(description, sourceBoard) → boolean
│       │   └── cron.ts                    # Schedules ingestion every 6h: remotive, wwr, remoteok
│       └── fly.toml                       # Fly.io config, bom region, 256MB RAM
│
└── packages/
    ├── @intelliforge/db/                  # Prisma client + full schema
    │   ├── prisma/
    │   │   └── schema.prisma              # Full schema: Job, GigPlatform, JobClick, GigClick, Subscriber, FeaturedSlot
    │   └── src/
    │       └── index.ts                   # export { prisma } singleton with global instance pattern
    │
    ├── @intelliforge/affiliate-links/     # Link wrapper for both verticals
    │   └── src/
    │       └── index.ts                   # wrapJobLink(url) + wrapGigLink(platform, type) → string
    │
    └── @intelliforge/job-alerts/          # Alert sender for both verticals
        └── src/
            ├── whatsapp.ts                # Send job digest + gig digest via WhatsApp (Sarvam/WABA)
            └── email.ts                   # Resend.com weekly digest emails, separate templates per vertical

Generate every file completely. Key implementation details per file:

━━━ app/go/[id]/route.ts ━━━
- Accept query param: type = "job" | "gig", clickType = "apply" | "referral" | "guide"
- If type=job: fetch Job by id, get affiliateUrl (fallback sourceUrl), insert JobClick async
- If type=gig: fetch GigPlatform by id, get referralUrl (fallback affiliateUrl), insert GigClick async
- Set X-Robots-Tag: noindex header
- Return NextResponse.redirect(targetUrl, { status: 302 })

━━━ app/ai-gigs/page.tsx ━━━
- ISR revalidate: 3600
- Fetch all active GigPlatforms ordered by: isFeatured desc, indiaAccepted desc, sortOrder asc
- Render two sections: "India-accepted platforms" (indiaAccepted=true) and "International platforms"
- Each card shows: name, type badge, pay range in USD + INR equiv, India badge, onboarding timeline, referral/apply CTA → /go/[id]?type=gig&clickType=referral
- generateMetadata: "AI Data Annotation & RLHF Jobs India 2026 | RemoteForge"

━━━ app/ai-gigs/[slug]/page.tsx ━━━
- generateStaticParams: fetch all active GigPlatform slugs
- SSG (no revalidate — manually revalidate on admin update)
- Show: full description, pay table, eligibility countries, task types, onboarding steps, trustpilot score, referral CTA
- If indiaAccepted=true: show green "Open to India" banner with personal note field (from notes column)
- If indiaAccepted=false: show red "Not available in India" with alternatives section linking to India-accepted platforms
- JSON-LD: JobPosting schema adapted for gig platform pages

━━━ packages/@intelliforge/affiliate-links/src/index.ts ━━━
Remote job affiliate map (read from env):
- remotive.com → append ?ref=${AFFILIATE_REMOTIVE_TAG}
- weworkremotely.com → pass through sourceUrl only (AFFILIATE_WWR_REF inactive — no public program)
- toptal.com → append ?ref=${AFFILIATE_TOPTAL_REF} (P1: $2k client / $100 talent — use on senior-role CTAs)
- turing.com → append ref param (P1: $150–$3k hire bounty — strong India fit)
- remote.com → append partner param
- flexjobs.com → append aid param (P2: optional paywall upsell, 15–30% recurring)

Apply-button priority on job detail pages:
1. Company careers page (direct apply) when URL is not a job-board intermediary
2. Turing / Toptal referral CTA for engineering, design, product roles
3. Source board link (WWR, RemoteOK, Remotive) — discovery only, no affiliate wrap
4. Never link to WWR TopAccess onboarding (payment_plan=top_access) — competitor sub, no commission

AI gig affiliate map:
- wrapGigLink(platform: GigPlatform, type: "referral"|"apply"|"guide"): string
  - if type=referral AND platform.referralUrl: return platform.referralUrl (your Outlier dashboard link)
  - if platform.affiliateUrl: return platform.affiliateUrl
  - return platform website URL (no affiliate — log click only)

━━━ workers/ingestion/src/sources/remotive.ts ━━━
- GET https://remotive.com/api/remote-jobs?limit=100
- Handle 429 with exponential backoff (3 retries, 2x delay)
- Map response.jobs[] → NormalizedJob[]
- NormalizedJob: { sourceBoard, sourceId, title, company, description, url, postedAt, salary, tags, category }

━━━ workers/ingestion/src/processors/india-check.ts ━━━
- detectIndiaEligibility(description: string, company: string): boolean
- Returns false if description contains: "US only", "United States only", "must be located in US",
  "US citizen", "US work authorization", "must reside in US", "not available in India"
- Returns true otherwise (default open)
- Export as named function, add unit tests inline as commented examples

━━━ components/gig-platform-card.tsx ━━━
Props: { platform: GigPlatform }
Render:
- Platform name + logo (fallback to letter avatar)
- Type badge (color-coded: rlhf=purple, annotation=blue, evaluator=teal, multilingual=amber)
- India badge: green "India ✓" if indiaAccepted, red "India ✗" if not
- Pay: "$20–$40/hr · ₹1,680–₹3,360/hr" using usdToInr()
- Onboarding: "Start in 1–7 days" with clock icon
- Trustpilot score if available
- Two CTAs:
  - "View guide" → /ai-gigs/[slug]
  - "Apply / Refer" → /go/[id]?type=gig&clickType=referral (tracks click, redirects to referral URL)

━━━ app/(marketing)/page.tsx ━━━
- Hero with two prominent tabs: "Remote Jobs" and "AI Gig Work"
- Tab 1 (Remote Jobs): search bar + featured job cards grid
- Tab 2 (AI Gig Work): headline "Earn $20–$40/hr training AI from India" + featured gig platform cards
- Email capture below fold: two checkboxes "Send me remote job alerts" and "Send me AI gig alerts"
- Stats bar: "X remote jobs · Y AI platforms · Z India-eligible"

━━━ .env.example ━━━
DATABASE_URL=
REDIS_URL=
NEXT_PUBLIC_APP_URL=https://remoteforge.in
USD_TO_INR_RATE=84
# Remote job affiliates (P1 = activate first)
AFFILIATE_TURING_REF=          # P1 — $150–$3,000/hire via turing.com/referrals
AFFILIATE_TOPTAL_REF=          # P1 — $2,000/client · $100/talent accepted
AFFILIATE_REMOTIVE_TAG=
AFFILIATE_REMOTE_PARTNER_CODE=
AFFILIATE_FLEXJOBS_ID=         # P2 — 15–30% recurring (ShareASale)
AFFILIATE_WWR_REF=             # INACTIVE — no public WWR/TopAccess affiliate program (Jun 2026)
# Payments
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
# Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
# Alerts
RESEND_API_KEY=
# Cron security
CRON_SECRET=

━━━ Seed data for GigPlatform (seed.ts) ━━━
Seed these platforms with accurate data:
1. Outlier AI — type: rlhf, indiaAccepted: true, payMin: 2000, payMax: 5000 (cents/hr),
   onboardingDays: "1-7", referralUrl: "[YOUR_OUTLIER_REFERRAL_URL]",
   trustpilotScore: 3.8, specialties: ["code","math","writing","reasoning"]
2. Appen — type: annotation, indiaAccepted: true, payMin: 900, payMax: 2000,
   onboardingDays: "14-42", trustpilotScore: 3.2, specialties: ["image","text","translation","search"]
3. TELUS International AI — type: evaluator, indiaAccepted: true, payMin: 1200, payMax: 1500,
   onboardingDays: "14-56", specialties: ["search","ads","multilingual"]
4. Alignerr — type: rlhf, indiaAccepted: true, payMin: 2000, payMax: 3500,
   onboardingDays: "7-28", specialties: ["reasoning","decision","ethics"]
5. DataAnnotation.tech — type: annotation, indiaAccepted: false, payMin: 2000, payMax: 4000,
   onboardingDays: "3-14", indiaPayNote: "US/UK/CA/AU/NZ only — not available in India"
6. Prolific — type: evaluator, indiaAccepted: true, payMin: 800, payMax: 1500,
   onboardingDays: "1-2", trustpilotScore: 4.6, specialties: ["research","surveys"]
7. Toloka — type: microtask, indiaAccepted: true, payMin: 100, payMax: 500,
   onboardingDays: "1", specialties: ["image","text","microtask"]

━━━ turbo.json ━━━
Pipeline: build (depends on ^build), dev (persistent), lint, db:push, db:seed, db:generate

━━━ README.md ━━━
Include: prerequisites, env setup, db:push + db:seed, dev start, worker deploy to Fly.io bom,
Vercel deploy, adding new gig platforms (manual seed), adding new job sources.
```

---

## PART 4 — SEO CONTENT STRATEGY

### Remote Jobs pages (ISR)
```
/jobs/tag/react                          "Remote React developer jobs 2026"
/jobs/tag/python/india                   "Remote Python jobs open to India"
/jobs/category/engineering               "Remote engineering jobs"
/jobs/tag/ai-ml                          "Remote AI/ML jobs hiring now"
/blog/wwr-topaccess-vs-free-aggregators  "WWR TopAccess vs free job boards — is $30/mo worth it?"
/blog/is-weworkremotely-worth-it         "Is We Work Remotely Pro worth $15/month? (India perspective)"
```

### Competitive content moat (WWR TopAccess)
Target users comparing paid bundles vs free aggregation. RemoteForge wins on: free · India filters · no 12-month lock-in · AI gig vertical.
```

### AI Gig Work pages (SSG)
```
/ai-gigs                                 "AI data annotation & RLHF jobs India 2026"
/ai-gigs/outlier-ai                      "Outlier AI review: pay, India eligibility, how to get approved"
/ai-gigs/appen                           "Appen review 2026: is it worth it for India?"
/blog/how-to-get-approved-outlier-india  "How to pass Outlier AI onboarding (India guide)"
/blog/rlhf-vs-annotation-which-pays-more "RLHF vs data annotation: which pays more in India?"
/blog/data-annotation-india-guide        "Complete guide to AI data annotation jobs India 2026"
```

These are near-zero-competition keywords in India with high commercial intent. Your personal Outlier AI experience is the unique editorial authority no aggregator has.

---

## PART 5 — REVENUE MODEL (Both Verticals)

```
Month 3 (500 daily visitors):
  Remote job affiliate clicks:   ~₹28,000/mo
  Gig platform referral clicks:  ~₹8,000/mo  (low volume, building)
  Total Month 3:                 ~₹36,000/mo  [HYPOTHESIS]

Month 6 (5,000 daily visitors via SEO):
  Remote job affiliates:         ~₹2,50,000/mo
  Outlier referrals:             ~₹40,000/mo   (cash per approved referral)
  Featured employer slots (10):  ₹50,000/mo
  Resume/guide upsells:          ₹40,000/mo
  Newsletter sponsors:           ₹20,000/mo
  Total Month 6:                 ~₹4,00,000/mo [HYPOTHESIS]

Month 12 (50K daily visitors):
  All streams combined:          ₹15–25L/mo   [HYPOTHESIS — unvalidated]
```

---

## PART 6 — YOUR UNFAIR ADVANTAGE

You have done RLHF/SFT evaluation work at Outlier AI. This gives you:

1. Enroll Toptal Referral Partners + Turing referrals (P1 — $100–$3,000/hire bounties, activate immediately)
2. Personal referral link from your Outlier dashboard (P1 monetization, activate immediately)
3. First-hand knowledge of what task types pay well, which fail QC, actual India onboarding experience
4. Editorial authority to write "How to get approved on Outlier AI from India" — the highest-intent keyword in this niche
5. FinAgentEval thesis background positions you to write credibly about RLHF, SFT, and AI evaluation — the exact terminology the serious annotators search for

No generic aggregator can replicate this. This is the content moat that compounds.

---

*Generated by IntelliForge AI | IF-PROD-2026-REMOTEJOBS-v2 | June 2026*

---

## PART 7 — PRODUCT INTEGRATION SPEC (ForgeAhead + Vettd)

### Overview

RemoteForge is the **top-of-funnel acquisition engine** for both ForgeAhead (candidate OS) and
Vettd (employer OS). The three products form a closed-loop marketplace — discover → prepare →
get screened → get hired → discover again.

Six integration points. Two APIs. One shared auth layer.

---

### I1 — RemoteForge → ForgeAhead: JD deep-link (candidate cross-sell)

Every job listing page on RemoteForge shows a CTA beneath the job description:

```tsx
// apps/web/components/job-card-cta.tsx
// Add below the "Apply" button on /jobs/[slug]

const FORGEAHEAD_URL = process.env.NEXT_PUBLIC_FORGEAHEAD_URL
// = "https://forgeahead.intelliforge.tech"

export function ScoreResumeCTA({ job }: { job: Job }) {
  const deepLink = `${FORGEAHEAD_URL}/resume/score?` + new URLSearchParams({
    jd_url: `${process.env.NEXT_PUBLIC_APP_URL}/jobs/${job.slug}`,
    jd_title: job.title,
    jd_company: job.company,
    utm_source: 'remoteforge',
    utm_medium: 'job_page',
    utm_campaign: 'jd_deeplink',
  })

  return (
    <a href={deepLink} target="_blank" rel="noopener">
      Score your resume against this JD →
    </a>
  )
}
```

ForgeAhead needs one new API route to accept the inbound deep-link:

```typescript
// ForgeAhead: app/resume/score/page.tsx
// Reads ?jd_url= query param, fetches the JD from RemoteForge public API,
// pre-populates the ATS scorer with that JD
// GET https://remoteforge.in/api/jobs/by-slug/[slug] → returns { title, description, tags }
```

RemoteForge exposes:
```typescript
// apps/web/app/api/jobs/by-slug/[slug]/route.ts  ← ADD THIS
export async function GET(req, { params }) {
  const job = await prisma.job.findUnique({
    where: { slug: params.slug },
    select: { title: true, company: true, description: true, tags: true, category: true }
  })
  return NextResponse.json({ success: true, data: job })
}
```

---

### I2 — RemoteForge → Vettd: Employer upsell

On the featured employer listings flow (Razorpay checkout for ₹4,999/mo slots), add a
cross-sell for Vettd screening:

```tsx
// apps/web/components/employer-upsell-banner.tsx
// Shown on job listing pages (not candidate-facing pages)
// Triggered when referrer is a job board or direct

const VETTD_URL = "https://www.vettd-app.com"

export function VettdUpsellBanner({ job }: { job: Job }) {
  const signupLink = `${VETTD_URL}/signup?` + new URLSearchParams({
    ref: 'remoteforge',
    job_title: job.title,
    utm_source: 'remoteforge',
    utm_medium: 'job_banner',
  })
  return (
    <aside>
      <p>Hiring for this role? Screen 200 applicants in 45 minutes.</p>
      <a href={signupLink} target="_blank">Start screening with Vettd →</a>
    </aside>
  )
}
```

Show only on pages where `isFeatured = true` or on the `/api/jobs/ingest` admin flow where
an employer posts directly.

---

### I3 — ForgeAhead → RemoteForge: Live job feed pull (solves ForgeAhead P3 roadmap item)

ForgeAhead's Apply phase (P3) currently has "Live job scraping from Indian job boards" as a
roadmap item. Replace that with a direct pull from RemoteForge — zero scraping needed.

```typescript
// ForgeAhead: lib/remoteforge.ts
const REMOTEFORGE_API = "https://remoteforge.in/api/jobs"
const REMOTEFORGE_SECRET = process.env.REMOTEFORGE_INTERNAL_KEY

export async function fetchMatchingJobs(tags: string[], category?: string) {
  const params = new URLSearchParams({ tags: tags.join(','), limit: '20' })
  if (category) params.set('category', category)

  const res = await fetch(`${REMOTEFORGE_API}?${params}`, {
    headers: { 'X-Internal-Key': REMOTEFORGE_SECRET },
    next: { revalidate: 3600 }
  })
  return res.json() // ApiResponse<{ jobs: Job[], total: number }>
}
```

RemoteForge needs a lightweight internal auth header check:

```typescript
// apps/web/app/api/jobs/route.ts — add to existing handler
const internalKey = req.headers.get('X-Internal-Key')
const isInternal = internalKey === process.env.REMOTEFORGE_INTERNAL_KEY

// Internal callers (ForgeAhead) get full description field
// Public callers get description truncated to 500 chars
const select = isInternal
  ? undefined  // all fields
  : { id, slug, title, company, tags, salaryMin, salaryMax, postedAt, affiliateUrl }
```

Add to `.env.example`:
```
REMOTEFORGE_INTERNAL_KEY=   # shared secret between RemoteForge and ForgeAhead
NEXT_PUBLIC_FORGEAHEAD_URL=https://forgeahead.intelliforge.tech
```

---

### I4 — Vettd → ForgeAhead: Skill Proof badge (Vettd roadmap item)

Vettd has "Skill Proofs" on their roadmap — portable verified credentials. Wire them to
ForgeAhead profiles via a signed JWT webhook.

```typescript
// Vettd: When a candidate completes a practice interview above threshold score,
// POST to ForgeAhead's skill-proof ingestion endpoint

// ForgeAhead: app/api/integrations/vettd/skill-proof/route.ts  ← ADD THIS
import { verifyJWT } from '@/lib/vettd-jwt'

export async function POST(req: Request) {
  const payload = await req.json()
  // payload: { candidateEmail, skillProofId, skills[], score, issuedAt, sig }

  const valid = await verifyJWT(payload, process.env.VETTD_WEBHOOK_SECRET)
  if (!valid) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })

  await prisma.skillProof.upsert({
    where: { skillProofId: payload.skillProofId },
    create: {
      skillProofId: payload.skillProofId,
      candidateEmail: payload.candidateEmail,
      skills: payload.skills,
      score: payload.score,
      source: 'vettd',
      issuedAt: new Date(payload.issuedAt),
    },
    update: { score: payload.score }
  })

  return NextResponse.json({ success: true })
}
```

Add to ForgeAhead Prisma schema:
```prisma
model SkillProof {
  id           String   @id @default(cuid())
  skillProofId String   @unique  // Vettd's ID
  userId       String?
  candidateEmail String
  skills       String[]
  score        Float
  source       String   @default("vettd")
  issuedAt     DateTime
  createdAt    DateTime @default(now())
}
```

---

### I5 — ForgeAhead → Vettd: Practice referral deep-link

In ForgeAhead Phase 5 (Interview prep), when a candidate is prepping for a company that
uses Vettd screening, show a contextual CTA:

```tsx
// ForgeAhead: components/interview/vettd-practice-cta.tsx

export function VettdPracticeCTA({ jobTitle, skills }: { jobTitle: string, skills: string[] }) {
  const practiceLink = `https://www.vettd-app.com/practice?` + new URLSearchParams({
    ref: 'forgeahead',
    job_title: jobTitle,
    skills: skills.join(','),
    utm_source: 'forgeahead',
    utm_medium: 'interview_prep',
  })

  return (
    <div>
      <p>This company uses Vettd for AI screening.</p>
      <p>Walk in having already been through one.</p>
      <a href={practiceLink} target="_blank">Run a free Vettd mock interview →</a>
    </div>
  )
}
```

No API needed — URL params carry all context. Vettd reads `?ref=forgeahead` and can attribute
any signup/conversion back to ForgeAhead in their analytics.

---

### I6 — Shared Clerk auth (SSO across all three products)

All three products already use Clerk. Enable cross-application SSO so a user logged into
RemoteForge is recognised on ForgeAhead and Vettd.

```typescript
// Clerk dashboard: create a "multi-app" instance or use shared JWT template

// Each app reads the shared Clerk publishable key from env:
// NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxx  (same key, all three apps)

// On ForgeAhead and Vettd: detect inbound users from RemoteForge via URL param
// ?clerk_ticket=xxx (Clerk's redirect param) — Clerk handles this automatically
// when apps share the same Clerk instance
```

If using separate Clerk instances (current likely setup), use a lightweight cross-auth token:

```typescript
// packages/@intelliforge/cross-auth/src/index.ts  ← NEW SHARED PACKAGE

import { SignJWT, jwtVerify } from 'jose'
const SECRET = new TextEncoder().encode(process.env.INTELLIFORGE_CROSS_AUTH_SECRET)

export async function issueHandoffToken(userId: string, email: string, source: string) {
  return new SignJWT({ userId, email, source })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('5m')  // short-lived, one-use intent
    .sign(SECRET)
}

export async function verifyHandoffToken(token: string) {
  const { payload } = await jwtVerify(token, SECRET)
  return payload as { userId: string; email: string; source: string }
}
```

Usage: when a user clicks "Score resume" on RemoteForge, append
`?_if_token=${await issueHandoffToken(userId, email, 'remoteforge')}` to the ForgeAhead URL.
ForgeAhead reads it, verifies, and auto-signs in or pre-fills the email.

---

### Integration env vars to add across products

```bash
# RemoteForge .env
REMOTEFORGE_INTERNAL_KEY=             # shared with ForgeAhead for /api/jobs auth
NEXT_PUBLIC_FORGEAHEAD_URL=https://forgeahead.intelliforge.tech
NEXT_PUBLIC_VETTD_URL=https://www.vettd-app.com
INTELLIFORGE_CROSS_AUTH_SECRET=       # shared across all three products

# ForgeAhead .env (additions)
REMOTEFORGE_API_URL=https://remoteforge.in
REMOTEFORGE_INTERNAL_KEY=             # same value as RemoteForge
VETTD_WEBHOOK_SECRET=                 # Vettd signs Skill Proof webhooks with this
INTELLIFORGE_CROSS_AUTH_SECRET=       # same value

# Vettd .env (additions)
FORGEAHEAD_SKILL_PROOF_ENDPOINT=https://forgeahead.intelliforge.tech/api/integrations/vettd/skill-proof
VETTD_WEBHOOK_SECRET=                 # same value as ForgeAhead
INTELLIFORGE_CROSS_AUTH_SECRET=       # same value
```

---

### New shared package to add to monorepo

```
packages/
└── @intelliforge/cross-auth/          # NEW — shared across all three products
    └── src/
        ├── index.ts                   # issueHandoffToken / verifyHandoffToken
        └── types.ts                   # HandoffPayload type
```

Add to turbo.json pipeline and root `package.json` workspaces.

---

### Data moat summary

When all six integration points are live:

- RemoteForge knows: which jobs a user clicked, their tags/categories of interest
- ForgeAhead knows: resume quality, JD match scores, interview readiness, referral history
- Vettd knows: structured interview scores, skill assessment results, hire/no-hire signals

Combined: you have a complete career intelligence layer for India's 5.4M tech professionals
that Naukri (job board from 2006) and LinkedIn (social network with jobs) cannot replicate.
The Skill Proof (Vettd) becomes the verified credential in ForgeAhead, sourced from real
structured interviews — not self-reported skills. This is the defensible moat.

---

*Integration spec appended | IF-PROD-2026-REMOTEJOBS-v2 | June 2026*
