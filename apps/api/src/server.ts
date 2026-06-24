import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  handleAffiliateSettingsGet,
  handleAffiliateSettingsUpdate,
  handleCreateApiKey,
  handleDigest,
  handleFeaturedCreateOrder,
  handleGigAffiliateUpdate,
  handleGigsGet,
  handleGoRedirect,
  handleGigSlugs,
  handleHealth,
  handleHome,
  handleIngest,
  handleJobBySlug,
  handleJobSlugs,
  handleJobsGet,
  handleRazorpayWebhook,
  handleSubscribe,
  handleV2Companies,
  handleV2Salary,
  handleV2Skills,
  handleV2Usage,
} from "@intelliforge/api-core";

const PORT = Number(process.env.PORT ?? 8080);
const CORS_ORIGINS = (process.env.CORS_ORIGINS ?? "http://localhost:3000,https://remoteforge.in")
  .split(",")
  .map((s) => s.trim());

const app = new Hono();

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return "*";
      return CORS_ORIGINS.includes(origin) ? origin : CORS_ORIGINS[0] ?? origin;
    },
    allowMethods: ["GET", "POST", "PUT", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Internal-Key", "X-Cron-Secret"],
  }),
);

app.get("/health", async (c) => {
  const { status, body } = await handleHealth();
  return c.json(body, status);
});

app.get("/api/health", async (c) => {
  const { status, body } = await handleHealth();
  return c.json(body, status);
});

app.get("/api/home", async (c) => {
  const { status, body } = await handleHome();
  return c.json(body, status);
});

app.get("/api/jobs", async (c) => {
  const params = Object.fromEntries(new URL(c.req.url).searchParams);
  const { status, body } = await handleJobsGet(
    params,
    c.req.header("X-Internal-Key"),
    process.env.REMOTEFORGE_INTERNAL_KEY,
  );
  return c.json(body, status);
});

app.get("/api/jobs/by-slug/:slug", async (c) => {
  const full = c.req.query("full") === "true";
  const { status, body } = await handleJobBySlug(c.req.param("slug"), full);
  return c.json(body, status);
});

app.get("/api/jobs/slugs", async (c) => {
  const { status, body } = await handleJobSlugs();
  return c.json(body, status);
});

app.get("/api/gigs", async (c) => {
  const params = Object.fromEntries(new URL(c.req.url).searchParams);
  const { status, body } = await handleGigsGet(params);
  return c.json(body, status);
});

app.get("/api/gigs/by-slug/:slug", async (c) => {
  const { status, body } = await handleGigsGet({ slug: c.req.param("slug") });
  return c.json(body, status);
});

app.get("/api/gigs/slugs", async (c) => {
  const { status, body } = await handleGigSlugs();
  return c.json(body, status);
});

app.post("/api/subscribe", async (c) => {
  const body = await c.req.json().catch(() => null);
  const { status, body: res } = await handleSubscribe(body);
  return c.json(res, status);
});

app.get("/api/jobs/ingest", async (c) => {
  const { status, body } = await handleIngest(
    c.req.header("Authorization"),
    c.req.header("X-Cron-Secret"),
  );
  return c.json(body, status);
});

app.post("/api/jobs/ingest", async (c) => {
  const { status, body } = await handleIngest(
    c.req.header("Authorization"),
    c.req.header("X-Cron-Secret"),
  );
  return c.json(body, status);
});

app.get("/api/cron/digest", async (c) => {
  const { status, body } = await handleDigest(
    c.req.header("Authorization"),
    c.req.header("X-Cron-Secret"),
  );
  return c.json(body, status);
});

app.post("/api/featured/create-order", async (c) => {
  const body = await c.req.json().catch(() => null);
  const { status, body: res } = await handleFeaturedCreateOrder(body);
  return c.json(res, status);
});

app.post("/api/webhooks/razorpay", async (c) => {
  const raw = await c.req.text();
  const { status, body } = await handleRazorpayWebhook(
    raw,
    c.req.header("x-razorpay-signature") ?? "",
  );
  return c.json(body, status);
});

app.get("/go/:id", async (c) => {
  const query = {
    type: c.req.query("type"),
    clickType: c.req.query("clickType"),
    utm_source: c.req.query("utm_source"),
    utm_medium: c.req.query("utm_medium"),
    utm_campaign: c.req.query("utm_campaign"),
  };
  const result = await handleGoRedirect(c.req.param("id"), query, {
    ip: c.req.header("x-forwarded-for")?.split(",")[0]?.trim(),
    userAgent: c.req.header("user-agent"),
    referrer: c.req.header("referer"),
  });
  if (result.redirect) {
    return c.redirect(result.redirect, 302);
  }
  return c.json(result.body, result.status);
});

app.get("/api/internal/affiliate-settings", async (c) => {
  const { status, body } = await handleAffiliateSettingsGet(
    c.req.header("X-Internal-Key"),
    process.env.REMOTEFORGE_INTERNAL_KEY,
  );
  return c.json(body, status);
});

app.put("/api/internal/affiliate-settings", async (c) => {
  const body = await c.req.json().catch(() => null);
  const { status, body: res } = await handleAffiliateSettingsUpdate(
    body,
    c.req.header("X-Internal-Key"),
    process.env.REMOTEFORGE_INTERNAL_KEY,
  );
  return c.json(res, status);
});

app.patch("/api/internal/gig-platforms/:id/affiliate", async (c) => {
  const body = await c.req.json().catch(() => null);
  const { status, body: res } = await handleGigAffiliateUpdate(
    c.req.param("id"),
    body,
    c.req.header("X-Internal-Key"),
    process.env.REMOTEFORGE_INTERNAL_KEY,
  );
  return c.json(res, status);
});

// ── B2B Data API v2 ──────────────────────────────────────────────────────────
app.post("/api/v2/keys", async (c) => {
  const body = await c.req.json().catch(() => null);
  const { status, body: res } = await handleCreateApiKey(body);
  return c.json(res, status);
});

app.get("/api/v2/salary", async (c) => {
  const roleSlug = c.req.query("role") ?? undefined;
  const { status, body } = await handleV2Salary(c.req.header("Authorization"), roleSlug);
  return c.json(body, status);
});

app.get("/api/v2/companies", async (c) => {
  const company = c.req.query("company") ?? undefined;
  const { status, body } = await handleV2Companies(c.req.header("Authorization"), company);
  return c.json(body, status);
});

app.get("/api/v2/skills", async (c) => {
  const { status, body } = await handleV2Skills(c.req.header("Authorization"));
  return c.json(body, status);
});

app.get("/api/v2/usage", async (c) => {
  const { status, body } = await handleV2Usage(c.req.header("Authorization"));
  return c.json(body, status);
});

serve({ fetch: app.fetch, port: PORT, hostname: "0.0.0.0" }, (info) => {
  console.log(`remoteforge-api listening on http://localhost:${info.port}`);
});
