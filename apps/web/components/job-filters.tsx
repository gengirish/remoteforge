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
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <select
        value={filters.category ?? ""}
        onChange={(e) =>
          onChange({ ...filters, category: e.target.value || undefined })
        }
        className="h-9 rounded-md border border-border bg-background px-3 text-sm"
      >
        <option value="">All categories</option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </option>
        ))}
      </select>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={filters.indiaOnly ?? false}
          onChange={(e) =>
            onChange({ ...filters, indiaOnly: e.target.checked || undefined })
          }
        />
        India-friendly only
      </label>
    </div>
  );
}
