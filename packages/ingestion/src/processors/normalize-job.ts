import { createHash } from "crypto";
import type { NormalizedJob } from "../sources/remotive";
import { detectIndiaEligibility } from "./india-check";
import { generateSlug } from "./slug";
import { extractTags } from "./tags";
import { wrapJobLink } from "@intelliforge/affiliate-links";

export interface PrismaJobInput {
  slug: string;
  title: string;
  company: string;
  description: string;
  tags: string[];
  salaryMin?: number;
  salaryMax?: number;
  category: string;
  sourceBoard: string;
  sourceId: string;
  sourceUrl: string;
  affiliateUrl: string;
  indiaFriendly: boolean;
  postedAt: Date;
}

export function normalizeJob(
  raw: NormalizedJob,
  settings?: import("@intelliforge/affiliate-links").AffiliateSettings,
): PrismaJobInput {
  const tags =
    raw.tags.length > 0 ? raw.tags : extractTags(raw.description);
  const slug = generateSlug(raw.title, raw.company);

  return {
    slug,
    title: raw.title,
    company: raw.company,
    description: raw.description,
    tags,
    salaryMin: raw.salary?.min,
    salaryMax: raw.salary?.max,
    category: raw.category,
    sourceBoard: raw.sourceBoard,
    sourceId: raw.sourceId,
    sourceUrl: raw.url,
    affiliateUrl: wrapJobLink(raw.url, settings),
    indiaFriendly: detectIndiaEligibility(raw.description, raw.company),
    postedAt: raw.postedAt,
  };
}

export function dedupHash(title: string, company: string): string {
  return createHash("sha256")
    .update(`${title.toLowerCase().trim()}|${company.toLowerCase().trim()}`)
    .digest("hex");
}
