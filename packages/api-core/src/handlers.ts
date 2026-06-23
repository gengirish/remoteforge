import { createHash, createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@intelliforge/db";
import { runIngestion } from "@intelliforge/ingestion";
import { sendGigDigestEmail, sendJobDigestEmail } from "@intelliforge/job-alerts";
import { z } from "zod";
import { getRedirectTarget } from "./affiliate";
import { authorizeCron } from "./cron-auth";
import { fail, ok } from "./response";

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export async function handleHealth() {
  try {
    const [jobs, gigs] = await Promise.all([
      prisma.job.count({ where: { isActive: true } }),
      prisma.gigPlatform.count({ where: { isActive: true } }),
    ]);
    return { status: 200 as const, body: ok({ status: "healthy", database: "connected", jobs, gigs, timestamp: new Date().toISOString() }) };
  } catch (err) {
    return {
      status: 503 as const,
      body: { success: false, status: "unhealthy", error: err instanceof Error ? err.message : "Database unreachable" },
    };
  }
}

export async function handleHome() {
  const [jobCount, gigCount, indiaGigCount, jobs, gigs] = await Promise.all([
    prisma.job.count({ where: { isActive: true } }),
    prisma.gigPlatform.count({ where: { isActive: true } }),
    prisma.gigPlatform.count({ where: { isActive: true, indiaAccepted: true } }),
    prisma.job.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: "desc" }, { postedAt: "desc" }],
      take: 6,
    }),
    prisma.gigPlatform.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: "desc" }, { indiaAccepted: "desc" }, { sortOrder: "asc" }],
      take: 6,
    }),
  ]);
  return { status: 200 as const, body: ok({ jobCount, gigCount, indiaGigCount, jobs, gigs }) };
}

const jobsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().optional(),
  tags: z.string().optional(),
  indiaOnly: z.enum(["true", "false"]).optional().transform((v) => v === "true"),
  search: z.string().optional(),
  slug: z.string().optional(),
});

export async function handleJobsGet(
  params: Record<string, string | undefined>,
  internalKey: string | undefined,
  configuredInternalKey: string | undefined,
) {
  const parsed = jobsQuerySchema.safeParse(params);
  if (!parsed.success) return { status: 400 as const, body: fail(parsed.error.message) };

  const { page, limit, category, tags, indiaOnly, search, slug } = parsed.data;
  const isInternal = Boolean(internalKey && internalKey === configuredInternalKey);

  if (slug) {
    const job = await prisma.job.findFirst({ where: { slug, isActive: true } });
    if (!job) return { status: 404 as const, body: fail("Job not found") };
    return { status: 200 as const, body: ok(job) };
  }

  const tagList = tags?.split(",").filter(Boolean) ?? [];
  const where = {
    isActive: true,
    ...(category ? { category } : {}),
    ...(indiaOnly ? { indiaFriendly: true } : {}),
    ...(tagList.length > 0 ? { tags: { hasSome: tagList } } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { company: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { postedAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.job.count({ where }),
  ]);

  const publicJobs = isInternal
    ? jobs
    : jobs.map((j) => ({ ...j, description: j.description.slice(0, 500) }));

  return {
    status: 200 as const,
    body: ok({ jobs: publicJobs, total, page, limit, totalPages: Math.ceil(total / limit) }),
  };
}

export async function handleJobBySlug(slug: string, full = false) {
  const job = await prisma.job.findFirst({
    where: { slug, isActive: true },
    ...(full ? {} : { select: { title: true, company: true, description: true, tags: true, category: true } }),
  });
  if (!job) return { status: 404 as const, body: fail("Job not found") };
  return { status: 200 as const, body: ok(job) };
}

const gigsQuerySchema = z.object({
  type: z.string().optional(),
  indiaOnly: z.enum(["true", "false"]).optional().transform((v) => v === "true"),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  slug: z.string().optional(),
});

export async function handleGigsGet(params: Record<string, string | undefined>) {
  const parsed = gigsQuerySchema.safeParse(params);
  if (!parsed.success) return { status: 400 as const, body: fail(parsed.error.message) };

  const { type, indiaOnly, limit, slug } = parsed.data;

  if (slug) {
    const platform = await prisma.gigPlatform.findFirst({ where: { slug, isActive: true } });
    if (!platform) return { status: 404 as const, body: fail("Platform not found") };
    return { status: 200 as const, body: ok(platform) };
  }

  const platforms = await prisma.gigPlatform.findMany({
    where: {
      isActive: true,
      ...(type ? { type } : {}),
      ...(indiaOnly ? { indiaAccepted: true } : {}),
    },
    orderBy: [{ isFeatured: "desc" }, { indiaAccepted: "desc" }, { sortOrder: "asc" }],
    take: limit,
  });

  return { status: 200 as const, body: ok({ platforms, total: platforms.length }) };
}

const subscribeSchema = z.object({
  email: z.string().email(),
  phone: z.string().regex(/^\+[1-9]\d{6,14}$/).optional(),
  wantsJobAlerts: z.boolean().default(true),
  wantsGigAlerts: z.boolean().default(false),
  jobCategories: z.array(z.string()).default([]),
  jobTags: z.array(z.string()).default([]),
  gigTypes: z.array(z.string()).default([]),
  frequency: z.enum(["daily", "weekly"]).default("weekly"),
});

export async function handleSubscribe(body: unknown) {
  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) return { status: 400 as const, body: fail(parsed.error.flatten().toString()) };

  const data = parsed.data;
  const subscriber = await prisma.subscriber.upsert({
    where: { email: data.email },
    create: data,
    update: {
      phone: data.phone,
      jobCategories: data.jobCategories,
      jobTags: data.jobTags,
      gigTypes: data.gigTypes,
      wantsGigAlerts: data.wantsGigAlerts,
      frequency: data.frequency,
    },
  });

  return { status: 200 as const, body: ok({ id: subscriber.id, email: subscriber.email }) };
}

export async function handleIngest(authHeader: string | undefined, cronSecretHeader: string | undefined) {
  if (!authorizeCron(authHeader, cronSecretHeader, process.env.CRON_SECRET)) {
    return { status: 401 as const, body: fail("Unauthorized") };
  }

  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    try {
      const { Queue } = await import("bullmq");
      const queue = new Queue("job-ingestion", {
        connection: { url: redisUrl, maxRetriesPerRequest: null },
      });
      await queue.add("ingest-all", { source: "ingest-all" }, { removeOnComplete: 100 });
      await queue.close();
      return { status: 200 as const, body: ok({ mode: "queued", message: "Ingestion job queued via BullMQ" }) };
    } catch {
      // inline fallback
    }
  }

  const results = await runIngestion();
  const total = results.reduce((sum, r) => sum + r.upserted, 0);
  return { status: 200 as const, body: ok({ mode: "inline", total, results }) };
}

export async function handleDigest(authHeader: string | undefined, cronSecretHeader: string | undefined) {
  if (!authorizeCron(authHeader, cronSecretHeader, process.env.CRON_SECRET)) {
    return { status: 401 as const, body: fail("Unauthorized") };
  }

  const subscribers = await prisma.subscriber.findMany();
  const [recentJobs, gigPlatforms] = await Promise.all([
    prisma.job.findMany({
      where: { isActive: true, indiaFriendly: true },
      orderBy: { postedAt: "desc" },
      take: 10,
      select: { title: true, company: true, slug: true, salaryMin: true, salaryMax: true },
    }),
    prisma.gigPlatform.findMany({
      where: { isActive: true, indiaAccepted: true },
      orderBy: { sortOrder: "asc" },
      take: 5,
      select: { name: true, slug: true, payMin: true, payMax: true, indiaAccepted: true },
    }),
  ]);

  let sent = 0;
  const errors: string[] = [];
  for (const sub of subscribers) {
    if (recentJobs.length > 0) {
      const result = await sendJobDigestEmail(sub.email, recentJobs);
      if (result.ok) sent++;
      else if (result.error) errors.push(result.error);
    }
    if (sub.wantsGigAlerts && gigPlatforms.length > 0) {
      const result = await sendGigDigestEmail(sub.email, gigPlatforms);
      if (result.ok) sent++;
      else if (result.error) errors.push(result.error);
    }
  }

  return { status: 200 as const, body: ok({ subscribers: subscribers.length, emailsAttempted: sent, errors: errors.slice(0, 5) }) };
}

const featuredSchema = z.object({ jobId: z.string().min(1) });
const FEATURED_AMOUNT_PAISE = 499_900;

export async function handleFeaturedCreateOrder(body: unknown) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return { status: 503 as const, body: fail("Razorpay not configured") };

  const parsed = featuredSchema.safeParse(body);
  if (!parsed.success) return { status: 400 as const, body: fail(parsed.error.message) };

  const job = await prisma.job.findUnique({ where: { id: parsed.data.jobId } });
  if (!job) return { status: 404 as const, body: fail("Job not found") };

  const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
    },
    body: JSON.stringify({
      amount: FEATURED_AMOUNT_PAISE,
      currency: "INR",
      receipt: `featured_${job.id.slice(0, 8)}`,
      notes: { jobId: job.id, jobTitle: job.title },
    }),
  });

  if (!orderRes.ok) return { status: 502 as const, body: fail(await orderRes.text()) };
  const order = (await orderRes.json()) as { id: string; amount: number };
  return {
    status: 200 as const,
    body: ok({ orderId: order.id, amount: order.amount, currency: "INR", keyId, jobTitle: job.title }),
  };
}

function verifyRazorpaySignature(body: string, signature: string, secret: string): boolean {
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function handleRazorpayWebhook(rawBody: string, signature: string) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) return { status: 500 as const, body: fail("Webhook not configured") };
  if (!verifyRazorpaySignature(rawBody, signature, webhookSecret)) {
    return { status: 401 as const, body: fail("Invalid signature") };
  }

  const event = JSON.parse(rawBody) as {
    event: string;
    payload: { payment?: { entity: { id: string; amount: number; notes?: { jobId?: string } } } };
  };

  if (event.event === "payment.captured") {
    const payment = event.payload.payment?.entity;
    const jobId = payment?.notes?.jobId;
    if (payment && jobId) {
      const startsAt = new Date();
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);
      await prisma.$transaction([
        prisma.featuredSlot.upsert({
          where: { jobId },
          create: { jobId, razorpayId: payment.id, amountPaise: payment.amount, startsAt, expiresAt },
          update: { razorpayId: payment.id, amountPaise: payment.amount, startsAt, expiresAt },
        }),
        prisma.job.update({ where: { id: jobId }, data: { isFeatured: true } }),
      ]);
    }
  }

  return { status: 200 as const, body: ok({ received: true }) };
}

export async function handleGoRedirect(
  id: string,
  query: Record<string, string | undefined>,
  headers: { ip?: string; userAgent?: string; referrer?: string },
) {
  const type = query.type ?? "job";
  const clickType = query.clickType ?? "apply";
  const ipHash = hashIp(headers.ip ?? "unknown");

  let targetUrl: string;

  if (type === "gig") {
    const platform = await prisma.gigPlatform.findUnique({ where: { id } });
    if (!platform) return { status: 404 as const, body: fail("Not found"), redirect: null };
    targetUrl = getRedirectTarget("gig", platform, clickType as "apply" | "referral" | "guide");
    prisma.gigClick
      .create({
        data: {
          platformId: platform.id,
          clickType,
          utmSource: query.utm_source,
          utmMedium: query.utm_medium,
          ipHash,
        },
      })
      .catch(console.error);
  } else {
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) return { status: 404 as const, body: fail("Not found"), redirect: null };
    targetUrl = getRedirectTarget("job", job, "apply");
    prisma.jobClick
      .create({
        data: {
          jobId: job.id,
          utmSource: query.utm_source,
          utmMedium: query.utm_medium,
          utmCampaign: query.utm_campaign,
          ipHash,
          userAgent: headers.userAgent,
          referrer: headers.referrer,
        },
      })
      .catch(console.error);
  }

  return { status: 302 as const, body: null, redirect: targetUrl };
}

export async function handleJobSlugs() {
  const jobs = await prisma.job.findMany({ where: { isActive: true }, select: { slug: true } });
  return { status: 200 as const, body: ok(jobs.map((j) => j.slug)) };
}

export async function handleGigSlugs() {
  const platforms = await prisma.gigPlatform.findMany({ where: { isActive: true }, select: { slug: true } });
  return { status: 200 as const, body: ok(platforms.map((p) => p.slug)) };
}

const applicationStatusSchema = z.enum(["applied", "interviewing", "offered", "rejected", "ghosted"]);

// schema: ApplicationRecord and ApplicationEvent added by Phase 2 Agent A (db:push required)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export async function handleUpsertApplication(body: unknown, clerkId: string | undefined) {
  if (!clerkId) return { status: 401 as const, body: fail("Unauthorized") };

  const schema = z.object({
    jobId: z.string().min(1),
    status: applicationStatusSchema,
    note: z.string().optional(),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) return { status: 400 as const, body: fail(parsed.error.message) };

  const profile = await db.userProfile.findUnique({ where: { clerkId } });
  if (!profile) return { status: 404 as const, body: fail("Profile not found — complete your profile first") };

  const job = await prisma.job.findUnique({ where: { id: parsed.data.jobId }, select: { id: true, company: true } });
  if (!job) return { status: 404 as const, body: fail("Job not found") };

  const application = await db.applicationRecord.upsert({
    where: { userId_jobId: { userId: profile.id, jobId: job.id } },
    create: { userId: profile.id, jobId: job.id, company: job.company, status: parsed.data.status },
    update: { status: parsed.data.status, updatedAt: new Date() },
  });

  const daysFromApply = Math.floor((Date.now() - new Date(application.appliedAt).getTime()) / (1000 * 60 * 60 * 24));

  await db.applicationEvent.create({
    data: {
      applicationId: application.id,
      status: parsed.data.status,
      note: parsed.data.note,
      daysFromApply,
    },
  });

  return { status: 200 as const, body: ok(application) };
}

export async function handleGetApplications(clerkId: string | undefined) {
  if (!clerkId) return { status: 401 as const, body: fail("Unauthorized") };

  const profile = await db.userProfile.findUnique({ where: { clerkId } });
  if (!profile) return { status: 200 as const, body: ok({ applications: [] }) };

  const applications = await db.applicationRecord.findMany({
    where: { userId: profile.id },
    include: {
      job: { select: { title: true, company: true, slug: true, salaryMin: true, salaryMax: true } },
      events: { orderBy: { createdAt: "desc" }, take: 5 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return { status: 200 as const, body: ok({ applications }) };
}

export async function handleCompanyStats(company: string) {
  const [total, byStatus] = await Promise.all([
    db.applicationRecord.count({ where: { company } }),
    db.applicationRecord.groupBy({
      by: ["status"],
      where: { company },
      _count: { id: true },
    }),
  ]);

  if (total < 3) {
    return { status: 200 as const, body: ok({ company, dataPoints: total, message: "Insufficient data" }) };
  }

  const responseEvents = await db.applicationEvent.findMany({
    where: {
      application: { company },
      status: { in: ["interviewing", "offered", "rejected"] },
      daysFromApply: { not: null },
    },
    select: { daysFromApply: true },
  });

  const avgResponseDays =
    responseEvents.length > 0
      ? Math.round(
          responseEvents.reduce((s: number, e: { daysFromApply: number }) => s + (e.daysFromApply ?? 0), 0) /
            responseEvents.length,
        )
      : null;

  const statusBreakdown = Object.fromEntries(
    (byStatus as Array<{ status: string; _count: { id: number } }>).map((g) => [g.status, g._count.id]),
  );

  return { status: 200 as const, body: ok({ company, dataPoints: total, avgResponseDays, statusBreakdown }) };
}
