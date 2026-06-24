import { loadAffiliateSettings, prisma } from "@intelliforge/db";
import { normalizeJob } from "./processors/normalize-job";
import { syncCompanyProfiles } from "./processors/company-profile";
import { fetchRemotiveJobs } from "./sources/remotive";
import { fetchRemoteOkJobs } from "./sources/remoteok";
import { fetchWwrJobs } from "./sources/wwr";

export type IngestSource = "remotive" | "wwr" | "remoteok";

export interface IngestResult {
  source: string;
  upserted: number;
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

export async function ingestSource(source: IngestSource): Promise<IngestResult> {
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
        create: normalized,
        update: {
          title: normalized.title,
          description: normalized.description,
          tags: normalized.tags,
          salaryMin: normalized.salaryMin,
          salaryMax: normalized.salaryMax,
          affiliateUrl: normalized.affiliateUrl,
          indiaFriendly: normalized.indiaFriendly,
          timezoneFriendly: normalized.timezoneFriendly,
          visaSponsorship: normalized.visaSponsorship,
          postedAt: normalized.postedAt,
          isActive: true,
        },
      });
      upserted++;
    }

    return { source, upserted };
  } catch (err) {
    return {
      source,
      upserted: 0,
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
  await syncCompanyProfiles().catch((err) =>
    console.error("syncCompanyProfiles failed:", err),
  );
  return results;
}

export { detectIndiaEligibility, detectIndiaFriendly, detectTimezoneFriendly, detectVisaSponsorship } from "./processors/india-check";
export { syncCompanyProfiles } from "./processors/company-profile";
export type { NormalizedJob } from "./sources/remotive";
