import { test, expect, expectRecorded } from "./support";

test.describe("salary benchmarks", () => {
  test("index lists roles with report counts", async ({ page }) => {
    await page.goto("/salary");
    await expect(page.getByRole("link", { name: /Backend Engineer\s*5 reports/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Data Annotator\s*1 report →/ })).toBeVisible();
  });

  test("role with enough data shows percentiles", async ({ page }) => {
    await page.goto("/salary");
    await page.getByRole("link", { name: /Backend Engineer/ }).click();
    await expect(page).toHaveURL(/\/salary\/backend-engineer$/);
    await expect(page.getByText("$42,000")).toBeVisible();
    await expect(page.getByText("$30,000")).toBeVisible();
    await expect(page.getByText("$55,000")).toBeVisible();
  });

  test("role below the threshold asks for submissions", async ({ page }) => {
    await page.goto("/salary/data-annotator");
    await expect(page.getByText("We show benchmarks once a role has 3.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Submit your salary →" })).toHaveAttribute("href", "/salary/submit");
  });

  test("submitting a salary posts numbers and links to the role", async ({ page }) => {
    const company = `E2E Co ${Date.now()}`;
    await page.goto("/salary/submit");

    await page.getByLabel(/^Role/).fill("Senior Software Engineer");
    await page.getByLabel(/^Company/).fill(company);
    await page.getByLabel(/Years of experience/).fill("6");
    await page.getByLabel(/Annual salary/).fill("54000");
    await page.getByLabel(/^City/).fill("Pune");
    await page.getByRole("button", { name: "Submit salary" }).click();

    await expect(page.getByText("Thanks for contributing!")).toBeVisible();
    await expect(page.getByRole("link", { name: "View benchmarks for your role →" })).toHaveAttribute(
      "href",
      "/salary/senior-software-engineer",
    );

    const req = await expectRecorded("/api/salary", (r) => r.body?.company === company);
    expect(req.body).toMatchObject({ role: "Senior Software Engineer", yearsExp: 6, salaryUsd: 54000, city: "Pune" });
  });
});
