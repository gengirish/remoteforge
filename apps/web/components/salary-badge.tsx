import { formatSalaryRange } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface SalaryBadgeProps {
  salaryMin?: number | null;
  salaryMax?: number | null;
  payMin?: number;
  payMax?: number;
  className?: string;
}

export function SalaryBadge({
  salaryMin,
  salaryMax,
  payMin,
  payMax,
  className,
}: SalaryBadgeProps) {
  const min = salaryMin ?? payMin;
  const max = salaryMax ?? payMax;
  const formatted = formatSalaryRange(min, max);

  if (!formatted) return null;

  return (
    <span
      className={cn(
        "text-sm font-medium text-emerald-700",
        className,
      )}
    >
      {formatted}
    </span>
  );
}
