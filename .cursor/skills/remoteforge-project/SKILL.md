---
name: remoteforge-project
description: >-
  RemoteForge — India's remote jobs + AI gig work affiliate engine. Start here
  for architecture, skill routing, monorepo layout, deploy targets, and
  product integrations (ForgeAhead, Vettd).
---

# RemoteForge

India-focused aggregator for **remote jobs** (Remotive, WWR, RemoteOK) and **AI gig platforms** (Outlier, Appen, TELUS). Monetized via affiliate CPA, referral links, Razorpay featured slots, and SEO content.

## Architecture

```
apps/web/              Next.js 14 App Router → Vercel
packages/db/           Prisma + PostgreSQL (Neon/Supabase) — @intelliforge/db
packages/ingestion/    Shared ingestion logic (sources, processors)
packages/affiliate-links/  Job/gig affiliate URL wrapping
packages/job-alerts/   Resend email + WhatsApp digests
packages/cross-auth/   SSO handoff JWTs (ForgeAhead/Vettd)
workers/ingestion/     BullMQ worker → Fly.io bom (optional; Vercel cron runs inline ingest)
```

## Key routes

| Route | Purpose |
|-------|---------|
| `/jobs`, `/jobs/[slug]`, `/jobs/tag/[tag]` | Remote job listings (ISR/SSG) |
| `/ai-gigs`, `/ai-gigs/[slug]` | AI gig platform comparison |
| `/go/[id]` | Affiliate redirect + click tracking |
| `/api/jobs/ingest` | Cron trigger (Bearer `CRON_SECRET`) |
| `/api/webhooks/razorpay` | Featured slot payment webhook |
| `/api/subscribe` | Email + WhatsApp alert signup |

## Skill index

| Task | Skill |
|------|-------|
| Project overview, routing | **remoteforge-project** (this file) |
| Monorepo, pnpm, turbo | **turborepo-pnpm** |
| Next.js pages, ISR, API routes | **nextjs-app-router-patterns** |
| Prisma schema, migrations, seed | **prisma-expert** |
| PostgreSQL tuning | **postgres-best-practices** |
| BullMQ workers, ingestion queues | **bullmq-dag-worker**, **bullmq-specialist** |
| shadcn/ui + Tailwind | **shadcn-tailwind-ui** |
| Zod validation | **zod-schemas** |
| Server actions | **next-safe-action** |
| Razorpay payments | **razorpay-integration** |
| Webhook security | **harden-webhook-endpoint** |
| Affiliate/referral strategy | **referral-program** |
| Email digests | **react-email-resend** |
| WhatsApp alerts | **whatsapp-notifications** |
| SEO pages, tag/category content | **ws-seo-technical-optimization**, **ws-seo-content-creation**, **seo-auditing** |
| Blog/content moat | **ws-content-marketing** |
| Landing page | **landing-page-generator** |
| Auth (Clerk) | **auth-password-reset** |
| E2E tests | **playwright-e2e** |
| CI setup | **setting-up-ci** |
| Onboarding new contributors | **codebase-onboarding** |
| Multi-phase shipping | **parallel-phase-shipping** |

## Local dev

```bash
pnpm install
cp .env.example .env
pnpm db:push && pnpm db:seed
pnpm dev          # web on :3000
pnpm ingest       # manual job ingestion
```

## Deploy

- **Web**: Vercel — root `vercel.json`, Node 22. See `DEPLOY.md`.
- **Worker**: `workers/ingestion` → Fly.io bom (needs `REDIS_URL`).
- **DB**: Neon PostgreSQL with `sslmode=require`.

## Product integrations

- **ForgeAhead**: `ScoreResumeCTA` deep-links to resume scorer; `/api/jobs/by-slug/[slug]` exposes JD data.
- **Vettd**: `EmployerUpsellBanner` on featured job pages.
- **Cross-auth**: `@intelliforge/cross-auth` issues 5-minute handoff JWTs.

## Reference doc

Full architecture, schema, and scaffold spec: `remotejobs-affiliate-engine-scaffold-prompt.md` at repo root.
