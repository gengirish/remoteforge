# WWR top employers — data usage notes

**Source:** We Work Remotely company leaderboard (ranked by open job count + company bio).  
**Ingestion:** Jobs from these employers already flow via `packages/ingestion/src/sources/wwr.ts` — **do not** manually re-import job listings.

---

## What the export contains

| Field | Example | Use in RemoteForge |
|-------|---------|-------------------|
| Rank + name | `1 Lumenalta` | Company slug + display name |
| Jobs posted | `573` | Sort key, trust badge, QA benchmark |
| Actively hiring | `Toptal Actively Hiring` | Optional UI badge |
| Bio | Long paragraph | `/companies/[slug]` description (v2 seed) |

---

## Top 20 by volume (prioritize for v1 pages + outreach)

| # | Company | Jobs | Notes |
|---|---------|------|-------|
| 1 | Lumenalta | 573 | High-volume QA target for ingest |
| 2 | Contra | 464 | Creator/gig-adjacent |
| 3 | Toptal | 308 | P1 affiliate; talent network |
| 4 | Hotjar | 248 | SaaS, global remote |
| 5 | TaxJar | 216 | US-heavy; check India jobs |
| 6 | Aha! | 199 | Featured slot outreach |
| 7 | Toggl | 178 | Actively hiring |
| 8 | OnTheGoSystems | 166 | i18n / WordPress |
| 9 | Close | 161 | Strong benefits copy for company page |
| 10 | ReCharge Payments | 156 | E-commerce SaaS |
| 11 | TestGorilla | 150 | HR tech |
| 12 | Proxify AB | 145 | India-friendly talent network |
| 13 | X-Team | 142 | Dev staffing, global |
| 14 | Shogun | 134 | YC, e-commerce |
| 15 | Modern Tribe | 125 | WordPress agency |
| 16 | Automattic | 119 | WordPress.com, strong brand |
| 17 | Paymentology | 115 | Fintech |
| 18 | Lemon.io | 115 | Dev marketplace, India-friendly |
| 19 | AgencyAnalytics | 110 | Toronto, remote-first |
| 20 | Fleetio | 107 | SaaS |

Full list: 100 companies provided in product chat (2026-06-23). Store raw CSV/JSON in this folder when available:

```
TODOs/data/wwr-top-employers.json   ← optional future import file
```

---

## Implementation checklist

1. **Aggregate from DB** (v1): `GROUP BY company` on `Job` where `isActive = true`
2. **Compare counts**: WWR rank vs DB count → ingest health metric
3. **Seed bios** (v2): Map company name → bio from export into `Company.description`
4. **India filter**: Show `% indiaFriendly` jobs per company on company page
5. **Outreach**: Companies with 100+ jobs → featured slot + Vettd email list

---

## Companies to handle specially

| Company | Action |
|---------|--------|
| **NoGigiddy** | Gig/side-hustle platform — evaluate for `/ai-gigs` listing |
| **We Work Remotely** | Meta (the source), not an employer page |
| **Proxify, X-Team, G2i, Arc, Lemon.io** | Tag as talent networks; prioritize for India users |
| **GitHub, Zapier, Automattic** | High brand value — prioritize SEO company pages |

---

## QA query (after ingest)

```sql
-- Top employers in DB vs expected WWR volume
SELECT company, COUNT(*) AS active_jobs,
       SUM(CASE WHEN "indiaFriendly" THEN 1 ELSE 0 END) AS india_jobs
FROM "Job"
WHERE "isActive" = true
GROUP BY company
ORDER BY active_jobs DESC
LIMIT 25;
```

Compare `Lumenalta` (or similar) count to WWR’s 573 — large gaps indicate ingest or dedup issues.
