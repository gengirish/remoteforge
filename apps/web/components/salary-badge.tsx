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
        "inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100",
        className,
      )}
    >
      {formatted}
    </span>
  );
}
