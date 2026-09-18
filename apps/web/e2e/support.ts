import { expect, test as base, type Page } from "@playwright/test";

export const API_URL = `http://127.0.0.1:${process.env.E2E_API_PORT ?? 4010}`;

export type RecordedRequest = { method: string; path: string; body: any; at: string };

/** Writes the mock API received, newest last. Specs run in parallel, so filter by a unique value. */
export async function recordedRequests(path?: string): Promise<RecordedRequest[]> {
  const res = await fetch(`${API_URL}/__e2e/requests`);
  const all = (await res.json()) as RecordedRequest[];
  return path ? all.filter((r) => r.path === path) : all;
}

/** Waits until the mock API has recorded a write matching `predicate`. */
export async function expectRecorded(
  path: string,
  predicate: (r: RecordedRequest) => boolean,
): Promise<RecordedRequest> {
  let match: RecordedRequest | undefined;
  await expect
    .poll(async () => {
      match = (await recordedRequests(path)).find(predicate);
      return !!match;
    })
    .toBe(true);
  return match!;
}

export function uniqueEmail(tag: string) {
  return `e2e-${tag}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

/** Fails the test on any uncaught exception in the page. */
export const test = base.extend<{ page: Page }>({
  page: async ({ page }, use) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await use(page);
    expect(errors, "uncaught page errors").toEqual([]);
  },
});

export { expect };
