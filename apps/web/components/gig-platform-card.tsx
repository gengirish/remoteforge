import Link from "next/link";
import type { GigPlatform } from "@intelliforge/db";
import { apiGoUrl } from "@/lib/api-url";
import { IndiaBadge } from "./india-badge";
import { OnboardingTimeline } from "./onboarding-timeline";
import { SalaryBadge } from "./salary-badge";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const TYPE_COLORS: Record<string, string> = {
  rlhf: "bg-purple-100 text-purple-800",
  annotation: "bg-blue-100 text-blue-800",
  evaluator: "bg-teal-100 text-teal-800",
  multilingual: "bg-amber-100 text-amber-800",
  microtask: "bg-gray-100 text-gray-800",
};

interface GigPlatformCardProps {
  platform: GigPlatform;
}

export function GigPlatformCard({ platform }: GigPlatformCardProps) {
  const initial = platform.name.charAt(0).toUpperCase();

  return (
    <article className="rounded-xl border border-border bg-background p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        {platform.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={platform.logoUrl}
            alt={platform.name}
            className="h-10 w-10 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
            {initial}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{platform.name}</h3>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                TYPE_COLORS[platform.type] ?? TYPE_COLORS.microtask,
              )}
            >
              {platform.type}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <IndiaBadge accepted={platform.indiaAccepted} />
            {platform.trustpilotScore && (
              <span className="text-xs text-muted-foreground">
                ★ {platform.trustpilotScore.toFixed(1)} Trustpilot
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <SalaryBadge payMin={platform.payMin} payMax={platform.payMax} />
        <OnboardingTimeline days={platform.onboardingDays} />
      </div>

      <div className="mt-4 flex gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/ai-gigs/${platform.slug}`}>View guide</Link>
        </Button>
        <Button asChild size="sm">
          <a href={apiGoUrl(platform.id, { type: "gig", clickType: "referral" })}>
            Apply / Refer →
          </a>
        </Button>
      </div>
    </article>
  );
}
