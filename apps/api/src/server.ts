import { serve } from "@hono/node-server";
import { verifyToken } from "@clerk/backend";
import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import {
  handleAffiliateSettingsGet,
  handleAffiliateSettingsUpdate,
  handleCompanyStats,
  handleCompaniesIndia,
  handleGetCompanyBySlug,
  handleCreateApiKey,
  handleDigest,
  handleUnsubscribe,
  handleUnsubscribePage,
  handleFeaturedCreateOrder,
  handleGigAffiliateUpdate,
  handleGetApplications,
  handleGigsGet,
  handleGoRedirect,
  handleGigSlugs,
  handleHealth,
  handleHealthDeep,
  handleHome,
  handleIngest,
  handleInternalStats,
  handleJobBySlug,
  handleJobSlugs,
  handleJobsGet,
  handleRazorpayWebhook,
  handleRecommendedJobs,
  handleSubscribe,
  handleGetProfile,
  handleUpsertProfile,
  handleToggleSavedJob,
  handleGetSavedJobs,
  handleUpsertApplication,
  handleSubmitSalary,
  handleSalaryByRole,
  handleSalaryRoles,
  handleSubmitGigEarnings,
  handleGigEarningsByPlatform,
  handleGigEarningsBySlug,
  handleGetReferralCode,
  handleReferralClick,
  handleReferralSignup,
  handleReferralConvert,
  handleGetSuccessStories,
  handleSubmitSuccessStory,
  handleIndiaIncomeReport,
  handleEmployerOnboard,
  handleGetEmployer,
  handlePostDirectJob,
  handleTalentReport,
  handleEmployerSubscription,
  handleGetEmployerByCompanySlug,
  handlePremiumStatus,
  handlePremiumCheckout,
  handleV2Companies,
  handleV2Salary,
  handleV2Skills,
  handleV2Usage,
} from "@intelliforge/api-core";

const PORT = Number(process.env.PORT ?? 8080);
const CORS_ORIGINS = (process.env.CORS_ORIGINS ?? "http://localhost:3000,https://remoteforge.intelliforge.tech")
  .split(",")
  .map((s) => s.trim());

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

/**
 * The signed-in user, taken from a verified Clerk session token in
 * `Authorization: Bearer`. Never trust a client-supplied user id: without a
 * valid token (or with CLERK_SECRET_KEY unset) the request is anonymous.
 */
async function clerkUserId(c: Context): Promise<string | undefined> {
  const token = c.req.header("Authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token || !CLERK_SECRET_KEY) return undefined;
  try {
    const payload = await verifyToken(token, { secretKey: CLERK_SECRET_KEY });
    return payload.sub;
  } catch {
    return undefined;
  }
}

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

app.get("/health", (c) => {
  const { status, body } = handleHealth();
  return c.json(body, status);
});

app.get("/api/health", (c) => {
  const { status, body } = handleHealth();
  return c.json(body, status);
});

// DB-backed readiness. Manual use only — never point an uptime monitor or a
// platform health check at this, it keeps the Neon compute awake.
app.get("/api/health/deep", async (c) => {
  const { status, body } = await handleHealthDeep();
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

app.get("/api/jobs/recommended", async (c) => {
  const { status, body } = await handleRecommendedJobs(await clerkUserId(c));
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

app.post("/api/gigs/earnings", async (c) => {
  const body = await c.req.json().catch(() => null);
  const { status, body: res } = await handleSubmitGigEarnings(body);
  return c.json(res, status);
});

app.get("/api/gigs/:slug/earnings", async (c) => {
  const { status, body } = await handleGigEarningsBySlug(c.req.param("slug"));
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
    c.req.query("to"),
  );
  return c.json(body, status);
});

app.get("/api/unsubscribe", (c) => {
  const { status, body } = handleUnsubscribePage(c.req.query("e"), c.req.query("t"));
  return c.html(body, status);
});

app.post("/api/unsubscribe", async (c) => {
  const { status, body } = await handleUnsubscribe(c.req.query("e"), c.req.query("t"));
  return c.html(body, status);
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
    // Fly sets fly-client-ip to the real client; x-forwarded-for is a fallback.
    ip: c.req.header("fly-client-ip")?.trim() || c.req.header("x-forwarded-for")?.split(",")[0]?.trim(),
    userAgent: c.req.header("user-agent"),
    referrer: c.req.header("referer"),
  });
  if (result.redirect) {
    return c.redirect(result.redirect, 302);
  }
  return c.json(result.body, result.status);
});

// Static route /api/companies/india must be declared BEFORE the :slug wildcard
app.get("/api/companies/india", async (c) => {
  const { status, body } = await handleCompaniesIndia();
  return c.json(body, status);
});

app.get("/api/companies/:slug", async (c) => {
  const { status, body } = await handleGetCompanyBySlug(c.req.param("slug"));
  return c.json(body, status);
});

app.get("/api/internal/stats", async (c) => {
  const { status, body } = await handleInternalStats(
    c.req.header("X-Internal-Key"),
    process.env.REMOTEFORGE_INTERNAL_KEY,
  );
  return c.json(body, status);
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

app.get("/api/user/profile", async (c) => {
  const { status, body } = await handleGetProfile(await clerkUserId(c));
  return c.json(body, status);
});

app.post("/api/user/profile", async (c) => {
  const body = await c.req.json().catch(() => null);
  const { status, body: res } = await handleUpsertProfile(body, await clerkUserId(c));
  return c.json(res, status);
});

app.get("/api/user/saved-jobs", async (c) => {
  const { status, body } = await handleGetSavedJobs(await clerkUserId(c));
  return c.json(body, status);
});

app.post("/api/user/saved-jobs", async (c) => {
  const body = await c.req.json().catch(() => null);
  const { status, body: res } = await handleToggleSavedJob(
    await clerkUserId(c),
    body?.jobId,
  );
  return c.json(res, status);
});

app.post("/api/applications", async (c) => {
  const body = await c.req.json().catch(() => null);
  const { status, body: res } = await handleUpsertApplication(body, await clerkUserId(c));
  return c.json(res, status);
});

app.get("/api/applications", async (c) => {
  const { status, body } = await handleGetApplications(await clerkUserId(c));
  return c.json(body, status);
});

app.get("/api/companies/:company/stats", async (c) => {
  const { status, body } = await handleCompanyStats(c.req.param("company"));
  return c.json(body, status);
});

// Salary Oracle — /api/salary/roles must precede /api/salary/:roleSlug
app.post("/api/salary", async (c) => {
  const body = await c.req.json().catch(() => null);
  const { status, body: res } = await handleSubmitSalary(body);
  return c.json(res, status);
});

app.get("/api/salary/roles", async (c) => {
  const { status, body } = await handleSalaryRoles();
  return c.json(body, status);
});

app.get("/api/salary/:roleSlug", async (c) => {
  const { status, body } = await handleSalaryByRole(c.req.param("roleSlug"));
  return c.json(body, status);
});

app.get("/api/referral/code", async (c) => {
  const { status, body } = await handleGetReferralCode(await clerkUserId(c));
  return c.json(body, status);
});

app.post("/api/referral/click", async (c) => {
  const body = await c.req.json().catch(() => null);
  const { status, body: res } = await handleReferralClick(body);
  return c.json(res, status);
});

app.post("/api/referral/signup", async (c) => {
  const body = await c.req.json().catch(() => null);
  const { status, body: res } = await handleReferralSignup(body, await clerkUserId(c));
  return c.json(res, status);
});

app.post("/api/referral/convert", async (c) => {
  const { status, body } = await handleReferralConvert(await clerkUserId(c));
  return c.json(body, status);
});

app.get("/api/community/wins", async (c) => {
  const { status, body } = await handleGetSuccessStories();
  return c.json(body, status);
});

app.post("/api/community/wins", async (c) => {
  const body = await c.req.json().catch(() => null);
  const { status, body: res } = await handleSubmitSuccessStory(body, await clerkUserId(c));
  return c.json(res, status);
});

app.get("/api/community/income-report", async (c) => {
  const { status, body } = await handleIndiaIncomeReport();
  return c.json(body, status);
});

// ─── Employer routes ─────────────────────────────────────────────────────────

app.get("/api/employer/by-slug/:slug", async (c) => {
  const { status, body } = await handleGetEmployerByCompanySlug(c.req.param("slug"));
  return c.json(body, status);
});

app.post("/api/employer/onboard", async (c) => {
  const body = await c.req.json().catch(() => null);
  const { status, body: res } = await handleEmployerOnboard(body, await clerkUserId(c));
  return c.json(res, status);
});

app.get("/api/employer/me", async (c) => {
  const { status, body } = await handleGetEmployer(await clerkUserId(c));
  return c.json(body, status);
});

app.post("/api/employer/jobs", async (c) => {
  const body = await c.req.json().catch(() => null);
  const { status, body: res } = await handlePostDirectJob(body, await clerkUserId(c));
  return c.json(res, status);
});

app.get("/api/employer/talent-report", async (c) => {
  const { status, body } = await handleTalentReport(await clerkUserId(c));
  return c.json(body, status);
});

app.post("/api/employer/subscription", async (c) => {
  const { status, body } = await handleEmployerSubscription(await clerkUserId(c));
  return c.json(body, status);
});

app.get("/api/premium/status", async (c) => {
  const { status, body } = await handlePremiumStatus(await clerkUserId(c));
  return c.json(body, status);
});

app.post("/api/premium/checkout", async (c) => {
  const { status, body } = await handlePremiumCheckout(await clerkUserId(c));
  return c.json(body, status);
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
