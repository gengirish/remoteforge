import { Skeleton } from "@/components/ui/skeleton";

export default function JobDetailLoading() {
  return (
    <div
      className="mx-auto max-w-3xl px-4 py-10"
      role="status"
      aria-label="Loading job details"
    >
      <Skeleton className="h-5 w-28" />

      <article className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-8 sm:px-8">
          <div className="flex items-start gap-4">
            <Skeleton className="h-14 w-14 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-64 max-w-full sm:h-9" />
                  <Skeleton className="h-5 w-40" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-6 w-28 rounded-full" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-7 w-16 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-14 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 px-6 py-8 sm:px-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-4"
              style={{ width: `${88 - (i % 3) * 12}%` }}
            />
          ))}
          <Skeleton className="h-4 w-[60%]" />
          <div className="mt-8 space-y-4 border-t border-border pt-8">
            <Skeleton className="h-11 w-44 rounded-md" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        </div>
      </article>
    </div>
  );
}
