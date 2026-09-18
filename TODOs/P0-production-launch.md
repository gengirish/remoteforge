# P0 — Production launch & stability

**Phase goal:** RemoteForge is live, ingesting jobs, and reliable for Indian remote job seekers.

---

## Deploy & infrastructure

- [x] Verify Vercel prod deploy from `master` (web): auto-deploys on push (2026-09-17)
- [x] Verify Fly.io prod deploy (API, sin region; bom is deprecated): CI deploys on push (2026-09-17)
- [ ] Confirm Neon Postgres connection + migrations applied
- [x] Set all prod env vars per DEPLOY.md (API URL, DATABASE_URL, CRON_SECRET): GitHub `API_URL` + `CRON_SECRET` set (2026-09-17)
- [x] Configure GitHub Actions cron → `/api/jobs/ingest` + `/api/cron/digest`: manual run green (2026-09-17)
- [—] Optional: deploy BullMQ worker on Fly: not needed, HTTP cron ingests inline
- [ ] Add API health endpoint monitoring (uptime check): **`/health` only**, never `/api/health/deep` or any DB route (keeps Neon awake 24/7)

## Ingestion

- [x] Run manual ingest in prod; confirm jobs upserted: 200 upserted (2026-09-17)
- [ ] Compare WWR source volume vs DB (e.g. Lumenalta ~573 on WWR → spot-check count in DB)
- [ ] Verify dedup across remotive / wwr / remoteok (no duplicate slugs)
- [ ] Confirm `indiaFriendly` tagging on US-only listings
- [ ] Schedule 6h repeat ingest; alert on failure

## Web app QA

- [ ] Homepage stats match DB (`jobCount`, `gigCount`, `indiaGigCount`)
- [ ] `/jobs` search, category pills, India filter, pagination
- [ ] `/jobs/[slug]` apply link + JSON-LD valid
- [ ] `/ai-gigs` filters + India-only toggle
- [~] Email subscribe form → API → Subscriber row: validation fix live 2026-09-17; live row test in [P1-approval-funnel.md](./P1-approval-funnel.md) §3
- [ ] Dark mode + mobile nav smoke test
- [ ] Clerk auth optional path (sign in/up when keys set)

## Performance & SEO baseline

- [ ] ISR/revalidate windows appropriate (1h listings)
- [x] `robots.txt` + sitemap.xml: `app/robots.ts` and `app/sitemap.ts`; sitemap live with jobs, gigs, guides
- [ ] Core Web Vitals spot check on Vercel preview

## Documentation

- [x] README + DEPLOY.md match actual prod URLs (2026-09-18)
- [~] `.env.example` complete for web + api + worker: root and `apps/api` filled in 2026-09-18; `apps/web` has no example file (web vars are listed in DEPLOY.md §2)

---

## Done when

- [—] ≥1,000 active jobs in prod DB: dropped 2026-09-17; job volume doesn't serve the approval positioning. Replaced by stale-job expiry ([P1-approval-funnel.md](./P1-approval-funnel.md) §1)
- [ ] Cron ingest succeeds 3 consecutive runs
- [ ] No P0 bugs on jobs/gigs/subscribe flows
