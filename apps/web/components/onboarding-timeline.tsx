import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingTimelineProps {
  days: string;
  className?: string;
}

export function OnboardingTimeline({ days, className }: OnboardingTimelineProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-sm text-muted-foreground",
        className,
      )}
    >
      <Clock className="h-3.5 w-3.5" />
      Start in {days.replace("-", "–")} days
    </span>
  );
}
