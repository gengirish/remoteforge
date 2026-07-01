import type { MetadataRoute } from "next";
import { fetchAllCategories, fetchAllTags, fetchGigSlugs, fetchJobSlugs } from "@/lib/data";
import { getComparisonSlugs } from "@/lib/gig-comparisons";

const BASE = "https://remoteforge.in";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, gigSlugs, tags, categories] = await Promise.all([
    fetchJobSlugs(),
    fetchGigSlugs(),
    fetchAllTags(),
    fetchAllCategories(),
  ]);

  const comparisonSlugs = getComparisonSlugs();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/jobs`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/ai-gigs`, changeFrequency: "weekly", priority: 0.8 },
    {
      url: `${BASE}/guides/ai-gigs-india-starter`,
      changeFrequency: "monthly",
      priority: 0.75,
    },
  ];

  const comparisonPages: MetadataRoute.Sitemap = comparisonSlugs.map((slug) => ({
    url: `${BASE}/ai-gigs/compare/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  const gigPages: MetadataRoute.Sitemap = gigSlugs.flatMap((slug) => [
    {
      url: `${BASE}/ai-gigs/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${BASE}/ai-gigs/${slug}/earnings`,
      changeFrequency: "weekly" as const,
      priority: 0.65,
    },
  ]);

  const jobPages: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${BASE}/jobs/${slug}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const tagPages: MetadataRoute.Sitemap = tags.flatMap((tag) => [
    {
      url: `${BASE}/jobs/tag/${encodeURIComponent(tag)}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    },
    {
      url: `${BASE}/jobs/tag/${encodeURIComponent(tag)}/india`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    },
  ]);

  const categoryPages: MetadataRoute.Sitemap = categories.flatMap((cat) => [
    {
      url: `${BASE}/jobs/category/${cat}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    },
    {
      url: `${BASE}/jobs/category/${cat}/india`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    },
  ]);

  return [
    ...staticPages,
    ...comparisonPages,
    ...gigPages,
    ...jobPages,
    ...tagPages,
    ...categoryPages,
  ];
}
