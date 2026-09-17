import Link from "next/link";
import { notFound } from "next/navigation";
import { EmailCapture } from "@/components/email-capture";
import { PageHeader } from "@/components/page-header";
import { getGuide, guideSlugs } from "@/content/guides";
import { articleJsonLd, faqPageJsonLd, guideMetadata } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

export const dynamicParams = false;

const GIG_NAMES: Record<string, string> = {
  "outlier-ai": "Outlier AI",
  mercor: "Mercor",
  alignerr: "Alignerr",
};

function gigName(slug: string) {
  return GIG_NAMES[slug] ?? slug;
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function generateStaticParams() {
  return guideSlugs.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const guide = getGuide(params.slug);
  if (!guide) return {};
  return guideMetadata({
    title: guide.title,
    metaDescription: guide.metaDescription,
    url: `${siteUrl}/guides/${guide.slug}`,
    lastVerified: guide.lastVerified,
  });
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const guide = getGuide(params.slug);
  if (!guide) notFound();

  const url = `${siteUrl}/guides/${guide.slug}`;
  const jsonLd = [
    articleJsonLd({
      title: guide.title,
      description: guide.metaDescription,
      url,
      dateModified: guide.lastVerified,
    }),
    faqPageJsonLd(guide.faq),
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader title={guide.title} description={guide.intro} />

      <p className="mt-4 text-sm text-muted-foreground">
        Last verified: <time dateTime={guide.lastVerified}>{formatDate(guide.lastVerified)}</time>
      </p>

      <article className="prose prose-sm mt-10 max-w-none prose-headings:font-display prose-p:text-muted-foreground prose-li:text-muted-foreground prose-a:text-primary">
        {guide.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {section.bullets && section.bullets.length > 0 && (
              <ul>
                {section.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section>
          <h2>Platform pages</h2>
          <p>Current pay bands, payout methods and approval estimates on RemoteForge:</p>
          <ul>
            {guide.relatedGigSlugs.map((slug) => (
              <li key={slug}>
                <Link href={`/ai-gigs/${slug}`}>{gigName(slug)}</Link>
                {" · "}
                <Link href={`/ai-gigs/${slug}/earnings`}>{gigName(slug)} earnings</Link>
              </li>
            ))}
            <li>
              <Link href="/ai-gigs">All AI training platforms that accept Indians</Link>
            </li>
          </ul>
        </section>

        <section>
          <h2>Frequently asked questions</h2>
          {guide.faq.map((item) => (
            <div key={item.q}>
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </div>
          ))}
        </section>

        <section>
          <h2>Sources</h2>
          <p>
            Official help pages are listed first where available. Community and review-site
            reports are individual experiences, not platform policy.
          </p>
          <ul>
            {guide.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noopener noreferrer nofollow">
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </article>

      <div className="mt-12">
        <EmailCapture source={`guide-${guide.slug}`} signal={guide.signal} defaultGigAlerts />
      </div>
    </div>
  );
}
