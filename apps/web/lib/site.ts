const rawSiteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://remoteforge.intelliforge.tech";

/** Canonical origin for the site, without a trailing slash. */
export const siteUrl = rawSiteUrl.replace(/\/+$/, "");

/** Bare hostname. Plausible keys analytics on this, not on the full URL. */
export const siteDomain = new URL(siteUrl).host;
