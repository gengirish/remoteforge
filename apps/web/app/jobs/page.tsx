import { Suspense } from "react";
import { JobCard } from "@/components/job-card";
import { JobsPagination, JobsToolbar } from "@/components/jobs-toolbar";
import { fetchJobs } from "@/lib/data";
import { jobsListingMetadata } from "@/lib/seo";

export const metadata = jobsListingMetadata();
export const revalidate = 3600;

interface JobsPageProps {
  searchParams: {
    category?: string;
    indiaOnly?: string;
    search?: string;
    page?: string;
  };
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const page = searchParams.page ?? "1";
  const params: Record<string, string> = { page, limit: "20" };
  if (searchParams.category) params.category = searchParams.category;
  if (searchParams.indiaOnly === "true") params.indiaOnly = "true";
  if (searchParams.search) params.search = searchParams.search;

  const data = await fetchJobs(params);
  const jobs = data?.jobs ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Remote Jobs</h1>
      <p className="mt-2 text-muted-foreground">
        {total.toLocaleString()} jobs open to remote workers
      </p>
      <Suspense fallback={null}>
        <JobsToolbar />
      </Suspense>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
      {jobs.length === 0 && (
        <p className="mt-12 text-center text-muted-foreground">
          No jobs match your filters.
        </p>
      )}
      <Suspense fallback={null}>
        <JobsPagination page={Number(page)} totalPages={totalPages} />
      </Suspense>
    </div>
  );
}
