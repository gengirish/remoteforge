---
name: remoteforge-project
description: >-
  RemoteForge — India's remote jobs + AI gig work affiliate engine. Start here
  for architecture, skill routing, monorepo layout, deploy targets, and
  product integrations (ForgeAhead, Vettd).
---

# RemoteForge

Helps people in India **get approved on AI training platforms** (Outlier, Mercor, Alignerr and others); **remote jobs** (Remotive, WWR, RemoteOK) are secondary. Revenue order: prep packs → gig referrals → sourcing → community. Positioning: `docs/POSITIONING.md`; roadmap: `TODOs/plan.md`. `CLAUDE.md` at the root is the authoritative guide to conventions.

## Architecture

```
apps/web (Vercel)  ──HTTPS──▶  apps/api (Fly.io sin)  ──▶  Neon Postgres
GitHub Actions cron ──▶ /api/jobs/ingest (6h), /api/cron/digest (Mon)
```

```
apps/web/                  Next.js 14 App Router UI → Vercel (only API route: app/api/cover-letter)
apps/web/content/          Typed editorial content: guides/, gig-approval/
apps/api/                  Hono routing only → Fly.io sin (one esbuild ESM bundle)
packages/api-core/         All business logic: handle*() → { status, body }
packages/db/               Prisma + Neon Postgres — @intelliforge/db (db:push, no migrations)
packages/ingestion/        Sources, processors, enrichment; runs in-process on the API
packages/affiliate-links/  Job/gig affiliate URL wrapping
packages/job-alerts/       AgentMail digest email (+ Sarvam WhatsApp sender, not wired in)
packages/cross-auth/       SSO handoff JWTs (ForgeAhead/Vettd)
workers/ingestion/         BullMQ worker — dormant, not deployed
```

New endpoint = `handleThing()` in `packages/api-core/src/handlers.ts` → export from `packages/api-core/src/index.ts` → route in `apps/api/src/server.ts`. The UI reaches the API only through `apps/web/lib/data.ts`, whose `apiFetch` returns `null` on failure.

## Key routes

| Route | Where | Purpose |
|-------|-------|---------|
| `/ai-gigs`, `/ai-gigs/[slug]` | web | Gig platforms; approval section + alert and prep-waitlist captures for Outlier, Mercor, Alignerr |
| `/guides/[slug]` | web | Approval SEO guides from `apps/web/content/guides/` |
| `/jobs`, `/jobs/[slug]`, `/jobs/tag/[tag]` | web | Remote job listings (ISR, `revalidate = 3600`) |
| `/go/:id` | API | Affiliate redirect; logs clicks, flags `isBot` / `isDuplicate` |
| `/api/subscribe` | API | Signup with `source` + optional `signal` |
| `/api/jobs/ingest` | API | Cron (Bearer `CRON_SECRET`) |
| `/api/cron/digest` | API | Weekly digest via AgentMail (`?to=` for one address) |
| `/api/webhooks/razorpay` | API | Payment webhook |
| `/health` | API | Liveness, no DB — the only thing any probe may poll |

## Skill index

| Task | Skill |
|------|-------|
| Project overview, routing | **remoteforge-project** (this file) |
| Monorepo, pnpm, turbo | **turborepo-pnpm** |
| Next.js pages, ISR | **nextjs-app-router-patterns** |
| Prisma schema, seed | **prisma-expert** (use `db:push`, not migrations) |
| PostgreSQL tuning | **postgres-best-practices** |
| BullMQ (dormant worker only) | **bullmq-dag-worker**, **bullmq-specialist** |
| shadcn/ui + Tailwind | **shadcn-tailwind-ui** |
| Zod validation | **zod-schemas** |
| Razorpay payments | **razorpay-integration** |
| Webhook security | **harden-webhook-endpoint** |
| Affiliate/referral strategy | **referral-program** |
| Email digests | AgentMail, see `DEPLOY.md` §5 (**react-email-resend** does not apply; there is no Resend) |
| WhatsApp alerts | **whatsapp-notifications** |
| SEO guides, tag/category pages | **ws-seo-technical-optimization**, **ws-seo-content-creation**, **seo-auditing** |
| Content | **ws-content-marketing** |
| Landing page | **landing-page-generator** |
| Auth (Clerk, optional) | **clerk-nextjs-patterns**, **clerk-backend-api** (in `.agents/skills/`) |
| CI | **setting-up-ci** |
| Onboarding new contributors | **codebase-onboarding** |
| Multi-phase shipping | **parallel-phase-shipping** |

There is no test framework (no Playwright, Vitest or Jest). `pnpm lint` (`tsc --noEmit`) is the only correctness gate.

## Local dev

```bash
pnpm install
cp .env.example .env                    # scripts
cp apps/api/.env.example apps/api/.env  # API
pnpm db:push && pnpm db:seed
pnpm dev:api      # Hono API on :8080
pnpm dev:web      # Next.js on :3000; needs API_URL + NEXT_PUBLIC_API_URL in apps/web/.env.local
pnpm ingest       # manual job ingestion
```

## Deploy

- **API**: Fly.io `remoteforge-api` in `sin` (`bom` is deprecated). CI deploys on pushes to `master` that touch `apps/api`, `packages/` or the lockfile; manual: `pnpm deploy:api`.
- **Web**: Vercel, project root `apps/web`; deploys on push to `master`.
- **DB**: Neon Postgres (pooled host, `sslmode=require`). It scales to zero, so nothing on a timer may touch it.
- **Cron**: `.github/workflows/cron.yml` (not Vercel cron).

See `DEPLOY.md` for secrets and verification.

## Product integrations

- **ForgeAhead**: `ScoreResumeCTA` deep-links to resume scorer; `/api/jobs/by-slug/:slug` exposes JD data.
- **Vettd**: `EmployerUpsellBanner` on featured job pages.
- **Cross-auth**: `@intelliforge/cross-auth` issues 5-minute handoff JWTs.

## Reference doc

Original architecture and scaffold spec: `remotejobs-affiliate-engine-scaffold-prompt.md` at the repo root. It predates the split deploy and POSITIONING v2, so trust `CLAUDE.md` where they differ.
