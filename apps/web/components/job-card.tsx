import Link from "next/link";
import Image from "next/image";
import type { Job } from "@intelliforge/db";
import { Building2 } from "lucide-react";
import { apiGoUrl } from "@/lib/api-url";
import { IndiaBadge } from "./india-badge";
import { SalaryBadge } from "./salary-badge";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface JobCardProps {
  job: Job;
  className?: string;
  matchScore?: number;
  inrRate?: number;
}

function CompanyAvatar({ job }: { job: Job }) {
  const initial = job.company.charAt(0).toUpperCase();

  if (job.companyLogo) {
    return (
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border">
        <Image
          src={job.companyLogo}
          alt=""
          fill
          className="object-contain p-1"
          sizes="44px"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-display text-sm font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
      {initial}
    </div>
  );
}

export function JobCard({ job, className, inrRate }: JobCardProps) {
  return (
    <article className={cn("card-surface group flex flex-col p-5", className)}>
      <div className="flex items-start gap-3">
        <CompanyAvatar job={job} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-foreground">
                <Link
                  href={`/jobs/${job.slug}`}
                  className="hover:text-primary"
                >
                  {job.title}
                </Link>
              </h3>
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                {job.company}
              </p>
            </div>
            <IndiaBadge accepted={job.indiaFriendly} className="shrink-0" />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <SalaryBadge
          salaryMin={job.salaryMin}
          salaryMax={job.salaryMax}
          inrRate={inrRate}
        />
      </div>

      {job.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.tags.slice(0, 4).map((tag: string) => (
            <Link
              key={tag}
              href={`/jobs/tag/${tag}`}
              className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            >
              {tag}
            </Link>
          ))}
          {job.tags.length > 4 && (
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
              +{job.tags.length - 4}
            </span>
          )}
        </div>
      )}

      <div className="mt-auto flex gap-2 pt-5">
        <Button asChild size="sm" className="flex-1 sm:flex-none">
          <a href={apiGoUrl(job.id, { type: "job", clickType: "apply" })}>
            Apply
          </a>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/jobs/${job.slug}`}>Details</Link>
        </Button>
      </div>
    </article>
  );
}
