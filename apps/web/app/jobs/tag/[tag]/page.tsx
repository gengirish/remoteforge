import { JobCard } from "@/components/job-card";
import { PageHeader } from "@/components/page-header";
import { fetchJobs } from "@/lib/data";
import { fetchUsdToInrRate } from "@/lib/currency";

export const revalidate = 3600;

export default async function TagPage({ params }: { params: { tag: string } }) {
  const tag = decodeURIComponent(params.tag);
  const [data, inrRate] = await Promise.all([
    fetchJobs({ tags: tag, limit: "50" }),
    fetchUsdToInrRate(),
  ]);
  const jobs = data?.jobs ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        title={`Remote ${tag} jobs`}
        description={`${jobs.length} jobs tagged "${tag}".`}
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} inrRate={inrRate} />
        ))}
      </div>
      {jobs.length === 0 && (
        <p className="mt-12 text-center text-muted-foreground">
          No jobs with this tag yet.
        </p>
      )}
    </div>
  );
}
