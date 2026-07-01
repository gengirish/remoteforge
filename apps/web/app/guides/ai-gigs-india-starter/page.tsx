import Link from "next/link";
import { GigPlatformCard } from "@/components/gig-platform-card";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { fetchGigBySlug } from "@/lib/data";
import { fetchUsdToInrRate } from "@/lib/currency";
import { indiaAiGigStarterMetadata } from "@/lib/seo";

export const metadata = indiaAiGigStarterMetadata();
export const revalidate = 3600;

const FEATURED_SLUGS = ["outlier-ai", "alignerr", "prolific"] as const;

async function fetchFeaturedPlatforms() {
  const results = await Promise.all(
    FEATURED_SLUGS.map((slug) => fetchGigBySlug(slug)),
  );
  return results.filter((p): p is NonNullable<typeof p> => p !== null);
}

export default async function IndiaAiGigStarterPage() {
  const [featuredPlatforms, inrRate] = await Promise.all([
    fetchFeaturedPlatforms(),
    fetchUsdToInrRate(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PageHeader
        title="India AI Gig Starter Path"
        description="A practical onboarding plan for students, freelancers, and MTech grads who want RLHF, annotation, and evaluation work from India — without falling for scams."
      />

      <article className="prose prose-sm mt-10 max-w-none prose-headings:font-display prose-p:text-muted-foreground prose-li:text-muted-foreground prose-a:text-primary">
        <section>
          <h2>Who this is for</h2>
          <p>
            This guide is for India-based workers who want flexible, remote AI gig
            income — especially students, freelancers, and recent MTech or
            engineering grads exploring{" "}
            <strong className="text-foreground">AI annotation jobs India</strong>{" "}
            and <strong className="text-foreground">RLHF jobs India</strong> for
            the first time.
          </p>
          <p>
            You do not need a full-time job offer or prior ML experience. You do
            need a stable internet connection, a laptop, honest profile details,
            and patience through onboarding queues (which can take 1–6 weeks on
            some platforms).
          </p>
        </section>

        <section>
          <h2>Recommended platform stack</h2>
          <p>
            Treat platforms in tiers — build proof of work on entry sites before
            applying to higher-paying RLHF roles.
          </p>

          <h3>Primary (highest pay, longer onboarding)</h3>
          <ul>
            <li>
              <Link href="/ai-gigs/outlier-ai">Outlier AI</Link> — Scale&apos;s RLHF
              platform; among the best pay for India-accepted experts (
              <strong className="text-foreground">Outlier AI India</strong> is
              actively hiring for coding, math, and writing tasks).
            </li>
            <li>
              <Link href="/ai-gigs/alignerr">Alignerr</Link> — Labelbox RLHF with
              reasoning and ethics evaluation; good follow-up after Outlier.
            </li>
            <li>
              <a
                href="https://mercor.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Mercor
              </a>{" "}
              — expert-matching for AI training; apply once you have portfolio
              proof from Toloka or Prolific.
            </li>
          </ul>

          <h3>Secondary (steady volume, moderate pay)</h3>
          <ul>
            <li>
              <Link href="/ai-gigs/appen">Appen</Link> — image annotation, search
              evaluation, translation; slower onboarding but reliable projects.
            </li>
            <li>
              <Link href="/ai-gigs/telus-international-ai">
                TELUS International AI
              </Link>{" "}
              — search quality and ads evaluation; consistent flow for India
              annotators.
            </li>
          </ul>

          <h3>Entry (fast onboarding, build your track record)</h3>
          <ul>
            <li>
              <Link href="/ai-gigs/toloka">Toloka</Link> — micro-tasks; low pay but
              same-day start and no experience required.
            </li>
            <li>
              <Link href="/ai-gigs/prolific">Prolific</Link> — academic surveys;
              high trust scores, good for proof-of-work screenshots.
            </li>
            <li>
              <a
                href="https://www.clickworker.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Clickworker
              </a>{" "}
              — UHRS-linked microtasks; useful filler while waiting on RLHF
              approvals.
            </li>
          </ul>
        </section>

        {featuredPlatforms.length > 0 && (
          <section className="not-prose">
            <h2 className="text-xl font-semibold">Top platforms to apply first</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Live pay ranges and India eligibility from RemoteForge.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredPlatforms.map((platform) => (
                <GigPlatformCard key={platform.id} platform={platform} inrRate={inrRate} />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2>Week-by-week onboarding plan</h2>

          <h3>Week 1 — Proof of work</h3>
          <ul>
            <li>
              Sign up on <Link href="/ai-gigs/toloka">Toloka</Link> and{" "}
              <Link href="/ai-gigs/prolific">Prolific</Link>; complete 20–30
              tasks with high accuracy.
            </li>
            <li>
              Screenshot completed task history (blur personal data) — useful for
              Mercor or Alignerr applications.
            </li>
            <li>
              Set up PayPal or Wise if the platform supports it; verify bank KYC
              early.
            </li>
          </ul>

          <h3>Weeks 2–3 — Primary RLHF applications</h3>
          <ul>
            <li>
              Apply to <Link href="/ai-gigs/outlier-ai">Outlier AI</Link> and{" "}
              <Link href="/ai-gigs/alignerr">Alignerr</Link> with accurate
              education and skills (do not inflate credentials).
            </li>
            <li>
              Parallel-track <Link href="/ai-gigs/appen">Appen</Link> and{" "}
              <Link href="/ai-gigs/telus-international-ai">TELUS</Link> — queues
              are long; starting early matters.
            </li>
            <li>
              Read each platform&apos;s assessment tips on RemoteForge before
              starting timed tests.
            </li>
          </ul>

          <h3>Week 4 — Optimize and diversify</h3>
          <ul>
            <li>
              Follow up on pending applications; check spam folders for onboarding
              emails.
            </li>
            <li>
              Once approved on one RLHF platform, prioritize it for hourly blocks;
              keep Toloka/Prolific as backup income.
            </li>
            <li>
              Compare platforms side-by-side on our{" "}
              <Link href="/ai-gigs/compare/outlier-vs-appen-vs-telus">
                Outlier vs Appen vs TELUS
              </Link>{" "}
              page.
            </li>
          </ul>

          <h3>Month 2+ — Scale responsibly</h3>
          <ul>
            <li>Track hours and pay per platform in a simple spreadsheet.</li>
            <li>
              Avoid account resale or &quot;guaranteed approval&quot; Telegram
              services — they lead to permanent bans.
            </li>
            <li>
              Revisit RemoteForge listings monthly; new India-accepted platforms
              launch regularly.
            </li>
          </ul>
        </section>

        <section>
          <h2>India-specific tips</h2>

          <h3>Payments</h3>
          <p>
            Most international platforms pay via PayPal, Wise, or direct bank
            transfer in USD. PayPal India can receive foreign currency; withdraw
            to your linked bank account. Wise often gives better FX rates for
            larger payouts. Keep invoices or platform earning statements for your
            records.
          </p>

          <h3>Tax and GST (brief)</h3>
          <p>
            Freelance AI gig income is taxable in India under income tax rules.
            If your annual turnover crosses GST registration thresholds, consult a
            CA about GST on export of services (many small freelancers stay below
            the limit). This is not tax advice — verify with a professional.
          </p>

          <h3>Avoid VPN scams</h3>
          <p>
            Do not use a VPN to pretend you are in the US, UK, or another country.
            Platforms detect this and permanently ban accounts. Only apply to
            platforms that explicitly accept India — RemoteForge labels these with
            an India badge.
          </p>

          <h3>Account resale warnings</h3>
          <p>
            Never buy or sell platform accounts on Telegram or Discord. Buyers lose
            money when accounts get banned; sellers risk legal and platform
            violations. Build your own profile honestly — it is the only
            sustainable path.
          </p>
        </section>

        <section>
          <h2>Platforms not available in India</h2>
          <p>
            <Link href="/ai-gigs/dataannotation-tech">DataAnnotation.tech</Link>{" "}
            restricts signups to US, UK, Canada, Australia, and New Zealand. If
            you are in India, do not attempt workaround signups — use India-open
            alternatives instead:
          </p>
          <ul>
            <li>
              <Link href="/ai-gigs/outlier-ai">Outlier AI</Link> — similar RLHF
              pay tier, India accepted
            </li>
            <li>
              <Link href="/ai-gigs/alignerr">Alignerr</Link> — reasoning and
              evaluation focus
            </li>
            <li>
              <Link href="/ai-gigs/appen">Appen</Link> — broader annotation
              catalog
            </li>
          </ul>
        </section>
      </article>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/ai-gigs?indiaOnly=true">Browse India AI gigs</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/ai-gigs/compare/outlier-vs-appen-vs-telus">
            Compare Outlier vs Appen vs TELUS
          </Link>
        </Button>
      </div>
    </div>
  );
}
