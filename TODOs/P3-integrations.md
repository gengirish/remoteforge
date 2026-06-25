# P3 — Product integrations (ForgeAhead + Vettd)

**Phase goal:** Closed-loop marketplace — discover (RemoteForge) → prepare (ForgeAhead) → screen (Vettd).

Reference: scaffold Part 7 (I1–I6).

---

## I1 — RemoteForge → ForgeAhead (JD deep-link)

- [x] `ScoreResumeCTA` on `/jobs/[slug]` (basic)
- [ ] ForgeAhead accepts `jd_url` + pre-fetches job from RemoteForge API
- [ ] Public API: `GET /api/jobs/by-slug/[slug]` returns `{ title, description, tags }` for ForgeAhead
- [ ] Cross-auth handoff token on CTA URL (`@intelliforge/cross-auth`)

## I2 — RemoteForge → Vettd (employer upsell)

- [x] `EmployerUpsellBanner` component (basic)
- [ ] Show on correct pages (featured jobs + employer posting flow)
- [ ] UTM attribution verified in Vettd analytics

## I3 — ForgeAhead → RemoteForge (job feed)

- [ ] `X-Internal-Key` auth on `/api/jobs` for ForgeAhead
- [ ] Internal callers get full `description`; public gets truncated
- [ ] ForgeAhead `lib/remoteforge.ts` client (separate repo)
- [ ] Replace ForgeAhead “live job scraping” roadmap item with API pull

## I4 — Vettd → ForgeAhead (Skill Proof)

- [ ] Vettd webhook → ForgeAhead skill-proof ingestion endpoint
- [ ] JWT verification (`VETTD_WEBHOOK_SECRET`)
- [ ] Display Skill Proof badge on ForgeAhead profile

## I5 — ForgeAhead → Vettd (mock interview CTA)

- [ ] `VettdPracticeCTA` when job company uses Vettd screening
- [ ] URL-param attribution (`ref=forgeahead`)

## I6 — Shared auth

- [x] `@intelliforge/cross-auth` package (issue/verify handoff JWT)
- [ ] `INTELLIFORGE_CROSS_AUTH_SECRET` shared across three prod apps
- [ ] Decide: single Clerk instance vs handoff tokens only
- [ ] Auto sign-in / email pre-fill on cross-product navigation

---

## Shared env vars (all products)

```bash
REMOTEFORGE_INTERNAL_KEY=
NEXT_PUBLIC_FORGEAHEAD_URL=
NEXT_PUBLIC_VETTD_URL=
INTELLIFORGE_CROSS_AUTH_SECRET=
VETTD_WEBHOOK_SECRET=
```

- [ ] Document in each repo’s `.env.example`
- [ ] Secrets in Fly/Vercel prod (never commit)

---

## Done when

- [ ] End-to-end: click “Score resume” on RemoteForge → ForgeAhead loads JD
- [ ] ForgeAhead job recommendations pull from RemoteForge API
- [ ] Handoff token verified in ≤5 min expiry window
