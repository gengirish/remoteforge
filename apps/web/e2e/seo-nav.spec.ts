import { guideSlugs } from "@/content/guides";
import { test, expect } from "./support";

test.describe("SEO", () => {
  test("sitemap lists guides, jobs, and gig pages from the API", async ({ request, baseURL }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const xml = await res.text();

    for (const slug of guideSlugs) expect(xml).toContain(`${baseURL}/guides/${slug}</loc>`);
    expect(xml).toContain(`${baseURL}/jobs/senior-backend-engineer-acme-e2e</loc>`);
    expect(xml).toContain(`${baseURL}/ai-gigs/outlier-ai</loc>`);
    expect(xml).toContain(`${baseURL}/ai-gigs/outlier-ai/earnings</loc>`);
    // Expired jobs are not in the slug list.
    expect(xml).not.toContain("closed-support-role-e2e");
  });

  test("robots.txt allows crawling and points at the sitemap", async ({ request, baseURL }) => {
    const body = await (await request.get("/robots.txt")).text();
    expect(body).toMatch(/Allow: \//);
    expect(body).toContain(`Sitemap: ${baseURL}/sitemap.xml`);
  });

  test("security headers are set", async ({ request }) => {
    const res = await request.get("/");
    expect(res.headers()["x-frame-options"]).toBe("DENY");
    expect(res.headers()["x-content-type-options"]).toBe("nosniff");
    expect(res.headers()["x-powered-by"]).toBeUndefined();
  });
});

test.describe("navigation", () => {
  test("header links reach each section and mark it active", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("banner").getByRole("navigation");

    await nav.getByRole("link", { name: "Remote Jobs" }).click();
    await expect(page).toHaveURL(/\/jobs$/);
    await expect(nav.getByRole("link", { name: "Remote Jobs" })).toHaveClass(/text-primary/);

    await nav.getByRole("link", { name: "AI Gig Work" }).click();
    await expect(page).toHaveURL(/\/ai-gigs$/);

    await nav.getByRole("link", { name: "Companies" }).click();
    await expect(page).toHaveURL(/\/companies\/hiring-from-india$/);
  });

  test("no sign-in buttons render when Clerk is not configured", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Sign in" })).toHaveCount(0);
  });
});

test.describe("mobile @mobile", () => {
  test("menu opens, navigates, and closes", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("banner").getByRole("link", { name: "Remote Jobs" }).click();
    await expect(page).toHaveURL(/\/jobs$/);
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  });

  test("job cards stack in one column without horizontal scroll", async ({ page }) => {
    await page.goto("/jobs");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
