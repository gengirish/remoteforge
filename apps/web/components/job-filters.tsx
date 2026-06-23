"use client";

import { cn } from "@/lib/utils";

const CATEGORIES = [
  "engineering",
  "design",
  "marketing",
  "sales",
  "support",
  "writing",
  "product",
] as const;

export interface JobFiltersState {
  category?: string;
  indiaOnly?: boolean;
  search?: string;
}

interface JobFiltersProps {
  filters: JobFiltersState;
  onChange: (filters: JobFiltersState) => void;
  className?: string;
}

export function JobFilters({ filters, onChange, className }: JobFiltersProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center", className)}>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange({ ...filters, category: undefined })}
          className={cn(
            "filter-pill",
            !filters.category && "filter-pill-active",
          )}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onChange({ ...filters, category: cat })}
            className={cn(
              "filter-pill capitalize",
              filters.category === cat && "filter-pill-active",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-muted/50 sm:ml-auto">
        <input
          type="checkbox"
          checked={filters.indiaOnly ?? false}
          onChange={(e) =>
            onChange({ ...filters, indiaOnly: e.target.checked || undefined })
          }
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
        <span className="font-medium">India-friendly only</span>
      </label>
    </div>
  );
}
