import { prisma, getUsdToInrRateFromEnv } from "@intelliforge/db";
import { syncCompanyProfiles } from "../processors/company-profile";
import { syncUsdInrRate } from "./frankfurter";
import { enrichCompanyLogos } from "./logo";
import { enrichSalariesFromJSearch } from "./jsearch";

export { syncUsdInrRate, fetchUsdInrFromFrankfurter } from "./frankfurter";
export {
  buildLogoDevUrl,
  extractCompanyDomain,
  enrichCompanyLogos,
} from "./logo";
export {
  parseJSearchSalary,
  enrichSalariesFromJSearch,
} from "./jsearch";

export interface PostIngestEnrichmentResult {
  exchangeRate: Awaited<ReturnType<typeof syncUsdInrRate>>;
  logos: Awaited<ReturnType<typeof enrichCompanyLogos>>;
  salaries: Awaited<ReturnType<typeof enrichSalariesFromJSearch>>;
}

/** Post-ingest: FX rate → logos → salary backfill → company profiles. */
export async function runPostIngestEnrichment(): Promise<PostIngestEnrichmentResult> {
  const exchangeRate = await syncUsdInrRate().catch((err) => {
    console.error("[enrichment] Frankfurter sync failed:", err);
    return {
      updated: false,
      rate: getUsdToInrRateFromEnv(),
      source: "cache" as const,
    };
  });

  const logos = await enrichCompanyLogos(prisma).catch((err) => {
    console.error("[enrichment] Logo enrichment failed:", err);
    return { updated: 0, skipped: 0 };
  });

  const salaries = await enrichSalariesFromJSearch(prisma).catch((err) => {
    console.error("[enrichment] JSearch enrichment failed:", err);
    return { attempted: 0, updated: 0, quotaExceeded: false };
  });

  await syncCompanyProfiles().catch((err) =>
    console.error("[enrichment] syncCompanyProfiles failed:", err),
  );

  console.log(
    "[enrichment] done",
    JSON.stringify({ exchangeRate, logos, salaries }),
  );

  return { exchangeRate, logos, salaries };
}
