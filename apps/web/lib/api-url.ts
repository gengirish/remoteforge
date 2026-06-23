/** Server-side API base (Fly.io in production) */
export function getApiUrl(): string {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8080"
  );
}

/** Client-side API base */
export function getPublicApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
}

export function apiGoUrl(id: string, params: Record<string, string>): string {
  const base = getPublicApiUrl();
  const qs = new URLSearchParams(params).toString();
  return `${base}/go/${id}${qs ? `?${qs}` : ""}`;
}
