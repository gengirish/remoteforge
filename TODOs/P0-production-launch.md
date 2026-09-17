# P0 — Production launch & stability

**Phase goal:** RemoteForge is live, ingesting jobs, and reliable for Indian remote job seekers.

---

## Deploy & infrastructure

- [ ] Verify Vercel prod deploy from `master` (web)
- [ ] Verify Fly.io prod deploy (API, sin region; bom is deprecated)
- [ ] Confirm Neon Postgres connection + migrations applied
- [ ] Set all prod env vars per DEPLOY.md (API URL, DATABASE_URL, CRON_SECRET)
- [ ] Configure GitHub Actions cron → `/api/jobs/ingest` + `/api/cron/digest`
- [ ] Optional: deploy BullMQ worker on Fly if not using HTTP cron-only ingest
- [ ] Add API health endpoint monitoring (uptime check)

## Ingestion

- [ ] Run manual ingest in prod; confirm jobs upserted
- [ ] Compare WWR source volume vs DB (e.g. Lumenalta ~573 on WWR → spot-check count in DB)
- [ ] Verify dedup across remotive / wwr / remoteok (no duplicate slugs)
- [ ] Confirm `indiaFriendly` tagging on US-only listings
- [ ] Schedule 6h repeat ingest; alert on failure

## Web app QA

- [ ] Homepage stats match DB (`jobCount`, `gigCount`, `indiaGigCount`)
- [ ] `/jobs` search, category pills, India filter, pagination
- [ ] `/jobs/[slug]` apply link + JSON-LD valid
- [ ] `/ai-gigs` filters + India-only toggle
- [ ] Email subscribe form → API → Subscriber row
- [ ] Dark mode + mobile nav smoke test
- [ ] Clerk auth optional path (sign in/up when keys set)

## Performance & SEO baseline

- [ ] ISR/revalidate windows appropriate (1h listings)
- [ ] `robots.txt` + sitemap.xml (create if missing)
- [ ] Core Web Vitals spot check on Vercel preview

## Documentation

- [ ] README + DEPLOY.md match actual prod URLs
- [ ] `.env.example` complete for web + api + worker

---

## Done when

- [ ] ≥1,000 active jobs in prod DB
- [ ] Cron ingest succeeds 3 consecutive runs
- [ ] No P0 bugs on jobs/gigs/subscribe flows
