import Link from "next/link";
import type { Job } from "@intelliforge/db";
import { apiGoUrl } from "@/lib/api-url";
import { IndiaBadge } from "./india-badge";
import { MatchScoreBadge } from "./match-score-badge";
import { SalaryBadge } from "./salary-badge";
import { Button } from "./ui/button";

interface JobCardProps {
  job: Job;
  matchScore?: number | null;
}

export function JobCard({ job, matchScore }: JobCardProps) {
  return (
    <article className="rounded-xl border border-border bg-background p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-foreground">
            <Link href={`/jobs/${job.slug}`} className="hover:text-primary">
              {job.title}
            </Link>
          </h3>
          <p className="text-sm text-muted-foreground">{job.company}</p>
          {matchScore != null && matchScore > 0 && (
            <div className="mt-1">
              <MatchScoreBadge score={matchScore} />
            </div>
          )}
        </div>
        <IndiaBadge accepted={job.indiaFriendly} />
      </div>

      <div className="mt-3">
        <SalaryBadge salaryMin={job.salaryMin} salaryMax={job.salaryMax} />
      </div>

      {job.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.tags.slice(0, 5).map((tag) => (
            <Link
              key={tag}
              href={`/jobs/tag/${tag}`}
              className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground hover:bg-primary/10"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Button asChild size="sm">
          <a href={apiGoUrl(job.id, { type: "job", clickType: "apply" })}>Apply →</a>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/jobs/${job.slug}`}>Details</Link>
        </Button>
      </div>
    </article>
  );
}
