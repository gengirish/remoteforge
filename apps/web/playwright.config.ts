import { defineConfig, devices } from "@playwright/test";

// E2E runs a production build of the web app against e2e/mock-api, a fixture
// server that stands in for apps/api. Nothing here reaches Fly, Neon, or Clerk.
//
// The mock must be up before `next build`: static pages are prerendered at
// build time with whatever the API returns, and would otherwise bake in empty
// state for an hour (revalidate = 3600).

const API_PORT = Number(process.env.E2E_API_PORT ?? 4010);
const WEB_PORT = Number(process.env.E2E_WEB_PORT ?? 3100);
const API_URL = `http://127.0.0.1:${API_PORT}`;
const WEB_URL = `http://127.0.0.1:${WEB_PORT}`;
const CI = !!process.env.CI;

const webEnv = {
  NEXT_DIST_DIR: ".next-e2e",
  API_URL,
  NEXT_PUBLIC_API_URL: API_URL,
  NEXT_PUBLIC_APP_URL: WEB_URL,
  // Set explicitly so values in .env.local cannot switch these back on.
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "",
  CLERK_SECRET_KEY: "",
  // Malformed on purpose: the exchange-rate lookup fails instantly and falls
  // back to USD_TO_INR_RATE instead of opening a connection to a real database.
  DATABASE_URL: "e2e-no-database",
  USD_TO_INR_RATE: "84",
  NEXT_TELEMETRY_DISABLED: "1",
};

const build = process.env.E2E_SKIP_BUILD ? "" : "next build && ";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  workers: CI ? 2 : undefined,
  reporter: CI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: WEB_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] }, grepInvert: /@mobile/ },
    { name: "mobile", use: { ...devices["Pixel 7"] }, grep: /@mobile/ },
  ],
  webServer: [
    {
      command: "node e2e/mock-api/server.mjs",
      url: `${API_URL}/health`,
      env: { E2E_API_PORT: String(API_PORT) },
      reuseExistingServer: !CI,
      stdout: "ignore",
    },
    {
      command: `${build}next start --port ${WEB_PORT} --hostname 127.0.0.1`,
      url: WEB_URL,
      env: webEnv,
      reuseExistingServer: !CI,
      timeout: 300_000,
    },
  ],
});
