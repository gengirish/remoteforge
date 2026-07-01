import type { PrismaClient } from "@intelliforge/db";

const BLOCKED_HOSTS = new Set([
  "remotive.com",
  "remoteok.com",
  "weworkremotely.com",
  "lever.co",
  "greenhouse.io",
  "ashbyhq.com",
  "workable.com",
  "jobs.lever.co",
  "boards.greenhouse.io",
]);

export function extractCompanyDomain(sourceUrl?: string | null): string | null {
  if (!sourceUrl) return null;
  try {
    const host = new URL(sourceUrl).hostname.replace(/^www\./, "");
    if (BLOCKED_HOSTS.has(host)) return null;
    if (host.endsWith(".remotive.com")) return null;
    if (host.endsWith(".remoteok.com")) return null;
    return host;
  } catch {
    return null;
  }
}

export function buildLogoDevUrl(
  company: string,
  options?: { domain?: string | null; token?: string },
): string | null {
  const token = options?.token ?? process.env.LOGO_DEV_TOKEN;
  if (!token) return null;

  const domain = options?.domain ?? null;
  const base = domain
    ? `https://img.logo.dev/${encodeURIComponent(domain)}`
    : `https://img.logo.dev/name/${encodeURIComponent(company.trim())}`;

  return `${base}?token=${encodeURIComponent(token)}&size=128&format=png`;
}

export interface EnrichLogosResult {
  updated: number;
  skipped: number;
}

/** Set Job.companyLogo via Logo.dev (domain or company name). */
export async function enrichCompanyLogos(
  prisma: Pick<PrismaClient, "job">,
  options?: { batchSize?: number },
): Promise<EnrichLogosResult> {
  const token = process.env.LOGO_DEV_TOKEN;
  if (!token) {
    console.warn("[enrichment] LOGO_DEV_TOKEN not set — skipping logo enrichment");
    return { updated: 0, skipped: 0 };
  }

  const batchSize = options?.batchSize ?? 500;
  const jobs = await prisma.job.findMany({
    where: { isActive: true, companyLogo: null },
    select: { id: true, company: true, sourceUrl: true },
    orderBy: { postedAt: "desc" },
    take: batchSize,
  });

  let updated = 0;
  let skipped = 0;

  for (const job of jobs) {
    const domain = extractCompanyDomain(job.sourceUrl);
    const logoUrl = buildLogoDevUrl(job.company, { domain, token });
    if (!logoUrl) {
      skipped++;
      continue;
    }

    await prisma.job.update({
      where: { id: job.id },
      data: { companyLogo: logoUrl },
    });
    updated++;
  }

  return { updated, skipped };
}
