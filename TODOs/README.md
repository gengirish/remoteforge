# RemoteForge — TODOs & Planning

This folder tracks what’s **done**, **in progress**, and **planned** for RemoteForge. It complements the architecture spec in [`remotejobs-affiliate-engine-scaffold-prompt.md`](../remotejobs-affiliate-engine-scaffold-prompt.md).

## How to use

| File | Purpose |
|------|---------|
| [plan.md](./plan.md) | Master roadmap — phases, goals, dependencies |
| [P0-production-launch.md](./P0-production-launch.md) | Ship & stabilize (deploy, ingest, cron) |
| [P1-monetization-affiliates.md](./P1-monetization-affiliates.md) | Revenue: Turing, Toptal, Outlier, featured slots |
| [P2-companies-and-seo.md](./P2-companies-and-seo.md) | WWR employers, `/companies`, blog, India SEO |
| [P3-integrations.md](./P3-integrations.md) | ForgeAhead, Vettd, cross-auth, Clerk SSO |
| [done.md](./done.md) | Completed work log |

## Priority key

- **P0** — Blocks launch or breaks prod
- **P1** — Revenue / core value within 30 days
- **P2** — Growth & SEO moat (30–90 days)
- **P3** — Ecosystem integrations (90+ days)

## Status markers

Use these in task lists:

- `[ ]` Not started
- `[~]` In progress
- `[x]` Done
- `[—]` Won't do / deferred (note why)

## Updating

When finishing work:

1. Check the task in the relevant P* file
2. Add a one-line entry to `done.md` with date
3. Update phase status in `plan.md` if a milestone completes
