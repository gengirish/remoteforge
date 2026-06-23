import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface GigPlatformCardSkeletonProps {
  className?: string;
}

export function GigPlatformCardSkeleton({ className }: GigPlatformCardSkeletonProps) {
  return (
    <article
      className={cn("card-surface flex flex-col p-5", className)}
      aria-hidden
    >
      <div className="flex items-start gap-3">
        <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="h-4 w-44" />
      </div>

      <div className="mt-auto flex gap-2 pt-5">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
    </article>
  );
}
