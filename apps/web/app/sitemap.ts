import type { MetadataRoute } from "next";
import { fetchAllCategories, fetchAllTags, fetchJobSlugs } from "@/lib/data";

const BASE = "https://remoteforge.in";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, tags, categories] = await Promise.all([
    fetchJobSlugs(),
    fetchAllTags(),
    fetchAllCategories(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/jobs`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/ai-gigs`, changeFrequency: "weekly", priority: 0.8 },
  ];

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

  return [...staticPages, ...jobPages, ...tagPages, ...categoryPages];
}
