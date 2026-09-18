import { test, expect, expectRecorded, uniqueEmail } from "./support";

test.describe("home", () => {
  test("shows platform counts from the API", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("3 AI platforms reviewed")).toBeVisible();
    await expect(page.getByText("2 accept India")).toBeVisible();
    await expect(page.getByRole("link", { name: "6 salary reports" })).toHaveAttribute("href", "/salary");
  });

  test("primary CTA leads to the platform list", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Find platforms that accept India" }).click();
    await expect(page).toHaveURL(/\/ai-gigs$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("AI Gig Platforms");
  });

  test("approval-alert signup posts source and normalized phone", async ({ page }) => {
    const email = uniqueEmail("home-alert");
    await page.goto("/");

    const form = page.locator("section", { hasText: "Know when a platform opens onboarding" }).locator("form");
    await form.getByLabel("Email address").fill(email);
    await form.getByLabel(/WhatsApp/).fill("+91 98765 43210");
    await form.getByRole("button", { name: "Get approval alerts" }).click();

    await expect(form.getByRole("status")).toHaveText("You're subscribed! Check your inbox.");
    await expect(form.getByRole("button", { name: "Subscribed!" })).toBeDisabled();

    const req = await expectRecorded("/api/subscribe", (r) => r.body?.email === email);
    expect(req.body).toMatchObject({
      email,
      phone: "+919876543210",
      source: "home-approval-alerts",
      wantsGigAlerts: true,
      wantsJobAlerts: false,
    });
    expect(req.body.signal).toBeUndefined();
  });

  test("prep waitlist signup is tagged prep-waitlist", async ({ page }) => {
    const email = uniqueEmail("home-prep");
    await page.goto("/");

    const form = page.locator("section", { hasText: "Assessment prep packs" }).locator("form");
    await form.getByLabel("Email address").fill(email);
    await form.getByRole("button", { name: "Join the prep waitlist" }).click();
    await expect(form.getByRole("status")).toContainText("subscribed");

    const req = await expectRecorded("/api/subscribe", (r) => r.body?.email === email);
    expect(req.body.source).toBe("prep-waitlist");
  });

  test("shows the API error when the phone number is rejected", async ({ page }) => {
    await page.goto("/");
    const form = page.locator("section", { hasText: "Know when a platform opens onboarding" }).locator("form");
    await form.getByLabel("Email address").fill(uniqueEmail("home-badphone"));
    await form.getByLabel(/WhatsApp/).fill("98765");
    await form.getByRole("button", { name: "Get approval alerts" }).click();

    await expect(form.getByRole("status")).toHaveText(/WhatsApp number like \+919876543210/);
    await expect(form.getByRole("button", { name: "Get approval alerts" })).toBeEnabled();
  });

  test("?ref= records a referral click once per code", async ({ page }) => {
    const code = `E2E${Date.now()}`;
    await page.goto(`/?ref=${code}`);
    await expectRecorded("/api/referral/click", (r) => r.body?.code === code);
    expect(await page.evaluate(() => localStorage.getItem("rf_ref"))).toBe(code);
  });
});
