import { GigPlatformCardSkeleton } from "@/components/gig-platform-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function AiGigsLoading() {
  return (
    <div
      className="mx-auto max-w-6xl px-4 py-10"
      role="status"
      aria-label="Loading AI gig platforms"
    >
      <div className="page-header">
        <div className="relative space-y-3">
          <Skeleton className="h-9 w-56 sm:h-10 sm:w-64" />
          <Skeleton className="h-5 w-full max-w-2xl" />
          <div className="mt-6 flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-8 rounded-full"
                style={{ width: `${52 + (i % 4) * 16}px` }}
              />
            ))}
          </div>
        </div>
      </div>

      <section className="mt-10">
        <div className="flex items-center gap-2">
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-6 w-52" />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <GigPlatformCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
