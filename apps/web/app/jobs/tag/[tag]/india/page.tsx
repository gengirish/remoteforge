import type { Metadata } from "next";
import { JobCard } from "@/components/job-card";
import { fetchAllTags, fetchJobs } from "@/lib/data";

export const revalidate = 3600;

export async function generateStaticParams() {
  const tags = await fetchAllTags();
  return tags.map((tag) => ({ tag: encodeURIComponent(tag) }));
}

export async function generateMetadata({
  params,
}: {
  params: { tag: string };
}): Promise<Metadata> {
  const tag = decodeURIComponent(params.tag);
  return {
    title: `India-eligible ${tag} remote jobs 2026 | RemoteForge`,
    description: `Browse remote ${tag} jobs open to India-based applicants. Filter by salary, company, and apply directly.`,
    alternates: {
      canonical: `/jobs/tag/${encodeURIComponent(tag)}/india`,
    },
  };
}

export default async function TagIndiaPage({
  params,
}: {
  params: { tag: string };
}) {
  const tag = decodeURIComponent(params.tag);
  const data = await fetchJobs({ tags: tag, indiaOnly: "true", limit: "50" });
  const jobs = data?.jobs ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">India-eligible {tag} remote jobs</h1>
      <p className="mt-2 text-muted-foreground">
        {jobs.length} {tag} jobs open to India
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
