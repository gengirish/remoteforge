import { cn } from "@/lib/utils";

interface IndiaBadgeProps {
  accepted: boolean;
  className?: string;
}

export function IndiaBadge({ accepted, className }: IndiaBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        accepted
          ? "bg-emerald-100 text-emerald-800"
          : "bg-red-100 text-red-800",
        className,
      )}
    >
      {accepted ? "India ✓" : "India ✗"}
    </span>
  );
}
