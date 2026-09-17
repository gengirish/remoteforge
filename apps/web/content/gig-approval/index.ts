import { alignerr } from "./alignerr";
import { mercor } from "./mercor";
import { outlier } from "./outlier";
import type { GigApprovalContent } from "./types";

export type { GigApprovalContent } from "./types";

// Keyed by GigPlatform.slug as seeded in packages/db/prisma/seed.ts.
const CONTENT: Record<string, GigApprovalContent> = {
  "outlier-ai": outlier,
  mercor,
  alignerr,
};

export function getGigApprovalContent(slug: string): GigApprovalContent | null {
  return Object.prototype.hasOwnProperty.call(CONTENT, slug) ? (CONTENT[slug] ?? null) : null;
}
