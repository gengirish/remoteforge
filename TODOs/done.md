# Completed work log

Reverse-chronological. One line per shipped item.

---

## 2026-09-17

- **Positioning v2.0**: approval-led AI gigs; `docs/POSITIONING.md` rewritten with traction data and revenue order
- **Homepage**: "Get approved on AI training platforms from India", approval-alert capture, prep waitlist capture (`ed4579a`)
- **Subscribe fix**: every signup had thrown on `wantsJobAlerts`; now stripped, `source` recorded (`ed4579a`)
- **API build**: `@x402/fetch` external, tsconfig in runner stage, ESM `require` shim (`8ad1a8d`, `9397f2d`, `db9355c`)
- **Fly region**: `bom` deprecated → `sin`; CI deploys API on push (`61a937e`, `8e6ba48`)
- **Auth**: API verifies Clerk session tokens instead of trusting `X-Clerk-User-Id` (`2b32537`)
- **Cron**: `API_URL` + `CRON_SECRET` secrets set; ingest upserted 200 jobs, first success since June
- **Plan**: `plan.md` rewritten for POSITIONING v2; new `P1-approval-funnel.md`

## 2026-06-23

- **Web UI refresh** — Design system (Sora/Source Sans), warm palette, sticky header, footer, page headers, card polish
- **Dark mode** — Theme toggle, system preference, localStorage, no-flash script
- **Skeleton loading** — Route `loading.tsx` for jobs/gigs + toolbar skeleton
- **Page transitions** — `app/template.tsx` fade-up animation, reduced-motion support
- **Split deploy docs** — README + DEPLOY aligned to Vercel UI + Fly API architecture
- **Git** — Pushed to `origin/master` (`96a1ed9`)

## Prior (pre-TODOs folder)

- Monorepo scaffold: web, api, packages, ingestion worker
- Prisma schema: Job, GigPlatform, Subscriber, FeaturedSlot, clicks
- Ingestion: Remotive, WWR RSS, RemoteOK
- Pages: `/`, `/jobs`, `/ai-gigs`, detail pages, category/tag routes
- Affiliate `/go/[id]` redirect + packages/affiliate-links
- ForgeAhead ScoreResumeCTA + Vettd EmployerUpsellBanner (initial)
- `@intelliforge/cross-auth` handoff JWT package
- JSON-LD SEO on job/gig detail pages
