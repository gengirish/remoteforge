# RemoteForge — Deployment Architecture

Split deploy matching **IntelliForge** conventions (`intelliforge-otp` + `hrms-intelliforge` Vercel patterns):

```
┌────────────────────────────────┐         ┌──────────────────────────────┐
│  apps/web (UI)                 │  HTTPS  │  apps/api (API)              │
│  Vercel                        │ ──────▶ │  Fly.io (sin)                │
│  remoteforge.intelliforge.tech │         │  remoteforge-api.fly.dev     │
└────────────────────────────────┘         └──────────────────────────────┘
                                         │
                                ┌────────┴────────┐
                                │  Neon Postgres  │
                                │  (shared)       │
                                └─────────────────┘

Dormant: workers/ingestion (BullMQ + Redis), not deployed; see §7
Cron: GitHub Actions → Fly API /api/jobs/ingest + /api/cron/digest
```

## 1. Fly.io — API layer (`apps/api`)

```bash
fly auth login
fly apps create remoteforge-api --org personal   # once

fly secrets set --app remoteforge-api \
  DATABASE_URL="postgresql://..." \
  CRON_SECRET="..." \
  CORS_ORIGINS="https://remoteforge.intelliforge.tech,https://your-app.vercel.app" \
  CLERK_SECRET_KEY="sk_live_..." \
  AGENTMAIL_API_KEY="am_us_..." \
  AGENTMAIL_INBOX_ID="alerts@intelliforge.tech"

pnpm deploy:api      # manual deploy; CI also deploys automatically, see below
```

| Secret | Required | Without it |
|--------|----------|------------|
| `DATABASE_URL` | yes | API cannot serve data |
| `CRON_SECRET` | yes | cron routes return 401 |
| `CORS_ORIGINS` | yes | browsers are blocked |
| `CLERK_SECRET_KEY` | when Clerk is on | signed-in routes treat every request as anonymous; the API verifies the Clerk session token sent as `Authorization: Bearer` |
| `AGENTMAIL_API_KEY`, `AGENTMAIL_INBOX_ID` | for email | digest runs but sends nothing (see §5) |
| `REMOTEFORGE_INTERNAL_KEY` | for admin | `/api/internal/*` returns 401, so `/admin/settings` can't load or save and `/internal` shows no stats (see §3) |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | for payments | checkout and the payment webhook fail (see §8) |
| `UNSUBSCRIBE_SECRET`, `API_PUBLIC_URL` | no | see §5 Unsubscribe |
| `NEXT_PUBLIC_APP_URL` | no | email links and referral share links default to `https://remoteforge.intelliforge.tech` |
| `JOB_STALE_DAYS`, `JOB_MAX_AGE_DAYS` | no | stale-job expiry uses 3 and 30 days |
| `LOGO_DEV_TOKEN`, `RAPIDAPI_KEY` | no | ingest skips logo and JSearch salary enrichment |
| `REDIS_URL` | **leave unset** | ingest runs inline; setting it queues ingest for a worker that isn't deployed (§7) |

`fly secrets set` restarts the machine. `pnpm deploy:api` builds from your **working tree**, uncommitted changes included; to ship only `master`, deploy from a clean checkout or push and let CI deploy.

### Continuous deploy (GitHub Actions)

The `deploy-api` job in `.github/workflows/ci.yml` runs `flyctl deploy --remote-only` with the same flags as `pnpm deploy:api`. It runs only when:

- the push is to `master` (never on PRs),
- the `build` job (lint + web build) passed, and
- the push touches `apps/api/**`, `packages/**`, `pnpm-lock.yaml` or the root `package.json`. Web-only commits skip it.

One-time setup: store an app-scoped deploy token as a repo secret, piped so it is never printed:

```bash
fly tokens create deploy -a remoteforge-api --name github-actions \
  | gh secret set FLY_API_TOKEN --repo gengirish/remoteforge
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
| `GET /go/:id` | Affiliate redirect; flags crawler (`isBot`) and repeat (`isDuplicate`) clicks |
| `POST /api/subscribe` | Signup with `source` and optional `signal`; returns `alreadySubscribed` |
| `GET /api/unsubscribe` | Unsubscribe confirm page; no side effects |
| `POST /api/unsubscribe` | Deletes the subscriber |
| `POST /api/featured/create-order` | Razorpay |
| `POST /api/webhooks/razorpay` | Payment webhook |
| `GET`/`POST /api/jobs/ingest` | Cron — job ingestion |
| `GET /api/cron/digest` | Cron — email digest (`?to=` for one address) |
| `GET /api/internal/stats` | Admin — clicks, subscribers, waitlist and alert interest (read by `/internal`) |
| `GET /api/internal/affiliate-settings` | Admin — list affiliate config |
| `PUT /api/internal/affiliate-settings` | Admin — save job board affiliate tags |
| `PATCH /api/internal/gig-platforms/:id/affiliate` | Admin — save gig referral URLs |

This table covers ops-relevant routes; `apps/api/src/server.ts` has the full list (user, referral, salary, community, employer, premium and `/api/v2` data API routes).

## 2. Vercel — UI layer (`apps/web`)

Like **hrms-intelliforge**: Next.js on Vercel. The only API route in the web app is `app/api/cover-letter`; everything else calls the Fly API.

```bash
cd apps/web
vercel link          # once
vercel env add NEXT_PUBLIC_API_URL   # https://remoteforge-api.fly.dev
vercel env add API_URL               # same (SSR fetch)
vercel env add NEXT_PUBLIC_APP_URL
pnpm deploy:web      # or: vercel --prod
```

**Root directory in Vercel dashboard:** `apps/web`. Vercel also deploys every push to `master`.

A new or changed env var only reaches the live site after a redeploy (`vercel redeploy <production-url> --target production`, or push a commit).

**Git Bash with Anaconda on PATH:** `vercel` fails with `Cannot find module 'C:\Users\...\anaconda3\Library\c\nvm4w\nodejs\node_modules\vercel\dist\vc.js'`. Anaconda's `cygpath` shadows Git's and mangles the path the npm shim builds. Run the CLI from PowerShell, call it directly with `node /c/nvm4w/nodejs/node_modules/vercel/dist/vc.js ...`, or put `export PATH="/usr/bin:$PATH"` in `~/.bashrc`.

### Web env vars

```env
NEXT_PUBLIC_API_URL=https://remoteforge-api.fly.dev
API_URL=https://remoteforge-api.fly.dev
NEXT_PUBLIC_APP_URL=https://remoteforge.intelliforge.tech
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=   # optional
CLERK_SECRET_KEY=                    # optional; set the same key on Fly or signed-in API calls are anonymous
REMOTEFORGE_INTERNAL_KEY=            # same as Fly API — admin settings, and the password for /internal
ADMIN_SETTINGS_TOKEN=                # passphrase for /admin/settings UI
NEXT_PUBLIC_FORGEAHEAD_URL=https://forgeahead.intelliforge.tech
NEXT_PUBLIC_VETTD_URL=https://www.vettd-app.com
ANTHROPIC_API_KEY=                   # optional; only app/api/cover-letter uses it
```

## 3. Product settings (affiliate links)

Configure referral and affiliate links at **`/admin/settings`** (not indexed).

1. Set on **Vercel** (web): `ADMIN_SETTINGS_TOKEN`, `REMOTEFORGE_INTERNAL_KEY`
2. Set on **Fly API**: `REMOTEFORGE_INTERNAL_KEY` (same value)
3. Run `pnpm db:push && pnpm db:seed` to create `ProductSetting` rows
4. Open `https://remoteforge.intelliforge.tech/admin/settings`, enter `ADMIN_SETTINGS_TOKEN`

**Remote job boards** (Remotive, WWR, Turing, Toptal, Remote.com, FlexJobs): affiliate tag IDs saved in DB; applied live on `/go/:id` redirects.

**AI gig platforms** (Outlier, Appen, etc.): per-platform referral URL, affiliate URL, and reward note.

Env vars (`AFFILIATE_*`) still work as fallback until you save a value in the admin UI.

### Owner stats (`/internal`)

`https://remoteforge.intelliforge.tech/internal` shows human clicks, total subscribers, the **prep waitlist** and **approval alert** totals, and interest per platform (one row per `Subscriber.signals` value, e.g. `outlier-ai · prep-waitlist`). Waitlist totals count `source = 'prep-waitlist'` or any `prep-waitlist:*` signal, so guide signups are included.

The page is behind HTTP basic auth in `apps/web/middleware.ts`: any username, `REMOTEFORGE_INTERNAL_KEY` as the password. With the key unset on Vercel the page stays locked; with it unset on Fly the page loads but shows "Unable to load stats". Setup:

```bash
KEY=$(openssl rand -hex 32); echo $KEY     # this is your password
fly secrets set REMOTEFORGE_INTERNAL_KEY=$KEY -a remoteforge-api
vercel env add REMOTEFORGE_INTERNAL_KEY production   # same value, then redeploy the web
```

Each load queries Neon and wakes it for ~5 minutes. Open it by hand; never point a monitor or cron at it.

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
   curl -fsS -H "Authorization: Bearer $(grep '^CRON_SECRET=' apps/api/.env | cut -d= -f2- | tr -d '\r"')" \
     https://remoteforge-api.fly.dev/api/jobs/ingest
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

## 5. Email (AgentMail)

The weekly digest (`GET /api/cron/digest`) sends through [AgentMail](https://docs.agentmail.to) from `alerts@intelliforge.tech`. That inbox already exists in the IntelliForge AgentMail org, which also sends mail for other apps, so spam complaints here affect them too. Code: `packages/job-alerts/src/email.ts`.

Use the scoped CLI. The unscoped `agentmail-cli` package fails on Windows with `Unsupported platform: win32-x64`. The CLI has no login; it reads `AGENTMAIL_API_KEY` from the environment.

```bash
# Create a key for this app (authenticate with any existing org key)
AGENTMAIL_API_KEY=am_us_... npx @agentmail/cli api-keys create --name remoteforge-api

# Put it on Fly (restarts the machine)
fly secrets set AGENTMAIL_API_KEY=am_us_... AGENTMAIL_INBOX_ID=alerts@intelliforge.tech -a remoteforge-api
```

Set a key from your own shell, not a chat or a committed file.

### Signup confirmation

`POST /api/subscribe` emails a confirmation only for a new address, or an existing one with a new `signal` (joining another waitlist or alert). Otherwise it sends nothing and returns `alreadySubscribed: true`, and the form says "You're already subscribed with this email." A failed send never fails the signup; it logs `[subscribe] confirmation email failed: ...` on Fly. To test the full path, sign up on the live site with a fresh plus-address (`you+rf1@gmail.com`); reusing an address sends nothing.

### Verifying email

1. **Key can reach the inbox** (sends nothing):

   ```bash
   npx @agentmail/cli --format json inboxes retrieve --inbox-id alerts@intelliforge.tech
   ```

2. **Delivery works.** Send one message to yourself:

   ```bash
   npx @agentmail/cli --format json inboxes:messages send \
     --inbox-id alerts@intelliforge.tech --to you@example.com \
     --subject "RemoteForge AgentMail test" --text "Test send"
   ```

   A `message_id` in the response means AgentMail accepted the message. Check the inbox and the spam folder.

3. **Digest end to end, to one address.** `?to=` sends the real digest to that address only; it need not be a subscriber. Without `?to=`, the route emails **every** `Subscriber` row.

   ```bash
   curl -fsS -H "Authorization: Bearer $CRON_SECRET" \
     "https://remoteforge-api.fly.dev/api/cron/digest?to=you@example.com"
   ```

   ```json
   {"success":true,"data":{"mode":"test","subscribers":1,"emailsSent":2,"errors":[]}}
   ```

   A test recipient gets both the job and gig emails, so `emailsSent` is 2. The route returns 200 even when every send fails, so a green Cron run is not proof. `emailsSent` counts successful sends; `errors` holds up to five failures:

   | `errors` entry | Cause |
   |----------------|-------|
   | `AGENTMAIL_API_KEY not configured` | secret missing on Fly |
   | `AGENTMAIL_INBOX_ID not configured` | secret missing on Fly |
   | `AgentMail API error 401/403: ...` | key revoked, or from another org |
   | `AgentMail API error 404: ...` | inbox id wrong |

### Unsubscribe

Every digest carries an unsubscribe link, both in the body and as `List-Unsubscribe` plus `List-Unsubscribe-Post` headers, so Gmail and Yahoo show their one-click button. The link is `GET /api/unsubscribe?e=<email>&t=<hmac>`. GET only renders a confirm button, because mail scanners fetch every URL. The POST from that button, or from a mail client's one-click, deletes the `Subscriber` row.

| Fly secret | Default | Notes |
|------------|---------|-------|
| `UNSUBSCRIBE_SECRET` | falls back to `CRON_SECRET` | HMAC key for the links. Set it so that rotating `CRON_SECRET` doesn't break links already sent; changing it invalidates every sent link |
| `API_PUBLIC_URL` | `https://remoteforge-api.fly.dev` | base URL the links point at |

If neither secret is set, emails go out with no unsubscribe link.

### Rotating the key

Create a new key as above, `fly secrets set AGENTMAIL_API_KEY=...`, confirm with step 1, then delete the old key with `npx @agentmail/cli api-keys list` and `api-keys delete`.

## 6. Local dev

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

## 7. Dormant worker

`workers/ingestion` is **not deployed**: no `remoteforge-ingestion` app exists on Fly, and the 6h GitHub Actions cron runs ingest inline on the API. Keep `REDIS_URL` unset on the API: when it is set, `/api/jobs/ingest` queues to BullMQ and returns `mode: "queued"`, and without a worker nothing ever ingests. If a Redis connection fails it falls back to inline.

To deploy it anyway:

```bash
fly apps create remoteforge-ingestion
fly secrets set --app remoteforge-ingestion DATABASE_URL=... REDIS_URL=...
pnpm deploy:worker
```


## 8. Razorpay webhook

Point to Fly (not Vercel):

```
https://remoteforge-api.fly.dev/api/webhooks/razorpay
```
