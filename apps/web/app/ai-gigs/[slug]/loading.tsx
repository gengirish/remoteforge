import { Skeleton } from "@/components/ui/skeleton";

export default function GigDetailLoading() {
  return (
    <div
      className="mx-auto max-w-3xl px-4 py-10"
      role="status"
      aria-label="Loading platform details"
    >
      <Skeleton className="h-5 w-32" />

      <article className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-8 sm:px-8">
          <div className="flex items-start gap-4">
            <Skeleton className="h-14 w-14 shrink-0 rounded-xl" />
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-8 w-48 sm:h-9" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          </div>
        </div>

        <div className="space-y-3 px-6 py-8 sm:px-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-4"
              style={{ width: `${92 - i * 8}%` }}
            />
          ))}
          <div className="mt-6 flex flex-wrap gap-3">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-6 w-36 rounded-full" />
          </div>
          <div className="mt-8 border-t border-border pt-8">
            <Skeleton className="h-11 w-36 rounded-md" />
          </div>
        </div>
      </article>
    </div>
  );
}
