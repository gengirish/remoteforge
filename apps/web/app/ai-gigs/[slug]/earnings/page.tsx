import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchGigEarnings, fetchGigSlugs } from "@/lib/data";

export const revalidate = 3600;

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await fetchGigSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await fetchGigEarnings(params.slug);
  if (!data) return { title: "Earnings Data | RemoteForge" };
  return {
    title: `${data.platform.name} Real Earnings India 2026 | RemoteForge`,
    description: `What do Indian workers actually earn on ${data.platform.name}? ${data.dataPoints} anonymous reports. Median: $${data.median ?? "N/A"}/month.`,
  };
}

export default async function GigEarningsPage({ params }: Props) {
  const data = await fetchGigEarnings(params.slug);
  if (!data) notFound();

  const hasData = data.dataPoints >= 3 && data.median != null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href={`/ai-gigs/${params.slug}`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to {data.platform.name}
      </Link>

      <h1 className="mt-6 text-3xl font-bold">{data.platform.name} — Real Earnings</h1>
      <p className="mt-1 text-muted-foreground">
        Anonymous income reports from India-based workers
      </p>

      {!hasData ? (
        <div className="mt-8 rounded-xl border border-border p-8 text-center">
          <p className="text-muted-foreground">{data.message ?? "No earnings data yet."}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Be the first to share your {data.platform.name} earnings — it helps thousands of Indian
            freelancers.
          </p>
          <Link
            href={`/ai-gigs/${params.slug}`}
            className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Submit your earnings →
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <EarningsCard label="Median monthly" value={`$${data.median!.toLocaleString()}`} highlight />
            <EarningsCard label="Top 10% earn" value={`$${data.p90!.toLocaleString()}`} />
            <EarningsCard label="Reports" value={data.dataPoints.toString()} />
          </div>

          {data.taskBreakdown && data.taskBreakdown.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold">By Task Type</h2>
              <div className="mt-3 divide-y divide-border rounded-xl border border-border">
                {data.taskBreakdown.map((t) => (
                  <div key={t.taskType} className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm font-medium capitalize">{t.taskType}</span>
                    <div className="text-right">
                      <span className="font-semibold">${t.median.toLocaleString()}/mo</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({t.count} {t.count === 1 ? "report" : "reports"})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/15 p-4 text-sm text-amber-900 dark:text-amber-300">
            <strong>Platform-stated range:</strong>{" "}
            ₹{data.platform.payMin.toLocaleString("en-IN")}–₹{data.platform.payMax.toLocaleString("en-IN")}
            /month
            {data.platform.payNote && <span> · {data.platform.payNote}</span>}
          </div>

          <Link
            href={`/ai-gigs/${params.slug}`}
            className="mt-6 inline-block text-sm text-primary hover:underline"
          >
            + Submit your earnings →
          </Link>
        </>
      )}
    </div>
  );
}

function EarningsCard({
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
      className={`rounded-xl border p-4 ${
        highlight ? "border-primary/30 bg-primary/5" : "border-border bg-background"
      }`}
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${highlight ? "text-primary" : ""}`}>{value}</p>
    </div>
  );
}
