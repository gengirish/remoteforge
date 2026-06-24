import Link from "next/link";
import type { Metadata } from "next";
import { fetchIncomeReport } from "@/lib/data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "India Remote Income Report | RemoteForge",
  description:
    "Live data on remote salaries, gig earnings, and job application outcomes for India-based professionals. Updated hourly from anonymous community submissions.",
};

export default async function IncomeReportPage() {
  const report = await fetchIncomeReport();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">India Remote Income Report</h1>
        <p className="mt-2 text-muted-foreground">
          Live aggregate data from anonymous community submissions. Updated hourly.
        </p>
        {report?.generatedAt && (
          <p className="mt-1 text-xs text-muted-foreground">
            Last updated:{" "}
            {new Date(report.generatedAt).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        )}
      </div>

      {/* Data point summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <DataCard
          label="Salary reports"
          value={(report?.dataPoints.salaryReports ?? 0).toLocaleString()}
          href="/salary"
        />
        <DataCard
          label="Applications tracked"
          value={(report?.dataPoints.applications ?? 0).toLocaleString()}
          href="/dashboard/applications"
        />
        <DataCard
          label="Gig income reports"
          value={(report?.dataPoints.gigReports ?? 0).toLocaleString()}
          href="/ai-gigs"
        />
      </div>

      {/* Top roles */}
      {report?.topRoles && report.topRoles.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Top Roles by Salary Data</h2>
          <div className="mt-4 divide-y divide-border rounded-xl border border-border">
            {report.topRoles.map((r) => (
              <Link
                key={r.roleSlug}
                href={`/salary/${r.roleSlug}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/40"
              >
                <div>
                  <span className="font-medium">{r.role}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {r._count.id} reports
                  </span>
                </div>
                {r._avg.salaryUsd && (
                  <span className="font-semibold text-green-600">
                    avg ${Math.round(r._avg.salaryUsd).toLocaleString()}/yr
                  </span>
                )}
              </Link>
            ))}
          </div>
          <Link href="/salary" className="mt-3 inline-block text-sm text-primary hover:underline">
            View all salary benchmarks →
          </Link>
        </section>
      )}

      {/* Top gig platforms */}
      {report?.topGigPlatforms && report.topGigPlatforms.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Top Gig Platforms by Earnings</h2>
          <div className="mt-4 divide-y divide-border rounded-xl border border-border">
            {report.topGigPlatforms.map((p) => (
              <div key={p.platformId} className="flex items-center justify-between px-5 py-3.5">
                <span className="text-sm text-muted-foreground font-mono text-xs">{p.platformId}</span>
                <div className="text-right">
                  {p._avg.earningsUsdMonth && (
                    <span className="font-semibold">
                      avg ${Math.round(p._avg.earningsUsdMonth).toLocaleString()}/mo
                    </span>
                  )}
                  <span className="ml-2 text-xs text-muted-foreground">{p._count.id} reports</span>
                </div>
              </div>
            ))}
          </div>
          <Link href="/ai-gigs" className="mt-3 inline-block text-sm text-primary hover:underline">
            Browse AI gig platforms →
          </Link>
        </section>
      )}

      {/* Recent wins */}
      {report?.recentStories && report.recentStories.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Recent Wins</h2>
          <div className="mt-4 space-y-3">
            {report.recentStories.map((s, i) => (
              <div key={i} className="rounded-xl border border-border px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="font-medium">{s.displayName}</span>
                    <span className="text-muted-foreground"> · {s.role} at {s.company}</span>
                    {s.city && <span className="text-muted-foreground">, {s.city}</span>}
                  </div>
                  {s.salaryUsd && (
                    <span className="shrink-0 font-bold text-green-600">
                      ${s.salaryUsd.toLocaleString()}/yr
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/community/wins"
            className="mt-3 inline-block text-sm text-primary hover:underline"
          >
            Read full stories →
          </Link>
        </section>
      )}

      {!report && (
        <div className="mt-12 rounded-xl border border-border p-8 text-center">
          <p className="text-muted-foreground">No data yet — be the first to contribute!</p>
          <div className="mt-4 flex justify-center gap-4">
            <Link href="/salary/submit" className="text-sm text-primary hover:underline">
              Submit salary →
            </Link>
            <Link href="/community/wins/submit" className="text-sm text-primary hover:underline">
              Share your win →
            </Link>
          </div>
        </div>
      )}

      <div className="mt-10 rounded-xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
        All data is anonymous and community-sourced. Salary figures are self-reported in USD.
        Gig earnings are monthly USD. Applications tracked via the RemoteForge application tracker.
      </div>
    </div>
  );
}

function DataCard({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link href={href} className="block rounded-xl border border-border bg-background p-5 hover:bg-muted/40">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </Link>
  );
}
