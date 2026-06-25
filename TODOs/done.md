# Completed work log

Reverse-chronological. One line per shipped item.

---

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
