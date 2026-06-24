import Link from "next/link";
import type { Metadata } from "next";
import { fetchSalaryRoles } from "@/lib/data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Remote Salary Benchmarks India 2026 | RemoteForge",
  description:
    "Anonymous salary data for remote workers in India. See median pay by role, experience level, and company.",
};

export default async function SalaryIndexPage() {
  const roles = await fetchSalaryRoles();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Remote Salary Benchmarks</h1>
          <p className="mt-2 text-muted-foreground">
            Anonymous salary data from India-based remote workers. No sign-up required.
          </p>
        </div>
        <Link
          href="/salary/submit"
          className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Submit yours →
        </Link>
      </div>

      {!roles || roles.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            No salary data yet — be the first to contribute!
          </p>
          <Link
            href="/salary/submit"
            className="mt-4 inline-block text-primary hover:underline"
          >
            Submit your salary →
          </Link>
        </div>
      ) : (
        <div className="mt-8 divide-y divide-border rounded-xl border border-border">
          {roles.map((r) => (
            <Link
              key={r.roleSlug}
              href={`/salary/${r.roleSlug}`}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/40"
            >
              <span className="font-medium">{r.role}</span>
              <span className="text-sm text-muted-foreground">
                {r._count.id} report{r._count.id !== 1 ? "s" : ""} →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
