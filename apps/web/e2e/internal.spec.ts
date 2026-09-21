import { test, expect } from "./support";

test.describe("internal stats", () => {
  test("is locked without the internal key", async ({ request }) => {
    const res = await request.get("/internal");
    expect(res.status()).toBe(401);
    expect(res.headers()["www-authenticate"]).toContain("Basic");
    expect(await res.text()).not.toContain("Prep Waitlist");
  });

  test("rejects a wrong key", async ({ browser }) => {
    const context = await browser.newContext({ httpCredentials: { username: "owner", password: "nope" } });
    const res = await (await context.newPage()).goto("/internal");
    expect(res?.status()).toBe(401);
    await context.close();
  });

  test("shows waitlist and per-platform interest with the key", async ({ browser }) => {
    const context = await browser.newContext({
      httpCredentials: { username: "owner", password: "e2e-internal-key" },
    });
    const page = await context.newPage();
    await page.goto("/internal");

    await expect(page.getByText("Prep Waitlist").locator("..")).toContainText("23");
    await expect(page.getByText("Approval Alerts").locator("..")).toContainText("14");
    const row = page.getByRole("row", { name: /outlier-ai/ });
    await expect(row).toContainText("prep-waitlist");
    await expect(row).toContainText("11");
    await context.close();
  });
});
