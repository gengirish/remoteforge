import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface JobCardSkeletonProps {
  className?: string;
}

export function JobCardSkeleton({ className }: JobCardSkeletonProps) {
  return (
    <article
      className={cn("card-surface flex flex-col p-5", className)}
      aria-hidden
    >
      <div className="flex items-start gap-3">
        <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-[80%] max-w-[200px]" />
              <Skeleton className="h-4 w-[60%] max-w-[140px]" />
            </div>
            <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
        <Skeleton className="h-5 w-10 rounded-full" />
      </div>

      <div className="mt-auto flex gap-2 pt-5">
        <Skeleton className="h-9 w-20 rounded-md" />
        <Skeleton className="h-9 w-20 rounded-md" />
      </div>
    </article>
  );
}
