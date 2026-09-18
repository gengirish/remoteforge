import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getGigApprovalContent, type GigApprovalContent } from "@/content/gig-approval";
import { EmailCapture } from "@/components/email-capture";
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
import { apiGoUrl, getPublicApiUrl } from "@/lib/api-url";
import { fetchUsdToInrRate } from "@/lib/currency";
import { faqPageJsonLd, gigJsonLd, gigMetadata } from "@/lib/seo";
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
  const approval = getGigApprovalContent(params.slug);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gigJsonLd(platform)) }}
      />
      {approval && approval.rejectionReasons.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqPageJsonLd(approval.rejectionReasons)),
          }}
        />
      )}

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

      {approval && (
        <>
          <ApprovalGuide name={platform.name} content={approval} />

          <div className="mt-8">
            <EmailCapture
              variant="compact"
              title={`Get an alert when ${platform.name} opens onboarding for Indians`}
              description="One email when new India-eligible projects or onboarding open up. No spam."
              submitLabel="Alert me"
              source="gig-approval-alert"
              signal={`approval-alert:${params.slug}`}
              defaultJobAlerts={false}
              defaultGigAlerts
            />
          </div>

          <div className="mt-8">
            <EmailCapture
              title={`${platform.name} assessment prep pack — join the waitlist`}
              description={`We're planning a paid prep pack (₹499–₹1,499) for ${platform.name}'s screenings: practice exercises, rubric walkthroughs and interview prep. Prep, not leaked answers. Join the waitlist to hear when it's ready.`}
              submitLabel="Join the waitlist"
              source="prep-waitlist"
              signal={`prep-waitlist:${params.slug}`}
              defaultJobAlerts={false}
              defaultGigAlerts
            />
          </div>
        </>
      )}

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
          apiUrl={getPublicApiUrl()}
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

function ApprovalGuide({ name, content }: { name: string; content: GigApprovalContent }) {
  return (
    <section
      aria-labelledby="approval-guide-heading"
      className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <div className="border-b border-border px-6 py-6 sm:px-8">
        <h2 id="approval-guide-heading" className="text-xl font-semibold">
          How to get approved on {name} from India
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Last verified{" "}
          <time dateTime={content.lastVerified}>{content.lastVerified}</time>
        </p>
        <p className="mt-4 leading-relaxed text-muted-foreground">{content.summary}</p>
      </div>

      <div className="space-y-8 px-6 py-8 sm:px-8">
        <div>
          <h3 className="font-semibold">Eligibility</h3>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
            {content.eligibility.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold">Steps</h3>
          <ol className="mt-3 space-y-4">
            {content.steps.map((step, i) => (
              <li key={step.title} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {step.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <h3 className="text-sm font-semibold">Approval time</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {content.approvalTime}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <h3 className="text-sm font-semibold">Payout to India</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {content.payoutToIndia}
            </p>
          </div>
        </div>

        {content.rejectionReasons.length > 0 && (
          <div>
            <h3 className="font-semibold">Common rejection reasons</h3>
            <div className="mt-3 divide-y divide-border rounded-xl border border-border">
              {content.rejectionReasons.map((item) => (
                <details key={item.q} className="group px-4 py-3">
                  <summary className="cursor-pointer list-none text-sm font-medium marker:hidden">
                    <span className="flex items-center justify-between gap-3">
                      {item.q}
                      <span className="text-muted-foreground transition-transform group-open:rotate-45">
                        +
                      </span>
                    </span>
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        )}

        {content.relatedGuides.length > 0 && (
          <div>
            <h3 className="font-semibold">Related guides</h3>
            <ul className="mt-3 space-y-1.5 text-sm">
              {content.relatedGuides.map((guide) => (
                <li key={guide.slug}>
                  <Link href={`/guides/${guide.slug}`} className="text-primary hover:underline">
                    {guide.title} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {content.sources.length > 0 && (
          <div className="border-t border-border pt-6">
            <h3 className="text-sm font-semibold">Sources</h3>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              {content.sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="hover:text-primary hover:underline"
                  >
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Platforms change their rules often. Always confirm on the official site before you apply.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
