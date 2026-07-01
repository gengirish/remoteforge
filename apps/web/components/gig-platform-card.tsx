import Link from "next/link";
import type { GigPlatform } from "@intelliforge/db";
import { apiGoUrl } from "@/lib/api-url";
import { IndiaBadge } from "./india-badge";
import { OnboardingTimeline } from "./onboarding-timeline";
import { SalaryBadge } from "./salary-badge";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const TYPE_COLORS: Record<string, string> = {
  rlhf: "bg-violet-100 text-violet-800",
  annotation: "bg-sky-100 text-sky-800",
  evaluator: "bg-teal-100 text-teal-800",
  multilingual: "bg-amber-100 text-amber-800",
  microtask: "bg-secondary text-secondary-foreground",
};

interface GigPlatformCardProps {
  platform: GigPlatform;
  className?: string;
  inrRate?: number;
}

export function GigPlatformCard({ platform, className, inrRate }: GigPlatformCardProps) {
  const initial = platform.name.charAt(0).toUpperCase();

  return (
    <article className={cn("card-surface group flex flex-col p-5", className)}>
      <div className="flex items-start gap-3">
        {platform.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={platform.logoUrl}
            alt={platform.name}
            className="h-11 w-11 shrink-0 rounded-xl border border-border object-cover"
          />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-display text-sm font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            {initial}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{platform.name}</h3>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                TYPE_COLORS[platform.type] ?? TYPE_COLORS.microtask,
              )}
            >
              {platform.type}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <IndiaBadge accepted={platform.indiaAccepted} />
            {platform.trustpilotScore && (
              <span className="text-xs text-muted-foreground">
                ★ {platform.trustpilotScore.toFixed(1)} Trustpilot
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        <SalaryBadge payMin={platform.payMin} payMax={platform.payMax} inrRate={inrRate} />
        <OnboardingTimeline days={platform.onboardingDays} />
      </div>

      <div className="mt-auto flex gap-2 pt-5">
        <Button asChild variant="outline" size="sm">
          <Link href={`/ai-gigs/${platform.slug}`}>View guide</Link>
        </Button>
        <Button asChild size="sm" className="flex-1 sm:flex-none">
          <a href={apiGoUrl(platform.id, { type: "gig", clickType: "referral" })}>
            Apply / Refer
          </a>
        </Button>
      </div>
    </article>
  );
}
