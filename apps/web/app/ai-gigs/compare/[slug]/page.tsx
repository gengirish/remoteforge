import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, X } from "lucide-react";
import { IndiaBadge } from "@/components/india-badge";
import { OnboardingTimeline } from "@/components/onboarding-timeline";
import { PageHeader } from "@/components/page-header";
import { SalaryBadge } from "@/components/salary-badge";
import { Button } from "@/components/ui/button";
import { fetchGigBySlug } from "@/lib/data";
import { fetchUsdToInrRate } from "@/lib/currency";
import { apiGoUrl } from "@/lib/api-url";
import {
  comparisonJsonLd,
  getAllComparisons,
  getComparisonBySlug,
  type GigComparison,
} from "@/lib/gig-comparisons";
import type { GigPlatform } from "@intelliforge/db";
import { siteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

const BASE_URL = siteUrl;

const TYPE_COLORS: Record<string, string> = {
  rlhf: "bg-violet-100 dark:bg-violet-500/15 text-violet-800 dark:text-violet-300",
  annotation: "bg-sky-100 dark:bg-sky-500/15 text-sky-800 dark:text-sky-300",
  evaluator: "bg-teal-100 dark:bg-teal-500/15 text-teal-800 dark:text-teal-300",
  multilingual: "bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300",
  microtask: "bg-secondary text-secondary-foreground",
};

export async function generateStaticParams() {
  return getAllComparisons().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const comparison = getComparisonBySlug(params.slug);
  if (!comparison) return { title: "Comparison not found" };

  return {
    title: `${comparison.title} | RemoteForge`,
    description: comparison.metaDescription,
    openGraph: {
      title: comparison.title,
      description: comparison.metaDescription,
    },
  };
}

async function loadPlatforms(slugs: string[]) {
  const results = await Promise.all(slugs.map((slug) => fetchGigBySlug(slug)));
  const platforms = results.filter((p): p is GigPlatform => p !== null);
  return platforms;
}

function ComparisonTable({
  comparison,
  platforms,
  inrRate,
}: {
  comparison: GigComparison;
  platforms: GigPlatform[];
  inrRate?: number;
}) {
  const overview = comparison.sections.find((s) => s.rows?.length);
  if (!overview?.rows) return null;

  return (
    <div className="card-surface overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Feature
            </th>
            {platforms.map((p) => (
              <th key={p.id} className="px-4 py-3 text-left font-semibold">
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border">
            <td className="px-4 py-3 font-medium text-muted-foreground">Pay</td>
            {platforms.map((p) => (
              <td key={p.id} className="px-4 py-3">
                <SalaryBadge payMin={p.payMin} payMax={p.payMax} inrRate={inrRate} />
              </td>
            ))}
          </tr>
          <tr className="border-b border-border">
            <td className="px-4 py-3 font-medium text-muted-foreground">India</td>
            {platforms.map((p) => (
              <td key={p.id} className="px-4 py-3">
                <IndiaBadge accepted={p.indiaAccepted} />
              </td>
            ))}
          </tr>
          <tr className="border-b border-border">
            <td className="px-4 py-3 font-medium text-muted-foreground">
              Onboarding
            </td>
            {platforms.map((p) => (
              <td key={p.id} className="px-4 py-3">
                <OnboardingTimeline days={p.onboardingDays} />
              </td>
            ))}
          </tr>
          <tr className="border-b border-border">
            <td className="px-4 py-3 font-medium text-muted-foreground">Type</td>
            {platforms.map((p) => (
              <td key={p.id} className="px-4 py-3">
                <span
                  className={cn(
                    "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                    TYPE_COLORS[p.type] ?? TYPE_COLORS.microtask,
                  )}
                >
                  {p.type}
                </span>
              </td>
            ))}
          </tr>
          {overview.rows
            .filter(
              (row) =>
                !["Pay (USD/hr)", "India eligibility", "Onboarding", "Task types"].includes(
                  row.label,
                ),
            )
            .map((row) => (
              <tr key={row.label} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-muted-foreground">
                  {row.label}
                </td>
                {platforms.map((p) => (
                  <td key={p.id} className="px-4 py-3 text-muted-foreground">
                    {row.values[p.slug] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          <tr>
            <td className="px-4 py-3 font-medium text-muted-foreground">
              Task focus
            </td>
            {platforms.map((p) => (
              <td key={p.id} className="px-4 py-3 text-muted-foreground">
                {overview.rows?.find((r) => r.label === "Task types")?.values[p.slug] ??
                  p.specialties.join(", ")}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function ProsConsGrid({
  comparison,
  platforms,
}: {
  comparison: GigComparison;
  platforms: GigPlatform[];
}) {
  const section = comparison.sections.find((s) => s.prosCons);
  if (!section?.prosCons) return null;

  return (
    <div
      className={cn(
        "mt-10 grid gap-4",
        platforms.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3",
      )}
    >
      {platforms.map((p) => {
        const pc = section.prosCons![p.slug];
        if (!pc) return null;

        return (
          <article key={p.id} className="card-surface flex flex-col p-5">
            <h3 className="font-semibold">{p.name}</h3>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  Pros
                </p>
                <ul className="mt-2 space-y-1.5">
                  {pc.pros.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-300">
                  Cons
                </p>
                <ul className="mt-2 space-y-1.5">
                  {pc.cons.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2 text-sm text-muted-foreground"
                    >
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-auto flex flex-wrap gap-2 pt-5">
              <Button asChild variant="outline" size="sm">
                <Link href={`/ai-gigs/${p.slug}`}>Full guide</Link>
              </Button>
              <Button asChild size="sm">
                <a href={apiGoUrl(p.id, { type: "gig", clickType: "referral" })}>
                  Apply
                </a>
              </Button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default async function GigComparePage({ params }: { params: { slug: string } }) {
  const comparison = getComparisonBySlug(params.slug);
  if (!comparison) notFound();

  const [platforms, inrRate] = await Promise.all([
    loadPlatforms(comparison.platformSlugs),
    fetchUsdToInrRate(),
  ]);
  if (platforms.length === 0) notFound();

  const jsonLd = comparisonJsonLd(comparison, BASE_URL);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <Link
        href="/ai-gigs"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to platforms
      </Link>

      <PageHeader title={comparison.title} description={comparison.intro} className="mt-6" />

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Side-by-side comparison</h2>
        <div className="mt-4">
          <ComparisonTable comparison={comparison} platforms={platforms} inrRate={inrRate} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Pros & cons</h2>
        <ProsConsGrid comparison={comparison} platforms={platforms} />
      </section>

      {comparison.faq.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold">FAQ</h2>
          <dl className="mt-4 space-y-4">
            {comparison.faq.map((item) => (
              <div key={item.question} className="card-surface p-5">
                <dt className="font-medium">{item.question}</dt>
                <dd className="mt-2 text-sm text-muted-foreground">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}
