import { wrapGigLink, wrapJobLink } from "@intelliforge/affiliate-links";
import type { GigPlatform, Job } from "@intelliforge/db";

type ClickType = "apply" | "referral" | "guide";

export function getRedirectTarget(
  type: "job" | "gig",
  entity: Job | GigPlatform,
  clickType: ClickType,
): string {
  if (type === "job") {
    const job = entity as Job;
    return job.affiliateUrl ?? wrapJobLink(job.sourceUrl);
  }
  return wrapGigLink(entity as GigPlatform, clickType);
}
