import { Skeleton } from "@/components/ui/skeleton";

export function JobsToolbarSkeleton() {
  return (
    <div
      className="mt-6 space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5"
      aria-hidden
    >
      <Skeleton className="h-11 w-full rounded-lg" />
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-8 rounded-full"
              style={{ width: `${56 + (i % 3) * 12}px` }}
            />
          ))}
        </div>
        <Skeleton className="h-10 w-44 shrink-0 rounded-lg sm:ml-auto" />
      </div>
    </div>
  );
}
