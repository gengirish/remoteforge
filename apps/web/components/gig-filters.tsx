"use client";

import { cn } from "@/lib/utils";

const GIG_TYPES = [
  "rlhf",
  "annotation",
  "evaluator",
  "multilingual",
  "microtask",
] as const;

export interface GigFiltersState {
  type?: string;
  indiaOnly?: boolean;
  minPay?: number;
}

interface GigFiltersProps {
  filters: GigFiltersState;
  onChange: (filters: GigFiltersState) => void;
  className?: string;
}

export function GigFilters({ filters, onChange, className }: GigFiltersProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <select
        value={filters.type ?? ""}
        onChange={(e) =>
          onChange({ ...filters, type: e.target.value || undefined })
        }
        className="h-9 rounded-md border border-border bg-background px-3 text-sm"
      >
        <option value="">All types</option>
        {GIG_TYPES.map((t) => (
          <option key={t} value={t}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
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
        India-accepted only
      </label>
    </div>
  );
}
