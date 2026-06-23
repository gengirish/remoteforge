import Link from "next/link";
import { notFound } from "next/navigation";
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
import { gigJsonLd, gigMetadata } from "@/lib/seo";

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
  const platform = await fetchGigBySlug(params.slug);
  if (!platform) notFound();

  const alternatives = platform.indiaAccepted
    ? []
    : await fetchIndiaGigAlternatives();

  const referUrl = apiGoUrl(platform.id, { type: "gig", clickType: "referral" });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gigJsonLd(platform)) }}
      />
      <h1 className="text-3xl font-bold">{platform.name}</h1>
      <div className="mt-2 flex items-center gap-3">
        <IndiaBadge accepted={platform.indiaAccepted} />
      </div>
      <p className="mt-6 text-muted-foreground">{platform.description}</p>
      <div className="mt-6 space-y-2">
        <SalaryBadge payMin={platform.payMin} payMax={platform.payMax} />
        <OnboardingTimeline days={platform.onboardingDays} />
      </div>
      <div className="mt-8">
        <Button asChild size="lg">
          <a href={referUrl}>Apply / Refer →</a>
        </Button>
      </div>
      {!platform.indiaAccepted && alternatives.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold">India-accepted alternatives</h2>
          <div className="mt-4 grid gap-4">
            {alternatives.map((alt) => (
              <GigPlatformCard key={alt.id} platform={alt} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
