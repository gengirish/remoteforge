import { wrapGigLink, wrapJobLink, type AffiliateSettings } from "@intelliforge/affiliate-links";
import type { GigPlatform, Job } from "@intelliforge/db";

type ClickType = "apply" | "referral" | "guide";

export function getRedirectTarget(
  type: "job" | "gig",
  entity: Job | GigPlatform,
  clickType: ClickType,
  settings?: AffiliateSettings,
): string {
  if (type === "job") {
    const job = entity as Job;
    return wrapJobLink(job.sourceUrl, settings);
  }
  return wrapGigLink(entity as GigPlatform, clickType);
}
