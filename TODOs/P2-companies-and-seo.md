# P2 — Companies, employers & SEO

**Phase goal:** Turn WWR employer metadata + ingested jobs into SEO pages and trust signals for India users.

Context: WWR company leaderboard (100 employers, job counts + bios). Jobs already ingest via WWR RSS — this phase adds **discovery and SEO**, not a new ingestion source.

---

## v1 — No schema change (quick win)

- [ ] API: `GET /api/companies` — aggregate `Job` by `company`: count, indiaFriendly ratio, latest `postedAt`
- [ ] Page: `/companies` — sortable table/grid (job count desc)
- [ ] Page: `/companies/[slug]` — jobs list for that company + stats
- [ ] Homepage section: “Top remote employers hiring now” (top 10 by active job count)
- [ ] Link company name on `JobCard` → `/companies/[slug]`

## v2 — Company model (optional enrichment)

- [ ] Prisma `Company` model: `slug`, `name`, `description`, `logoUrl`, `website`, `wwrJobCount`, `source`
- [ ] Seed script: import top 100 WWR employer bios from notes file
- [ ] Join `Job.companyId` → `Company` (migration + backfill from string `company`)
- [ ] “Actively hiring” badge when `activeJobCount > threshold`
- [ ] India score: `% jobs where indiaFriendly` per company

## Outreach (monetization bridge)

- [ ] Export top 20 employers by job count for Vettd/featured slot sales
- [ ] Email template: “573 open roles on RemoteForge — feature your listings”
- [ ] Track employers with 100+ jobs: Lumenalta, Contra, Toptal, Hotjar, TaxJar, Aha!, etc.

## Blog & content (SEO moat)

- [ ] MDX or markdown blog under `/blog`
- [ ] Post 1: “How to get approved on Outlier AI from India” (P1 editorial moat)
- [ ] Post 2: “RLHF vs data annotation: which pays more in India?”
- [ ] Post 3: “WWR TopAccess vs free job aggregators (2026)”
- [ ] Post 4: “Complete guide to AI data annotation jobs India 2026”
- [ ] Post 5: “Remote jobs that hire from India — 50 companies”
- [ ] Internal links: blog → `/jobs`, `/ai-gigs`, `/companies/[slug]`

## SEO plumbing

- [ ] Dynamic sitemap: jobs, gigs, companies, blog
- [ ] Canonical URLs on tag/category/company pages
- [ ] Meta descriptions per listing type
- [ ] Review JSON-LD on job + gig detail pages

## Special listings

- [ ] Evaluate **NoGigiddy** (#49 on WWR list) — add to AI Gigs or partner page
- [ ] Tag staffing networks (Proxify, X-Team, G2i, Arc, Lemon.io) as “talent network” filter

---

## Data reference

See [`data/wwr-top-employers-notes.md`](./data/wwr-top-employers-notes.md) for how to use the WWR leaderboard export.

---

## Done when

- [ ] `/companies` live with ≥50 employers from DB aggregation
- [ ] 3 blog posts published
- [ ] Organic landing: at least one company page indexed in Search Console
