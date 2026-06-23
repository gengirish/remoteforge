# RemoteForge — Deployment Architecture

Split deploy matching **IntelliForge** conventions (`intelliforge-otp` + `hrms-intelliforge` Vercel patterns):

```
┌─────────────────────┐         ┌──────────────────────────────┐
│  apps/web (UI)      │  HTTPS  │  apps/api (API)              │
│  Vercel             │ ──────▶ │  Fly.io (bom)                │
│  remoteforge.in     │         │  remoteforge-api.fly.dev     │
└─────────────────────┘         └──────────────────────────────┘
                                         │
                                ┌────────┴────────┐
                                │  Neon Postgres  │
                                │  (shared)       │
                                └─────────────────┘

Optional: workers/ingestion on Fly (BullMQ + Redis)
Cron: GitHub Actions → Fly API /api/jobs/ingest + /api/cron/digest
```

## 1. Fly.io — API layer (`apps/api`)

```bash
fly auth login
fly apps create remoteforge-api --org personal   # once

fly secrets set --app remoteforge-api \
  DATABASE_URL="postgresql://..." \
  CRON_SECRET="..." \
  CORS_ORIGINS="https://remoteforge.in,https://your-app.vercel.app"

pnpm deploy:api
```

Verify:

```bash
curl https://remoteforge-api.fly.dev/health
curl https://remoteforge-api.fly.dev/api/home
```

### API routes (all on Fly)

| Route | Description |
|-------|-------------|
| `GET /health` | Liveness |
| `GET /api/home` | Landing stats + featured |
| `GET /api/jobs` | Job listings |
| `GET /api/jobs/by-slug/:slug?full=true` | Job detail |
| `GET /api/gigs` | Gig platforms |
| `GET /go/:id` | Affiliate redirect |
| `POST /api/subscribe` | Newsletter signup |
| `POST /api/featured/create-order` | Razorpay |
| `POST /api/webhooks/razorpay` | Payment webhook |
| `GET /api/jobs/ingest` | Cron — job ingestion |
| `GET /api/cron/digest` | Cron — email digest |

## 2. Vercel — UI layer (`apps/web`)

Like **hrms-intelliforge**: Next.js on Vercel, no API routes in the web app.

```bash
cd apps/web
vercel link          # once
vercel env add NEXT_PUBLIC_API_URL   # https://remoteforge-api.fly.dev
vercel env add API_URL               # same (SSR fetch)
vercel env add NEXT_PUBLIC_APP_URL
pnpm deploy:web      # or: vercel --prod
```

**Root directory in Vercel dashboard:** `apps/web`

### Web env vars

```env
NEXT_PUBLIC_API_URL=https://remoteforge-api.fly.dev
API_URL=https://remoteforge-api.fly.dev
NEXT_PUBLIC_APP_URL=https://remoteforge.in
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=   # optional
CLERK_SECRET_KEY=                    # optional
```

## 3. Cron (GitHub Actions)

Set repo secrets:

- `API_URL` = `https://remoteforge-api.fly.dev`
- `CRON_SECRET` = same as Fly API

Workflow: `.github/workflows/cron.yml`

## 4. Local dev

```bash
# Terminal 1 — API (Fly locally)
pnpm dev:api

# Terminal 2 — UI (Vercel-style Next.js)
pnpm dev:web
```

`apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
API_URL=http://localhost:8080
```

## 5. Optional worker

```bash
fly apps create remoteforge-ingestion
fly secrets set --app remoteforge-ingestion DATABASE_URL=... REDIS_URL=...
pnpm deploy:worker
```

When `REDIS_URL` is set on the API app, ingest queues to BullMQ; otherwise runs inline.

## 6. Razorpay webhook

Point to Fly (not Vercel):

```
https://remoteforge-api.fly.dev/api/webhooks/razorpay
```
