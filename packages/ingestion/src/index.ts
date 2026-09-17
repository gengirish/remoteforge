import { loadAffiliateSettings, prisma } from "@intelliforge/db";
import { normalizeJob } from "./processors/normalize-job";
import { runPostIngestEnrichment } from "./enrichment";
import { fetchRemotiveJobs } from "./sources/remotive";
import { fetchRemoteOkJobs } from "./sources/remoteok";
import { fetchWwrJobs } from "./sources/wwr";

export type IngestSource = "remotive" | "wwr" | "remoteok";

export interface IngestResult {
  source: string;
  upserted: number;
  /** Jobs from this source marked inactive because they stopped appearing in the feed. */
  expired: number;
  error?: string;
}

const ALL_SOURCES: IngestSource[] = ["remotive", "wwr", "remoteok"];

async function fetchJobs(source: IngestSource) {
  switch (source) {
    case "remotive":
      return fetchRemotiveJobs();
    case "wwr":
      return fetchWwrJobs();
    case "remoteok":
      return fetchRemoteOkJobs();
  }
}

const DAY_MS = 24 * 60 * 60 * 1000;

function envDays(name: string, fallback: number): number {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : fallback;
}

// None of the feeds lists every open job: Remotive's public API, WWR's RSS and
// RemoteOK's API all return only recent listings, so dropping out of a feed does
// not mean a job closed. Expire only jobs that are both old and no longer listed.
function expiryFilter(runStart: Date) {
  return {
    postedAt: { lt: new Date(runStart.getTime() - envDays("JOB_MAX_AGE_DAYS", 30) * DAY_MS) },
    lastSeenAt: { lt: new Date(runStart.getTime() - envDays("JOB_STALE_DAYS", 3) * DAY_MS) },
  };
}

export async function ingestSource(source: IngestSource): Promise<IngestResult> {
  const runStart = new Date();
  try {
    const jobs = await fetchJobs(source);
    const affiliateSettings = await loadAffiliateSettings();
    let upserted = 0;

    for (const raw of jobs) {
      const normalized = normalizeJob(raw, affiliateSettings);
      await prisma.job.upsert({
        where: {
          sourceBoard_sourceId: {
            sourceBoard: normalized.sourceBoard,
            sourceId: normalized.sourceId,
          },
        },
        create: { ...normalized, lastSeenAt: runStart },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        update: {
          title: normalized.title,
          description: normalized.description,
          tags: normalized.tags,
          salaryMin: normalized.salaryMin,
          salaryMax: normalized.salaryMax,
          affiliateUrl: normalized.affiliateUrl,
          indiaFriendly: normalized.indiaFriendly,
          postedAt: normalized.postedAt,
          isActive: true,
          lastSeenAt: runStart,
          ...(normalized.timezoneFriendly !== undefined
            ? { timezoneFriendly: normalized.timezoneFriendly }
            : {}),
          ...(normalized.visaSponsorship !== undefined
            ? { visaSponsorship: normalized.visaSponsorship }
            : {}),
        } as any,
      });
      upserted++;
    }

    // Expire stale jobs. Only when the fetch returned jobs: an empty or failed
    // fetch must not wipe out the whole source. Featured (paid) jobs are never auto-expired.
    let expired = 0;
    if (jobs.length > 0) {
      const res = await prisma.job.updateMany({
        where: {
          sourceBoard: source,
          isActive: true,
          isFeatured: false,
          ...expiryFilter(runStart),
        },
        data: { isActive: false },
      });
      expired = res.count;
    }

    return { source, upserted, expired };
  } catch (err) {
    return {
      source,
      upserted: 0,
      expired: 0,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function runIngestion(
  sources: IngestSource[] = ALL_SOURCES,
): Promise<IngestResult[]> {
  const results: IngestResult[] = [];
  for (const source of sources) {
    results.push(await ingestSource(source));
  }
  await runPostIngestEnrichment().catch((err) =>
    console.error("runPostIngestEnrichment failed:", err),
  );
  return results;
}

export { detectIndiaEligibility, detectIndiaFriendly, detectTimezoneFriendly, detectVisaSponsorship } from "./processors/india-check";
export { syncCompanyProfiles } from "./processors/company-profile";
export {
  runPostIngestEnrichment,
  syncUsdInrRate,
} from "./enrichment";
export type { NormalizedJob } from "./sources/remotive";
