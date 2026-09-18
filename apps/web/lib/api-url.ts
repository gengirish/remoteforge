const PRODUCTION_API_URL = "https://remoteforge-api.fly.dev";

// A missing NEXT_PUBLIC_API_URL used to fall back to localhost even in
// production builds, which shipped every /go link and browser-side API call
// pointing at localhost:8080. Only dev builds may default to localhost.
const DEFAULT_API_URL =
  process.env.NODE_ENV === "production" ? PRODUCTION_API_URL : "http://localhost:8080";

/** Treat unset and blank env values the same. */
function envUrl(value: string | undefined): string | undefined {
  const trimmed = value?.trim().replace(/\/+$/, "");
  return trimmed ? trimmed : undefined;
}

/** Server-side API base (Fly.io in production) */
export function getApiUrl(): string {
  return (
    envUrl(process.env.API_URL) ??
    envUrl(process.env.NEXT_PUBLIC_API_URL) ??
    DEFAULT_API_URL
  );
}

/** Client-side API base */
export function getPublicApiUrl(): string {
  return envUrl(process.env.NEXT_PUBLIC_API_URL) ?? DEFAULT_API_URL;
}

export function apiGoUrl(id: string, params: Record<string, string>): string {
  const base = getPublicApiUrl();
  const qs = new URLSearchParams(params).toString();
  return `${base}/go/${id}${qs ? `?${qs}` : ""}`;
}
