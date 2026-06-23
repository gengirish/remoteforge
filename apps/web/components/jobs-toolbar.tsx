"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { JobFilters, type JobFiltersState } from "./job-filters";
import { SearchBar } from "./search-bar";

export function JobsToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters: JobFiltersState = {
    category: searchParams.get("category") ?? undefined,
    indiaOnly: searchParams.get("indiaOnly") === "true",
    search: searchParams.get("search") ?? undefined,
  };

  const updateParams = useCallback(
    (next: Partial<JobFiltersState>) => {
      const params = new URLSearchParams(searchParams.toString());
      const merged = { ...filters, ...next };

      if (merged.category) params.set("category", merged.category);
      else params.delete("category");

      if (merged.indiaOnly) params.set("indiaOnly", "true");
      else params.delete("indiaOnly");

      if (merged.search) params.set("search", merged.search);
      else params.delete("search");

      params.delete("page");
      router.push(`/jobs?${params.toString()}`);
    },
    [filters, router, searchParams],
  );

  return (
    <div className="mt-6 space-y-4">
      <SearchBar
        placeholder="Search jobs by title or company..."
        defaultValue={filters.search ?? ""}
        onSearch={(q) => updateParams({ search: q || undefined })}
      />
      <JobFilters filters={filters} onChange={updateParams} />
    </div>
  );
}

export function JobsPagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const searchParams = useSearchParams();
  if (totalPages <= 1) return null;

  const makeHref = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    return `/jobs?${params.toString()}`;
  };

  return (
    <div className="mt-8 flex justify-center gap-4">
      {page > 1 && (
        <Link href={makeHref(page - 1)} className="text-sm text-primary hover:underline">
          ← Previous
        </Link>
      )}
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      {page < totalPages && (
        <Link href={makeHref(page + 1)} className="text-sm text-primary hover:underline">
          Next →
        </Link>
      )}
    </div>
  );
}
