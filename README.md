# RemoteForge

India's home for **remote jobs** and **AI gig work** — a Turborepo monorepo aggregating Remotive, WWR, and RemoteOK listings alongside AI annotation platform comparisons.

## Stack

- **Web (UI)**: Next.js 14 on Vercel — `apps/web`
- **API**: Hono on Fly.io (bom) — `apps/api`
- **DB**: Prisma + Neon PostgreSQL
- **Workers**: BullMQ + Redis on Fly.io (optional)
- **Auth**: Clerk (optional)
- **Payments**: Razorpay featured slots
- **Alerts**: AgentMail email + WhatsApp (Sarvam)

## Architecture

Split deploy (IntelliForge pattern: Vercel UI + Fly API):

```
apps/web (Vercel)  ──HTTPS──▶  apps/api (Fly.io bom)
                                      │
                                 Neon Postgres
Cron: GitHub Actions → Fly /api/jobs/ingest + /api/cron/digest
```

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
cp .env.example .env
pnpm db:push
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

## Workspaces

| Package | Description |
|---------|-------------|
| `apps/web` | Next.js UI (no API routes) |
| `apps/api` | Hono API server for Fly.io |
| `packages/api-core` | Shared API handlers |
| `packages/db` | Prisma schema + client |
| `packages/ingestion` | Job source fetchers |
| `packages/affiliate-links` | Affiliate URL wrapping |
| `packages/job-alerts` | Email + WhatsApp digests |
| `packages/cross-auth` | SSO handoff tokens (ForgeAhead/Vettd) |
| `workers/ingestion` | BullMQ ingestion worker |

## API (Fly.io)

Live: `https://remoteforge-api.fly.dev`

| Route | Method | Description |
|-------|--------|-------------|
| `/health` | GET | Liveness — no DB access |
| `/api/health/deep` | GET | Readiness — DB counts, cached 5 min |
| `/api/home` | GET | Landing stats |
| `/api/jobs` | GET | Paginated jobs |
| `/api/jobs/by-slug/:slug` | GET | Job detail |
| `/api/jobs/ingest` | GET/POST | Cron ingestion |
| `/api/cron/digest` | GET | Email digest |
| `/api/gigs` | GET | Gig platforms |
| `/api/subscribe` | POST | Newsletter signup |
| `/api/featured/create-order` | POST | Razorpay checkout |
| `/api/webhooks/razorpay` | POST | Payment webhook |
| `/go/:id` | GET | Affiliate redirect |

## Deploy

```bash
pnpm deploy:api    # Fly.io — apps/api
pnpm deploy:web    # Vercel — apps/web
pnpm ingest        # populate jobs locally
```

## Product Integrations

- **ForgeAhead**: `ScoreResumeCTA` + `/api/jobs/by-slug/:slug`
- **Vettd**: `EmployerUpsellBanner` on job pages
- **Cross-auth**: `@intelliforge/cross-auth` handoff JWTs

## License

Private — IntelliForge Digital Services
