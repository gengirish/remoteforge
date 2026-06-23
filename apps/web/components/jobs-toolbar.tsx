"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback } from "react";
import { JobFilters, type JobFiltersState } from "./job-filters";
import { SearchBar } from "./search-bar";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

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
    <div className="mt-6 space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
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
    <nav
      className="mt-10 flex items-center justify-center gap-3"
      aria-label="Pagination"
    >
      <Button
        asChild
        variant="outline"
        size="sm"
        className={cn(page <= 1 && "pointer-events-none opacity-40")}
      >
        <Link href={page > 1 ? makeHref(page - 1) : "#"} aria-disabled={page <= 1}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Link>
      </Button>
      <span className="min-w-[7rem] text-center text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <Button
        asChild
        variant="outline"
        size="sm"
        className={cn(page >= totalPages && "pointer-events-none opacity-40")}
      >
        <Link
          href={page < totalPages ? makeHref(page + 1) : "#"}
          aria-disabled={page >= totalPages}
        >
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </Button>
    </nav>
  );
}
