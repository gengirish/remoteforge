import type { GigPlatform, Job } from "@intelliforge/db";
import type { ApiResponse } from "./api";
import { getApiUrl } from "./api-url";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${getApiUrl()}${path}`, {
      ...init,
      next: init?.cache === undefined ? { revalidate: 3600 } : undefined,
    });
    const json = (await res.json()) as ApiResponse<T>;
    if (!json.success) return null;
    return json.data;
  } catch {
    return null;
  }
}

export async function fetchHomeData() {
  return apiFetch<{
    jobCount: number;
    gigCount: number;
    indiaGigCount: number;
    jobs: Job[];
    gigs: GigPlatform[];
  }>("/api/home");
}

export async function fetchJobs(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch<{ jobs: Job[]; total: number; totalPages: number }>(
    `/api/jobs?${qs}`,
  );
}

export async function fetchJobBySlug(slug: string) {
  return apiFetch<Job>(`/api/jobs/by-slug/${slug}?full=true`);
}

export async function fetchGigPlatforms(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch<{ platforms: GigPlatform[]; total: number }>(
    `/api/gigs?${qs}`,
  );
}

export async function fetchGigBySlug(slug: string) {
  return apiFetch<GigPlatform>(`/api/gigs/by-slug/${slug}`);
}

export async function fetchJobSlugs(): Promise<string[]> {
  return (await apiFetch<string[]>("/api/jobs/slugs")) ?? [];
}

export async function fetchGigSlugs(): Promise<string[]> {
  return (await apiFetch<string[]>("/api/gigs/slugs")) ?? [];
}

export async function fetchIndiaGigAlternatives() {
  const data = await fetchGigPlatforms({ indiaOnly: "true", limit: "3" });
  return data?.platforms ?? [];
}

export async function fetchAllTags(): Promise<string[]> {
  const data = await apiFetch<{ jobs: Job[]; total: number; totalPages: number }>(
    "/api/jobs?limit=500",
  );
  if (!data) return [];
  const tagSet = new Set<string>();
  for (const job of data.jobs) {
    for (const tag of job.tags) tagSet.add(tag);
  }
  return Array.from(tagSet).sort();
}

export async function fetchAllCategories(): Promise<string[]> {
  return ["engineering", "design", "marketing", "sales", "support", "writing", "product"];
}
