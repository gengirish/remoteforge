# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

RemoteForge — India-focused aggregator for remote jobs (Remotive, WWR, RemoteOK) and AI gig platforms, monetized via affiliate CPA, Razorpay featured slots, and SEO content. Turborepo + pnpm monorepo.

## Commands

```bash
pnpm install
cp .env.example .env          # root .env feeds scripts; apps/api/.env and apps/web/.env.local are separate
pnpm db:push && pnpm db:seed  # schema + demo data

pnpm dev:api                  # Hono API on :8080  (needs apps/api/.env)
pnpm dev:web                  # Next.js on :3000   (needs API_URL + NEXT_PUBLIC_API_URL in apps/web/.env.local)

pnpm lint                     # tsc --noEmit across all workspaces — the only correctness gate
pnpm build                    # turbo build
pnpm ingest                   # run job ingestion locally against .env

pnpm deploy:api               # Fly.io (sin), --ha=false, single machine
pnpm deploy:web               # Vercel
```

Single workspace: `pnpm --filter api lint`, `pnpm --filter web build`, etc.

The API ships as one esbuild ESM bundle (`apps/api/package.json` `build`). Its `createRequire` banner is load-bearing: without it, CommonJS dependencies that call `require` (e.g. `ws` via `agentmail`) crash the server on boot. Typecheck does not catch this. After adding a dependency, run `pnpm --filter api build && node apps/api/dist/server.mjs` and hit `/health` before pushing, because CI deploys straight to production. Fly's `bom` region is deprecated; the API runs in `sin`.

**There is no test framework.** No vitest/jest/playwright, no test directories. `lint` is `tsc --noEmit` in every workspace, and CI (`.github/workflows/ci.yml`) runs lint + `pnpm --filter web build`, then on pushes to `master` a `deploy-api` job ships the API to Fly (only when `apps/api`, `packages/` or the lockfile changed; uses the `FLY_API_TOKEN` repo secret). Don't add `version:` to `pnpm/action-setup`; it reads `packageManager` from `package.json` and fails if both are set. Do not claim a change is verified on the basis of tests; typecheck and, where it matters, exercise the endpoint.

## Architecture

Split deploy: **Vercel hosts a thin UI, Fly hosts all business logic, Neon holds the data.**

```
apps/web (Vercel)  ──HTTPS──▶  apps/api (Fly.io sin)  ──▶  Neon Postgres
GitHub Actions cron ───────────▶ /api/jobs/ingest (6h), /api/cron/digest (Mon)
```

### The handler indirection (read this before adding an endpoint)

Business logic does **not** live in the server. `packages/api-core/src/handlers.ts` (~1,650 lines) holds framework-agnostic `handle*()` functions that return `{ status, body }`; `apps/api/src/server.ts` (~440 lines) is pure Hono routing that unwraps them. Adding an endpoint means three files:

1. Write `handleThing()` in `packages/api-core/src/handlers.ts`
2. Export it from `packages/api-core/src/index.ts`
3. Add the route in `apps/api/src/server.ts`

Bodies use the envelope from `packages/api-core/src/response.ts`: `ok(data)` → `{success: true, data}`, `fail(msg)` → `{success: false, error}`.

### Web → API

`apps/web/lib/data.ts` is the **only** place the UI talks to the API. Its `apiFetch` unwraps the envelope and **returns `null` on any failure** — callers get `null`, never an exception, so pages must handle empty state rather than try/catch. Default cache is `next: { revalidate: 3600 }`; pages set `export const revalidate = 3600` (or `dynamic = "force-dynamic"` for authed pages).

`apps/web` has no API routes except `app/api/cover-letter/route.ts`. Anything else server-side belongs in `api-core`.

### Auth and trust boundaries

- **Clerk is optional and feature-flagged.** `apps/web/lib/clerk-config.ts` exports `isClerkEnabled` (true only when a publishable key was present at build). `middleware.ts` and layouts branch on it, so the app must build and run with Clerk absent.
- The web sends the Clerk **session token** as `Authorization: Bearer` (`getToken()` from `auth()` / `useAuth()`), and `clerkUserId()` in `apps/api/src/server.ts` verifies it with `@clerk/backend`. Never pass a user id from the client. Without a valid token, or with `CLERK_SECRET_KEY` unset on Fly, every user route sees an anonymous request.
- Admin/internal routes require `X-Internal-Key` (`REMOTEFORGE_INTERNAL_KEY`); cron routes accept `Authorization: Bearer` or `X-Cron-Secret` via `authorizeCron()` against `CRON_SECRET`.

### Database

Prisma against Neon (pooled `-pooler` host, `sslmode=require`), 26 models, singleton client in `packages/db/src/client.ts`. **There is no migrations directory** — schema changes go through `pnpm db:push` then `pnpm db:generate`. Type exports for the rest of the monorepo are re-exported from `packages/db/src/index.ts`.

### Ingestion

`packages/ingestion` holds the sources and processors; `handleIngest` runs them **in-process on the API**. `workers/ingestion` is a BullMQ app that is **not currently deployed** (no `remoteforge-ingestion` app exists on Fly) — scheduling actually comes from `.github/workflows/cron.yml` hitting the API every 6h. Treat the worker as dormant unless you deploy it.

### Email

`packages/job-alerts/src/email.ts` sends through **AgentMail** (`agentmail` SDK), not Resend. It reads `AGENTMAIL_API_KEY` and `AGENTMAIL_INBOX_ID` (`alerts@intelliforge.tech`, shared with other IntelliForge apps) and never throws: a missing key or API error comes back as `{ ok: false, error }`. `handleDigest` still returns 200 when every send fails, so check `emailsAttempted` and `errors` in its body. Links use `NEXT_PUBLIC_APP_URL`, falling back to `https://remoteforge.intelliforge.tech`; `remoteforge.in` does not resolve. Setup and testing are in `DEPLOY.md`.

USD→INR conversion syncs daily from Frankfurter into the `ExchangeRate` model (`packages/db/src/exchange-rate.ts`); `USD_TO_INR_RATE` in env is only a fallback.

## Cost constraint: nothing on a timer may touch Postgres

Neon scales to zero after 5 minutes idle. A DB-backed health check on a 30s interval pins the compute awake 100% of the time — this previously cost ~$33/mo against a 34 MB database.

- `/health` and `/api/health` are **liveness only, no DB access**. The Fly check in `apps/api/fly.toml` polls `/health`; keep it DB-free.
- `/api/health/deep` is the DB-backed readiness check, cached 5 minutes, manual use only. Never point a probe, cron, or uptime monitor at it.
- `min_machines_running = 0` in `apps/api/fly.toml` lets the machine sleep. Raising it pins the machine and, if any probe touches the DB, the Neon compute with it.
- `node scripts/idle-audit.mjs` reports every Fly machine and (with `NEON_API_KEY` set) every Neon compute with its state and autoscale ceiling.

## Conventions

- `.cursor/skills/remoteforge-project/SKILL.md` is the skill routing table for this repo (Prisma, BullMQ, Razorpay, SEO, shadcn, etc.); `remotejobs-affiliate-engine-scaffold-prompt.md` at root is the full original architecture spec.
- Affiliate links are wrapped through `packages/affiliate-links` and resolved server-side in `packages/api-core/src/affiliate.ts`; `/go/:id` records the click and redirects.
- Cross-product SSO to ForgeAhead/Vettd uses 5-minute handoff JWTs from `packages/cross-auth`.
