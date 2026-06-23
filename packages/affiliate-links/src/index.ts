export interface GigPlatformLink {
  referralUrl?: string | null;
  affiliateUrl?: string | null;
  slug: string;
  name: string;
}

type GigLinkType = "referral" | "apply" | "guide";

const AFFILIATE_MAP: Record<string, (url: string) => string> = {
  "remotive.com": (url) => {
    const tag = process.env.AFFILIATE_REMOTIVE_TAG;
    if (!tag) return url;
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}ref=${tag}`;
  },
  "weworkremotely.com": (url) => {
    const ref = process.env.AFFILIATE_WWR_REF;
    if (!ref) return url;
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}ref=${ref}`;
  },
  "toptal.com": (url) => {
    const ref = process.env.AFFILIATE_TOPTAL_REF;
    if (!ref) return url;
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}ref=${ref}`;
  },
  "turing.com": (url) => {
    const ref = process.env.AFFILIATE_TURING_REF;
    if (!ref) return url;
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}ref=${ref}`;
  },
  "remote.com": (url) => {
    const partner = process.env.AFFILIATE_REMOTE_PARTNER_CODE;
    if (!partner) return url;
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}partner=${partner}`;
  },
  "flexjobs.com": (url) => {
    const aid = process.env.AFFILIATE_FLEXJOBS_ID;
    if (!aid) return url;
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}aid=${aid}`;
  },
};

function getDomain(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function wrapJobLink(url: string): string {
  const domain = getDomain(url);
  if (!domain) return url;

  for (const [key, wrap] of Object.entries(AFFILIATE_MAP)) {
    if (domain.includes(key)) {
      return wrap(url);
    }
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
