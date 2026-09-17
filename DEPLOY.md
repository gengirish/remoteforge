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

pnpm deploy:api      # manual deploy; CI also deploys automatically, see below
```

### Continuous deploy (GitHub Actions)

The `deploy-api` job in `.github/workflows/ci.yml` runs `flyctl deploy --remote-only` with the same flags as `pnpm deploy:api`. It runs only when:

- the push is to `master` (never on PRs),
- the `build` job (lint + web build) passed, and
- the push touches `apps/api/**`, `packages/**`, `pnpm-lock.yaml` or the root `package.json`. Web-only commits skip it.

One-time setup: store an app-scoped deploy token as a repo secret, piped so it is never printed:

```bash
fly tokens create deploy -a remoteforge-api --name github-actions   | gh secret set FLY_API_TOKEN --repo gengirish/remoteforge
```

Rotate by revoking the old token (`fly tokens list -a remoteforge-api`, then `fly tokens revoke <id>`) and re-running the command above.

Verify:

```bash
curl https://remoteforge-api.fly.dev/health
curl https://remoteforge-api.fly.dev/api/home
```

### API routes (all on Fly)

| Route | Description |
|-------|-------------|
| `GET /health` | Liveness — no DB access (keep it that way; the Fly check polls it) |
| `GET /api/health/deep` | Readiness — DB-backed, cached 5 min, manual use only |
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
| `GET /api/internal/affiliate-settings` | Admin — list affiliate config |
| `PUT /api/internal/affiliate-settings` | Admin — save job board affiliate tags |
| `PATCH /api/internal/gig-platforms/:id/affiliate` | Admin — save gig referral URLs |

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
REMOTEFORGE_INTERNAL_KEY=            # same as Fly API — required for admin settings
ADMIN_SETTINGS_TOKEN=                # passphrase for /admin/settings UI
```

## 3. Product settings (affiliate links)

Configure referral and affiliate links at **`/admin/settings`** (not indexed).

1. Set on **Vercel** (web): `ADMIN_SETTINGS_TOKEN`, `REMOTEFORGE_INTERNAL_KEY`
2. Set on **Fly API**: `REMOTEFORGE_INTERNAL_KEY` (same value)
3. Run `pnpm db:push && pnpm db:seed` to create `ProductSetting` rows
4. Open `https://remoteforge.in/admin/settings`, enter `ADMIN_SETTINGS_TOKEN`

**Remote job boards** (Remotive, WWR, Turing, Toptal, Remote.com, FlexJobs): affiliate tag IDs saved in DB; applied live on `/go/:id` redirects.

**AI gig platforms** (Outlier, Appen, etc.): per-platform referral URL, affiliate URL, and reward note.

Env vars (`AFFILIATE_*`) still work as fallback until you save a value in the admin UI.

## 4. Cron (GitHub Actions)

Set repo secrets:

- `API_URL` = `https://remoteforge-api.fly.dev`
- `CRON_SECRET` = same as Fly API

```bash
gh secret set API_URL --body "https://remoteforge-api.fly.dev"
gh secret set CRON_SECRET   # prompts; paste the value set on Fly
```

Fly only shows a digest of each secret, never the value. If the value is lost, rotate it on both sides at once (this restarts the API machine), then update `CRON_SECRET` in your local `.env` files:

```bash
S=$(openssl rand -hex 32)
fly secrets set CRON_SECRET="$S" -a remoteforge-api
printf %s "$S" | gh secret set CRON_SECRET --repo gengirish/remoteforge
```

Workflow: `.github/workflows/cron.yml`. It runs ingest every 6h (`0 */6 * * *`) and the digest on Mondays at 08:00 UTC.

### Verifying cron

1. **Secret matches Fly** (from your machine; this runs a real ingest but sends no email):

   ```bash
   curl -fsS -H "Authorization: Bearer $(grep '^CRON_SECRET=' apps/api/.env | cut -d= -f2- | tr -d '\"')"      https://remoteforge-api.fly.dev/api/jobs/ingest
   ```

   Expect `{"success":true,"data":{"mode":"inline","total":...}}`. A 401 means the local value differs from Fly.

2. **GitHub secrets are correct.** A manual dispatch runs **both** jobs, so the digest emails every subscriber:

   ```bash
   gh workflow run Cron --repo gengirish/remoteforge
   gh run list --repo gengirish/remoteforge --workflow Cron --limit 1
   gh run view <id> --repo gengirish/remoteforge --log | grep '"success"'
   ```

   `gh run watch` only follows in-progress runs; a run finishes in ~10s, so use `gh run view` afterwards.

   To avoid emailing anyone, wait for the next scheduled run and check that its event is `schedule` and its status is ✓.

Failure signatures in `--log-failed`:

| Log line | Cause |
|----------|-------|
| `curl: (3) URL rejected: No host part in the URL` | `API_URL` secret missing |
| `Authorization: Bearer ` with nothing after it | `CRON_SECRET` secret missing |
| `curl: (22) ... 401` | `CRON_SECRET` differs from Fly |

## 5. Local dev

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

## 6. Optional worker

```bash
fly apps create remoteforge-ingestion
fly secrets set --app remoteforge-ingestion DATABASE_URL=... REDIS_URL=...
pnpm deploy:worker
```

When `REDIS_URL` is set on the API app, ingest queues to BullMQ; otherwise runs inline.

## 7. Razorpay webhook

Point to Fly (not Vercel):

```
https://remoteforge-api.fly.dev/api/webhooks/razorpay
```
