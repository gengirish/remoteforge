import { cn } from "@/lib/utils";

interface IndiaBadgeProps {
  accepted: boolean;
  className?: string;
}

export function IndiaBadge({ accepted, className }: IndiaBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        accepted
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-red-50 text-red-700 ring-1 ring-red-200",
        className,
      )}
    >
      <span aria-hidden>{accepted ? "🇮🇳" : "🌍"}</span>
      {accepted ? "India OK" : "Intl only"}
    </span>
  );
}
