import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GigEarningsForm } from "@/components/gig-earnings-form";
import { GigPlatformCard } from "@/components/gig-platform-card";
import { IndiaBadge } from "@/components/india-badge";
import { OnboardingTimeline } from "@/components/onboarding-timeline";
import { SalaryBadge } from "@/components/salary-badge";
import { Button } from "@/components/ui/button";
import {
  fetchGigBySlug,
  fetchGigSlugs,
  fetchIndiaGigAlternatives,
} from "@/lib/data";
import { apiGoUrl } from "@/lib/api-url";
import { fetchUsdToInrRate } from "@/lib/currency";
import { gigJsonLd, gigMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

const TYPE_COLORS: Record<string, string> = {
  rlhf: "bg-violet-100 text-violet-800",
  annotation: "bg-sky-100 text-sky-800",
  evaluator: "bg-teal-100 text-teal-800",
  multilingual: "bg-amber-100 text-amber-800",
  microtask: "bg-secondary text-secondary-foreground",
};

export async function generateStaticParams() {
  const slugs = await fetchGigSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const platform = await fetchGigBySlug(params.slug);
  if (!platform) return { title: "Platform not found" };
  return gigMetadata(platform);
}

export default async function GigDetailPage({ params }: { params: { slug: string } }) {
  const [platform, inrRate] = await Promise.all([
    fetchGigBySlug(params.slug),
    fetchUsdToInrRate(),
  ]);
  if (!platform) notFound();

  const alternatives = platform.indiaAccepted
    ? []
    : await fetchIndiaGigAlternatives();

  const referUrl = apiGoUrl(platform.id, { type: "gig", clickType: "referral" });
  const initial = platform.name.charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gigJsonLd(platform)) }}
      />

      <Link
        href="/ai-gigs"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to platforms
      </Link>

      <article className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-gradient-to-r from-primary/5 to-accent/5 px-6 py-8 sm:px-8">
          <div className="flex items-start gap-4">
            {platform.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={platform.logoUrl}
                alt={platform.name}
                className="h-14 w-14 shrink-0 rounded-xl border border-border object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">
                {initial}
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold sm:text-3xl">{platform.name}</h1>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                    TYPE_COLORS[platform.type] ?? TYPE_COLORS.microtask,
                  )}
                >
                  {platform.type}
                </span>
              </div>
              <div className="mt-2">
                <IndiaBadge accepted={platform.indiaAccepted} />
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-8 sm:px-8">
          <p className="leading-relaxed text-muted-foreground">{platform.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <SalaryBadge payMin={platform.payMin} payMax={platform.payMax} inrRate={inrRate} />
            <OnboardingTimeline days={platform.onboardingDays} />
          </div>
          <div className="mt-8 border-t border-border pt-8">
            <Button asChild size="lg">
              <a href={referUrl}>Apply / Refer</a>
            </Button>
          </div>
        </div>
      </article>

      <section className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Real Earnings from India</h2>
          <Link
            href={`/ai-gigs/${params.slug}/earnings`}
            className="text-sm text-primary hover:underline"
          >
            View all reports →
          </Link>
        </div>
        <GigEarningsForm
          platformId={platform.id}
          apiUrl={process.env.NEXT_PUBLIC_API_URL ?? ""}
        />
      </section>

      {!platform.indiaAccepted && alternatives.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold">India-accepted alternatives</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This platform doesn&apos;t accept India — try these instead.
          </p>
          <div className="mt-4 grid gap-4">
            {alternatives.map((alt) => (
              <GigPlatformCard key={alt.id} platform={alt} inrRate={inrRate} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
