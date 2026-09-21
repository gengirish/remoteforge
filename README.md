# RemoteForge

Helps people in India **get approved on AI training platforms** (Outlier, Mercor, Alignerr and others), with remote jobs from Remotive, WWR and RemoteOK as a secondary surface. Turborepo + pnpm monorepo. Positioning: [docs/POSITIONING.md](./docs/POSITIONING.md); roadmap: [TODOs/plan.md](./TODOs/plan.md).

Live: https://remoteforge.intelliforge.tech

## Stack

- **Web (UI)**: Next.js 14 on Vercel — `apps/web`
- **API**: Hono on Fly.io (sin) — `apps/api`
- **DB**: Prisma + Neon PostgreSQL
- **Workers**: BullMQ + Redis (`workers/ingestion`), **not deployed**; ingestion runs in-process on the API
- **Auth**: Clerk (optional)
- **Payments**: Razorpay featured slots
- **Alerts**: weekly email digest via AgentMail. WhatsApp numbers are collected on signup; the Sarvam sender in `packages/job-alerts` exists but is not wired into the digest

## Architecture

Split deploy (IntelliForge pattern: Vercel UI + Fly API):

```
apps/web (Vercel)  ──HTTPS──▶  apps/api (Fly.io sin)
                                      │
                                 Neon Postgres
Cron: GitHub Actions → Fly /api/jobs/ingest (6h) + /api/cron/digest (Mon 08:00 UTC)
```

Business logic lives in `packages/api-core` as framework-agnostic `handle*()` functions; `apps/api` only routes to them, and `apps/web/lib/data.ts` is the only place the UI calls the API. See [CLAUDE.md](./CLAUDE.md) for the conventions.

See **[DEPLOY.md](./DEPLOY.md)** for full deployment steps.

## Prerequisites

- Node.js 22+
- pnpm 9+
- PostgreSQL database (Neon)
- Fly.io CLI (API deploy)
- Vercel CLI (UI deploy)

## Setup

```bash
pnpm install
cp .env.example .env               # root .env feeds scripts (ingest, db)
cp apps/api/.env.example apps/api/.env
pnpm db:push                       # no migrations directory; schema changes go through db:push
pnpm db:seed
```

## Local dev

```bash
# Terminal 1 — API on :8080
pnpm dev:api

# Terminal 2 — UI on :3000
pnpm dev:web
```

Set in `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
API_URL=http://localhost:8080
```

## Checks

There is no test framework. `pnpm lint` runs `tsc --noEmit` in every workspace, and CI runs it plus `pnpm --filter web build`. After adding an API dependency, also run `pnpm --filter api build && node apps/api/dist/server.mjs` and hit `/health`: the esbuild bundle can crash on boot in ways typecheck misses, and CI deploys straight to production.

## Workspaces

| Package | Description |
|---------|-------------|
| `apps/web` | Next.js UI (only API route: `app/api/cover-letter`); editorial content in `content/` |
| `apps/api` | Hono API server for Fly.io |
| `packages/api-core` | All business logic (`handle*()` functions) |
| `packages/db` | Prisma schema + client |
| `packages/ingestion` | Job sources, processors, enrichment (logos, JSearch, Frankfurter FX) |
| `packages/affiliate-links` | Affiliate URL wrapping |
| `packages/job-alerts` | AgentMail digest emails (+ unused WhatsApp sender) |
| `packages/cross-auth` | SSO handoff tokens (ForgeAhead/Vettd) |
| `workers/ingestion` | BullMQ ingestion worker (dormant, not deployed) |

## API (Fly.io)

Live: `https://remoteforge-api.fly.dev`

Core routes (the full list, ~60 routes, is in `apps/api/src/server.ts`):

| Route | Method | Description |
|-------|--------|-------------|
| `/health`, `/api/health` | GET | Liveness — no DB access; the Fly check polls `/health` |
| `/api/health/deep` | GET | Readiness — DB counts, cached 5 min, manual use only |
| `/api/home` | GET | Landing stats |
| `/api/jobs` | GET | Paginated jobs |
| `/api/jobs/by-slug/:slug` | GET | Job detail (`?full=true` for the whole row) |
| `/api/gigs`, `/api/gigs/by-slug/:slug` | GET | Gig platforms |
| `/api/subscribe` | POST | Signup; `source` plus optional `signal` (`approval-alert:{slug}` / `prep-waitlist:{slug}`). Confirms by email once; repeats return `alreadySubscribed` |
| `/api/unsubscribe` | GET/POST | GET renders a confirm page (no side effects); POST deletes the subscriber |
| `/api/jobs/ingest` | GET/POST | Cron — ingestion (runs inline) |
| `/api/cron/digest` | GET | Cron — email digest (`?to=` sends to one address) |
| `/api/featured/create-order` | POST | Razorpay checkout |
| `/api/webhooks/razorpay` | POST | Payment webhook |
| `/go/:id` | GET | Affiliate redirect; logs the click, flagging bots and repeats |
| `/api/internal/*` | — | Admin, requires `X-Internal-Key`. `/api/internal/stats` feeds the owner page `/internal` (basic auth, see `DEPLOY.md` §3) |

Signed-in routes (`/api/user/*`, `/api/applications`, `/api/referral/*`, …) read the Clerk session token from `Authorization: Bearer`.

## Deploy

```bash
pnpm deploy:api    # Fly.io — apps/api
pnpm deploy:web    # Vercel — apps/web
pnpm ingest        # populate jobs locally
```

Pushes to `master` that touch `apps/api`, `packages/` or the lockfile auto-deploy the API to Fly after CI passes; Vercel deploys the web app from `master` on every push (needs the `FLY_API_TOKEN` repo secret). See [DEPLOY.md](./DEPLOY.md#continuous-deploy-github-actions).

## Product Integrations

- **ForgeAhead**: `ScoreResumeCTA` + `/api/jobs/by-slug/:slug`
- **Vettd**: `EmployerUpsellBanner` on job pages
- **Cross-auth**: `@intelliforge/cross-auth` handoff JWTs

## License

Private — IntelliForge Digital Services
