import { Suspense } from "react";
import { JobCard } from "@/components/job-card";
import { JobsPagination, JobsToolbar } from "@/components/jobs-toolbar";
import { JobsToolbarSkeleton } from "@/components/jobs-toolbar-skeleton";
import { PageHeader } from "@/components/page-header";
import { fetchJobs } from "@/lib/data";
import { fetchUsdToInrRate } from "@/lib/currency";
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

  const [data, inrRate] = await Promise.all([
    fetchJobs(params),
    fetchUsdToInrRate(),
  ]);
  const jobs = data?.jobs ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        title="Remote Jobs"
        description={`${total.toLocaleString()} roles open to remote workers — filter by category or India eligibility.`}
      />
      <Suspense fallback={<JobsToolbarSkeleton />}>
        <JobsToolbar />
      </Suspense>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} inrRate={inrRate} />
        ))}
      </div>
      {jobs.length === 0 && (
        <div className="mt-12 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
          <p className="font-medium">No jobs match your filters</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try clearing filters or searching with different keywords.
          </p>
        </div>
      )}
      <Suspense fallback={null}>
        <JobsPagination page={Number(page)} totalPages={totalPages} />
      </Suspense>
    </div>
  );
}
