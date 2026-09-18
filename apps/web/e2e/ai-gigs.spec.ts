import { test, expect, expectRecorded, uniqueEmail, API_URL } from "./support";

test.describe("AI gig listing", () => {
  test("splits platforms by India eligibility", async ({ page }) => {
    await page.goto("/ai-gigs");

    const india = page.locator("section", { has: page.getByRole("heading", { name: /India-accepted platforms/ }) });
    const intl = page.locator("section", { has: page.getByRole("heading", { name: /International platforms/ }) });

    await expect(india.getByRole("heading", { level: 2 })).toContainText("(2)");
    await expect(india.locator("article")).toHaveCount(2);
    await expect(intl.locator("article")).toHaveCount(1);
    await expect(intl.locator("article")).toContainText("StateSide Labels");
  });

  test("type filter narrows the list", async ({ page }) => {
    await page.goto("/ai-gigs");
    await page.getByRole("link", { name: "evaluator", exact: true }).click();
    await expect(page).toHaveURL(/type=evaluator/);
    await expect(page.locator("article")).toHaveCount(1);
    await expect(page.locator("article")).toContainText("Mercor");
  });

  test("India-only toggle drops international platforms", async ({ page }) => {
    await page.goto("/ai-gigs");
    await page.getByRole("link", { name: /India only/ }).click();
    await expect(page).toHaveURL(/indiaOnly=true/);
    await expect(page.getByRole("heading", { name: /International platforms/ })).toHaveCount(0);
  });

  test("card links go to the guide and the tracked referral", async ({ page }) => {
    await page.goto("/ai-gigs");
    const card = page.locator("article", { hasText: "Outlier AI" });
    await expect(card.getByRole("link", { name: "Apply / Refer" })).toHaveAttribute(
      "href",
      `${API_URL}/go/gig_e2e_outlier?type=gig&clickType=referral`,
    );
    await card.getByRole("link", { name: "View guide" }).click();
    await expect(page).toHaveURL(/\/ai-gigs\/outlier-ai$/);
  });
});

test.describe("AI gig detail", () => {
  test("shows the approval guide for platforms with editorial content", async ({ page }) => {
    await page.goto("/ai-gigs/outlier-ai");
    await expect(page.getByRole("heading", { name: "How to get approved on Outlier AI from India" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Eligibility" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Common rejection reasons" })).toBeVisible();

    const types = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((els) => els.map((e) => JSON.parse(e.textContent ?? "{}")["@type"]));
    expect(types).toContain("FAQPage");
  });

  test("approval alert sends the per-platform signal", async ({ page }) => {
    const email = uniqueEmail("gig-alert");
    await page.goto("/ai-gigs/mercor");

    const form = page.locator("section", { hasText: "Get an alert when Mercor opens onboarding" }).locator("form");
    await form.getByLabel("Email address").fill(email);
    await form.getByRole("button", { name: "Alert me" }).click();
    await expect(form.getByRole("status")).toContainText("subscribed");

    const req = await expectRecorded("/api/subscribe", (r) => r.body?.email === email);
    expect(req.body).toMatchObject({ source: "gig-approval-alert", signal: "approval-alert:mercor" });
  });

  test("prep waitlist sends the prep-waitlist signal", async ({ page }) => {
    const email = uniqueEmail("gig-prep");
    await page.goto("/ai-gigs/outlier-ai");

    const form = page.locator("section", { hasText: "Outlier AI assessment prep pack" }).locator("form");
    await form.getByLabel("Email address").fill(email);
    await form.getByRole("button", { name: "Join the waitlist" }).click();
    await expect(form.getByRole("status")).toContainText("subscribed");

    const req = await expectRecorded("/api/subscribe", (r) => r.body?.email === email);
    expect(req.body).toMatchObject({ source: "prep-waitlist", signal: "prep-waitlist:outlier-ai" });
  });

  test("international-only platform suggests India alternatives and no approval guide", async ({ page }) => {
    await page.goto("/ai-gigs/us-only-annotator-e2e");
    await expect(page.getByText("Intl only").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /How to get approved/ })).toHaveCount(0);

    const alts = page.locator("section", { has: page.getByRole("heading", { name: "India-accepted alternatives" }) });
    await expect(alts.locator("article")).toHaveCount(2);
  });

  test("earnings report form posts the platform id", async ({ page }) => {
    const city = `E2E-City-${Date.now()}`;
    await page.goto("/ai-gigs/outlier-ai");

    const form = page.locator("form", { hasText: "Share your real earnings" });
    await form.locator("select").nth(1).selectOption("20");
    await form.getByPlaceholder("e.g. 800").fill("750");
    await form.getByPlaceholder(/Bangalore/).fill(city);
    await form.getByRole("button", { name: "Submit anonymously" }).click();
    await expect(page.getByText("Thanks! Your earnings report helps")).toBeVisible();

    const req = await expectRecorded("/api/gigs/earnings", (r) => r.body?.city === city);
    expect(req.body).toMatchObject({
      platformId: "gig_e2e_outlier",
      taskType: "rlhf",
      hoursPerWeek: 20,
      earningsUsdMonth: 750,
    });
  });

  test("earnings page shows the median and task breakdown", async ({ page }) => {
    await page.goto("/ai-gigs/outlier-ai/earnings");
    await expect(page.getByText("$650").first()).toBeVisible();
    await expect(page.getByText("$1,400")).toBeVisible();
    await page.getByRole("link", { name: /Back to Outlier AI/ }).click();
    await expect(page).toHaveURL(/\/ai-gigs\/outlier-ai$/);
  });
});
