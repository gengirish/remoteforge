import { JobCardSkeleton } from "@/components/job-card-skeleton";
import { JobsToolbarSkeleton } from "@/components/jobs-toolbar-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function JobsLoading() {
  return (
    <div
      className="mx-auto max-w-6xl px-4 py-10"
      role="status"
      aria-label="Loading jobs"
    >
      <div className="page-header">
        <div className="relative space-y-3">
          <Skeleton className="h-9 w-48 sm:h-10 sm:w-56" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>
      </div>
      <JobsToolbarSkeleton />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <JobCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
