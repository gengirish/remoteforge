import { guides } from "@/content/guides";
import { test, expect } from "./support";

// Every public page renders its heading without a server error or an uncaught
// client exception. Detail routes use slugs that exist in e2e/mock-api/fixtures.mjs.
const PUBLIC_PAGES: { path: string; heading: string | RegExp }[] = [
  { path: "/", heading: /Get approved on AI training platforms/ },
  { path: "/jobs", heading: "Remote Jobs" },
  { path: "/jobs/senior-backend-engineer-acme-e2e", heading: "Senior Backend Engineer" },
  { path: "/jobs/category/engineering", heading: /engineering/i },
  { path: "/jobs/tag/node", heading: /node/i },
  { path: "/ai-gigs", heading: "AI Gig Platforms" },
  { path: "/ai-gigs/outlier-ai", heading: "Outlier AI" },
  { path: "/ai-gigs/outlier-ai/earnings", heading: "Outlier AI — Real Earnings" },
  { path: "/guides/ai-gigs-india-starter", heading: "India AI Gig Starter Path" },
  { path: "/salary", heading: "Remote Salary Benchmarks" },
  { path: "/salary/backend-engineer", heading: "Backend Engineer" },
  { path: "/salary/submit", heading: "Submit Your Salary" },
  { path: "/companies/hiring-from-india", heading: /India/ },
  { path: "/companies/acme-remote", heading: /Acme Remote/ },
  { path: "/community/wins", heading: /./ },
  { path: "/community/income-report", heading: /./ },
  { path: "/premium", heading: /./ },
  { path: "/employer", heading: /./ },
  { path: "/data-api", heading: /./ },
  ...guides.map((g) => ({ path: `/guides/${g.slug}`, heading: g.title })),
];

for (const { path, heading } of PUBLIC_PAGES) {
  test(`renders ${path}`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status(), `status for ${path}`).toBe(200);
    await expect(page.getByRole("heading", { level: 1 }).first()).toHaveText(heading);
  });
}

// jobs/[slug] and ai-gigs/[slug] have a loading.tsx, so Next streams a 200
// before notFound() runs: a soft 404. Assert what users and crawlers get (the
// not-found page and noindex) rather than the status code.
for (const path of ["/jobs/does-not-exist-e2e", "/ai-gigs/does-not-exist-e2e"]) {
  test(`unknown slug ${path} shows not-found and is noindex`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: "This page could not be found." })).toBeVisible();
    await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();
  });
}

test("unknown guide slug returns 404", async ({ page }) => {
  const res = await page.goto("/guides/does-not-exist-e2e");
  expect(res?.status()).toBe(404);
});
