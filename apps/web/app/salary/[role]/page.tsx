import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { fetchSalaryByRole, fetchSalaryRoles } from "@/lib/data";

export const revalidate = 3600;

interface Props {
  params: { role: string };
}

export async function generateStaticParams() {
  const roles = await fetchSalaryRoles();
  return (roles ?? []).map((r) => ({ role: r.roleSlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await fetchSalaryByRole(params.role);
  if (!data || !data.median) return { title: "Salary Data | RemoteForge" };
  const roleLabel = params.role
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: `${roleLabel} Remote Salary in India 2026 | RemoteForge`,
    description: `Median remote salary for ${roleLabel} in India: $${data.median.toLocaleString()}/yr. Based on ${data.dataPoints} anonymous reports.`,
  };
}

export default async function SalaryRolePage({ params }: Props) {
  const data = await fetchSalaryByRole(params.role);
  if (!data) notFound();

  const roleLabel = params.role
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const hasData = data.dataPoints >= 3 && data.median;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/salary"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Salary benchmarks
      </Link>
      <h1 className="mt-6 text-3xl font-bold">{roleLabel}</h1>
      <p className="mt-1 text-muted-foreground">
        Remote salary data for India-based professionals
      </p>

      {!hasData ? (
        <div className="mt-8 rounded-xl border border-border p-8 text-center">
          <p className="text-muted-foreground">
            {data.message ?? "Not enough data yet."}
          </p>
          <Link
            href="/salary/submit"
            className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Submit your salary →
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            <SalaryCard
              label="Median"
              value={`$${data.median!.toLocaleString()}`}
              highlight
            />
            <SalaryCard
              label="25th percentile"
              value={`$${data.p25!.toLocaleString()}`}
            />
            <SalaryCard
              label="75th percentile"
              value={`$${data.p75!.toLocaleString()}`}
            />
            <SalaryCard
              label="Data points"
              value={data.dataPoints.toString()}
            />
          </div>
          <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            Range: ${data.min!.toLocaleString()} – ${data.max!.toLocaleString()} · Average: $
            {data.avg!.toLocaleString()}
          </div>
          <div className="mt-8">
            <Link
              href="/salary/submit"
              className="text-sm text-primary hover:underline"
            >
              + Add your salary (anonymous) →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function SalaryCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${highlight ? "border-primary/30 bg-primary/5" : "border-border bg-background"}`}
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${highlight ? "text-primary" : ""}`}>
        {value}
      </p>
    </div>
  );
}
