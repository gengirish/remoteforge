import { acquireApiQuota, type PrismaClient } from "@intelliforge/db";

const JSEARCH_PROVIDER = "jsearch";
const DEFAULT_MONTHLY_LIMIT = Number(process.env.JSEARCH_MONTHLY_QUOTA ?? 200);
const DEFAULT_BATCH_SIZE = Number(process.env.JSEARCH_BATCH_SIZE ?? 6);

function jsearchHost(): string {
  return process.env.RAPIDAPI_JSEARCH_HOST ?? "jsearch.p.rapidapi.com";
}

export interface JSearchSalary {
  minCents?: number;
  maxCents?: number;
}

interface JSearchJob {
  job_title?: string;
  employer_name?: string;
  job_min_salary?: number | null;
  job_max_salary?: number | null;
  job_salary_period?: string | null;
}

/** Parse annual USD salaries into cents (matches RemoteOK convention: dollars × 100). */
export function parseJSearchSalary(job: JSearchJob): JSearchSalary | null {
  const period = (job.job_salary_period ?? "YEAR").toUpperCase();
  if (period !== "YEAR" && period !== "ANNUAL") return null;

  const min = job.job_min_salary;
  const max = job.job_max_salary;
  if (min == null && max == null) return null;

  const toCents = (usd: number) => Math.round(usd * 100);

  return {
    minCents: min != null && min > 0 ? toCents(min) : undefined,
    maxCents: max != null && max > 0 ? toCents(max) : undefined,
  };
}

function employerMatches(a: string, b: string): boolean {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  const na = norm(a);
  const nb = norm(b);
  return na.includes(nb) || nb.includes(na);
}

async function searchJSearch(
  query: string,
  apiKey: string,
): Promise<JSearchJob[]> {
  const url = new URL("https://jsearch.p.rapidapi.com/search");
  url.searchParams.set("query", query);
  url.searchParams.set("page", "1");
  url.searchParams.set("num_pages", "1");

  const res = await fetch(url.toString(), {
    headers: {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": jsearchHost(),
    },
  });

  if (!res.ok) {
    throw new Error(`JSearch API error: ${res.status}`);
  }

  const body = (await res.json()) as { data?: JSearchJob[] };
  return body.data ?? [];
}

export interface EnrichSalariesResult {
  attempted: number;
  updated: number;
  quotaExceeded: boolean;
}

/** Backfill missing salaries via JSearch (RapidAPI), quota-guarded. */
export async function enrichSalariesFromJSearch(
  prisma: Pick<PrismaClient, "job">,
  options?: { batchSize?: number; monthlyLimit?: number },
): Promise<EnrichSalariesResult> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    console.warn("[enrichment] RAPIDAPI_KEY not set — skipping JSearch salary backfill");
    return { attempted: 0, updated: 0, quotaExceeded: false };
  }

  const batchSize = options?.batchSize ?? DEFAULT_BATCH_SIZE;
  const monthlyLimit = options?.monthlyLimit ?? DEFAULT_MONTHLY_LIMIT;

  const jobs = await prisma.job.findMany({
    where: {
      isActive: true,
      salaryMin: null,
      salaryMax: null,
    },
    select: { id: true, title: true, company: true },
    orderBy: { postedAt: "desc" },
    take: batchSize,
  });

  let attempted = 0;
  let updated = 0;
  let quotaExceeded = false;

  for (const job of jobs) {
    const ok = await acquireApiQuota(JSEARCH_PROVIDER, monthlyLimit, 1);
    if (!ok) {
      quotaExceeded = true;
      break;
    }

    attempted++;

    try {
      const query = `${job.title} ${job.company} remote`;
      const results = await searchJSearch(query, apiKey);
      const match = results.find(
        (r) =>
          r.employer_name &&
          employerMatches(r.employer_name, job.company) &&
          parseJSearchSalary(r),
      );

      if (!match) continue;

      const salary = parseJSearchSalary(match);
      if (!salary?.minCents && !salary?.maxCents) continue;

      await prisma.job.update({
        where: { id: job.id },
        data: {
          salaryMin: salary.minCents ?? null,
          salaryMax: salary.maxCents ?? null,
        },
      });
      updated++;
    } catch (err) {
      console.error(`[enrichment] JSearch failed for job ${job.id}:`, err);
    }
  }

  return { attempted, updated, quotaExceeded };
}
