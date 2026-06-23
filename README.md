# RemoteForge

India's home for **remote jobs** and **AI gig work** — a Turborepo monorepo aggregating Remotive, WWR, and RemoteOK listings alongside AI annotation platform comparisons.

## Stack

- **Web**: Next.js 14 App Router, Tailwind, shadcn/ui
- **DB**: Prisma + PostgreSQL (Supabase)
- **Workers**: BullMQ + Redis on Fly.io (bom region)
- **Auth**: Clerk (optional)
- **Payments**: Razorpay featured slots
- **Alerts**: Resend email + WhatsApp (Sarvam)

## Prerequisites

- Node.js 22+
- pnpm 9+
- PostgreSQL database
- Redis instance

## Setup

```bash
# Install dependencies
pnpm install

# Copy env and fill in values
cp .env.example .env

# Push schema and seed gig platforms
pnpm db:push
pnpm db:seed

# Start dev (web on :3000)
pnpm dev
```

## Workspaces

| Package | Description |
|---------|-------------|
| `apps/web` | Next.js frontend + API routes |
| `packages/db` | Prisma schema + client (`@intelliforge/db`) |
| `packages/affiliate-links` | Job/gig affiliate URL wrapping |
| `packages/job-alerts` | Email + WhatsApp digest senders |
| `packages/cross-auth` | SSO handoff tokens (ForgeAhead/Vettd) |
| `workers/ingestion` | BullMQ job ingestion worker |

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/jobs` | GET | Paginated job listing (internal key for full descriptions) |
| `/api/jobs/by-slug/[slug]` | GET | Job detail for ForgeAhead JD deep-link |
| `/api/jobs/ingest` | POST | Cron trigger (Bearer `CRON_SECRET`) |
| `/api/gigs` | GET | Gig platform listing |
| `/api/subscribe` | POST | Email + WhatsApp alert signup |
| `/api/webhooks/razorpay` | POST | Featured slot payment webhook |
| `/go/[id]` | GET | Affiliate redirect tracker |

## Product Integrations

- **ForgeAhead**: `ScoreResumeCTA` deep-links to resume scorer; `/api/jobs/by-slug/[slug]` exposes JD data
- **Vettd**: `EmployerUpsellBanner` on featured job pages
- **Cross-auth**: `@intelliforge/cross-auth` issues 5-minute handoff JWTs

## Worker Deploy (Fly.io bom)

```bash
cd workers/ingestion
fly deploy --region bom
```

Set `DATABASE_URL` and `REDIS_URL` as Fly secrets.

## Deploy

See **[DEPLOY.md](./DEPLOY.md)** for full Vercel + Neon deployment guide.

Quick deploy to Vercel:
1. Import repo, set root directory to `apps/web`
2. Add `DATABASE_URL`, `CRON_SECRET`, `NEXT_PUBLIC_APP_URL` env vars
3. Deploy — cron auto-ingests jobs every 6h

```bash
pnpm ingest   # populate jobs immediately (230+ from Remotive/WWR/RemoteOK)
```

## Adding Gig Platforms

Edit `packages/db/prisma/seed.ts` and run `pnpm db:seed`.

## Adding Job Sources

1. Create fetcher in `workers/ingestion/src/sources/`
2. Register in `workers/ingestion/src/index.ts`
3. Add to cron schedule in `workers/ingestion/src/cron.ts`

## License

Private — IntelliForge Digital Services
