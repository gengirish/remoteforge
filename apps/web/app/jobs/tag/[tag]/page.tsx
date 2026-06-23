import { JobCard } from "@/components/job-card";
import { fetchJobs } from "@/lib/data";

export const revalidate = 3600;

export default async function TagPage({ params }: { params: { tag: string } }) {
  const tag = decodeURIComponent(params.tag);
  const data = await fetchJobs({ tags: tag, limit: "50" });
  const jobs = data?.jobs ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Remote {tag} jobs</h1>
      <p className="mt-2 text-muted-foreground">{jobs.length} jobs tagged &ldquo;{tag}&rdquo;</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
