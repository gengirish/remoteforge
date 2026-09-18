import type { Page } from "@playwright/test";
import { test, expect, API_URL } from "./support";

const cards = (page: Page) => page.locator("article");

test.describe("job listing", () => {
  test("lists jobs with total and INR salary", async ({ page }) => {
    await page.goto("/jobs");
    await expect(page.getByText("2 roles open to remote workers")).toBeVisible();
    await expect(cards(page)).toHaveCount(2);

    const backend = cards(page).filter({ hasText: "Senior Backend Engineer" });
    await expect(backend.getByText("India OK")).toBeVisible();
    // 4000–6000 cents/hr at the fixed e2e rate of 84.
    await expect(backend.getByText("$40/hr–$60/hr · ₹3,360/hr–₹5,040/hr")).toBeVisible();
    // Only four tags are shown; the fifth collapses into a counter.
    await expect(backend.getByText("+1")).toBeVisible();
    await expect(backend.getByRole("link", { name: "Apply" })).toHaveAttribute(
      "href",
      `${API_URL}/go/job_e2e_backend?type=job&clickType=apply`,
    );
  });

  test("category filter updates the URL and results", async ({ page }) => {
    await page.goto("/jobs");
    await page.getByRole("button", { name: "design", exact: true }).click();
    await expect(page).toHaveURL(/category=design/);
    await expect(cards(page)).toHaveCount(1);
    await expect(cards(page).first()).toContainText("Product Designer");

    await page.getByRole("button", { name: "All", exact: true }).click();
    await expect(page).not.toHaveURL(/category=/);
    await expect(cards(page)).toHaveCount(2);
  });

  test("India-friendly filter hides international-only jobs", async ({ page }) => {
    await page.goto("/jobs");
    // The box is driven by the URL, so it only flips once router.push lands;
    // check() would assert too early.
    await page.getByLabel("India-friendly only").click();
    await expect(page).toHaveURL(/indiaOnly=true/);
    await expect(page.getByLabel("India-friendly only")).toBeChecked();
    await expect(cards(page)).toHaveCount(1);
    await expect(cards(page).first()).toContainText("Senior Backend Engineer");
  });

  test("search narrows results and shows the empty state", async ({ page }) => {
    await page.goto("/jobs");
    const search = page.getByRole("searchbox", { name: /Search jobs/ });

    await search.fill("globex");
    await expect(page).toHaveURL(/search=globex/);
    await expect(cards(page)).toHaveCount(1);

    await search.fill("no-such-role-xyz");
    await expect(page.getByText("No jobs match your filters")).toBeVisible();
    await expect(cards(page)).toHaveCount(0);
  });

  test("filters survive a reload from the URL", async ({ page }) => {
    await page.goto("/jobs?category=engineering&indiaOnly=true");
    await expect(page.getByLabel("India-friendly only")).toBeChecked();
    await expect(cards(page)).toHaveCount(1);
  });
});

test.describe("job detail", () => {
  test("active job shows apply flow and JobPosting structured data", async ({ page }) => {
    await page.goto("/jobs/senior-backend-engineer-acme-e2e");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Senior Backend Engineer");
    await expect(page.getByText("Build APIs for a distributed team")).toBeVisible();
    await expect(page.getByText("Score your resume against this JD →")).toBeVisible();

    const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(JSON.parse(jsonLd ?? "{}")["@type"]).toBe("JobPosting");
  });

  test("clicking a card opens the detail page", async ({ page }) => {
    await page.goto("/jobs");
    await cards(page).filter({ hasText: "Product Designer" }).getByRole("link", { name: "Details" }).click();
    await expect(page).toHaveURL(/\/jobs\/product-designer-globex-e2e$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Product Designer");
    await expect(page.getByText("Intl only")).toBeVisible();
  });

  test("closed job says so, disables applying, and drops structured data", async ({ page }) => {
    await page.goto("/jobs/closed-support-role-e2e");
    await expect(page.getByRole("status")).toContainText("no longer accepting applications");
    await expect(page.getByRole("button", { name: "Applications closed" })).toBeDisabled();
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });
});
