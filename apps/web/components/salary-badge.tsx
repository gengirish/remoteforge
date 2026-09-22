import { formatSalaryRange } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface SalaryBadgeProps {
  salaryMin?: number | null;
  salaryMax?: number | null;
  payMin?: number;
  payMax?: number;
  /** Pass from server for DB-backed Frankfurter rate; falls back to env on client. */
  inrRate?: number;
  className?: string;
}

export function SalaryBadge({
  salaryMin,
  salaryMax,
  payMin,
  payMax,
  inrRate,
  className,
}: SalaryBadgeProps) {
  const min = salaryMin ?? payMin;
  const max = salaryMax ?? payMax;
  const formatted = formatSalaryRange(min, max, inrRate);

  if (!formatted) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-500/15 px-2.5 py-1 text-sm font-semibold text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-100 dark:ring-emerald-500/30",
        className,
      )}
    >
      {formatted}
    </span>
  );
}
