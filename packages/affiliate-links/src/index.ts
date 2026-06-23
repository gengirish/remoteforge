export type { AffiliateSettings, JobBoardAffiliateDef } from "./settings";
export {
  JOB_BOARD_AFFILIATES,
  dbRowsFromSettings,
  getEnvAffiliateSettings,
  mergeAffiliateSettings,
  settingsFromDbRows,
} from "./settings";

import type { AffiliateSettings } from "./settings";
import { getEnvAffiliateSettings, JOB_BOARD_AFFILIATES } from "./settings";

export interface GigPlatformLink {
  referralUrl?: string | null;
  affiliateUrl?: string | null;
  slug: string;
  name: string;
}

type GigLinkType = "referral" | "apply" | "guide";

function getDomain(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function appendParam(url: string, param: string, value: string): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}${param}=${encodeURIComponent(value)}`;
}

export function wrapJobLink(
  url: string,
  settings?: AffiliateSettings,
): string {
  const domain = getDomain(url);
  if (!domain) return url;

  const s = settings ?? getEnvAffiliateSettings();

  for (const def of JOB_BOARD_AFFILIATES) {
    if (!domain.includes(def.domain)) continue;
    const value = s[def.settingsField];
    if (value) return appendParam(url, def.param, value);
    return url;
  }

  return url;
}

const GIG_WEBSITE_URLS: Record<string, string> = {
  "outlier-ai": "https://outlier.ai",
  appen: "https://appen.com",
  "telus-international-ai": "https://www.telusinternational.com",
  alignerr: "https://www.alignerr.com",
  "dataannotation-tech": "https://www.dataannotation.tech",
  prolific: "https://www.prolific.com",
  toloka: "https://toloka.ai",
};

export function wrapGigLink(
  platform: GigPlatformLink,
  type: GigLinkType,
): string {
  if (type === "referral" && platform.referralUrl) {
    return platform.referralUrl;
  }

  if (platform.affiliateUrl) {
    return platform.affiliateUrl;
  }

  return GIG_WEBSITE_URLS[platform.slug] ?? `https://${platform.slug}.com`;
}
