import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, CircleOff } from "lucide-react";
import { ApplyTrackButton } from "@/components/apply-track-button";
import { auth } from "@clerk/nextjs/server";
import { isClerkEnabled } from "@/lib/clerk-config";
import { EmployerUpsellBanner } from "@/components/employer-upsell-banner";
import { FeaturedCheckout } from "@/components/featured-checkout";
import { IndiaBadge } from "@/components/india-badge";
import { ScoreResumeCTA } from "@/components/job-card-cta";
import { SalaryBadge } from "@/components/salary-badge";
import { Button } from "@/components/ui/button";
import { CoverLetterGenerator } from "@/components/cover-letter-generator";
import { fetchJobBySlug, fetchJobSlugs } from "@/lib/data";
import { fetchUsdToInrRate } from "@/lib/currency";
import { apiGoUrl, getPublicApiUrl } from "@/lib/api-url";
import { jobDescriptionHtml, jobDescriptionText } from "@/lib/job-description";
import { jobJsonLd, jobMetadata } from "@/lib/seo";

interface JobDetailPageProps {
  params: { slug: string };
}

// Slugs come from active jobs only; expired jobs are still rendered on demand.
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await fetchJobSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: JobDetailPageProps) {
  const job = await fetchJobBySlug(params.slug);
  if (!job) return { title: "Job not found" };
  const metadata = jobMetadata(job);
  return job.isActive ? metadata : { ...metadata, robots: { index: false } };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const [job, inrRate] = await Promise.all([
    fetchJobBySlug(params.slug),
    fetchUsdToInrRate(),
  ]);
  if (!job) notFound();

  const isClosed = !job.isActive;
  // No JobPosting structured data for expired jobs.
  const jsonLd = isClosed ? null : jobJsonLd(job);
  const applyUrl = apiGoUrl(job.id, { type: "job", clickType: "apply" });
  const initial = job.company.charAt(0).toUpperCase();

  let isPremium = false;
  let userSkills: string[] = [];
  let userExperience = 0;
  try {
    if (isClerkEnabled) {
      const { userId, getToken } = await auth();
      if (userId) {
        const token = await getToken();
        const [premiumRes, profileRes] = await Promise.all([
          fetch(`${process.env.API_URL}/api/premium/status`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          }),
          fetch(`${process.env.API_URL}/api/user/profile`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          }),
        ]);
        if (premiumRes.ok) {
          const pd = (await premiumRes.json()) as { data: { isPremium: boolean } };
          isPremium = pd.data?.isPremium ?? false;
        }
        if (profileRes.ok) {
          const prof = (await profileRes.json()) as {
            data: { skills: string[]; yearsExperience: number };
          };
          userSkills = prof.data?.skills ?? [];
          userExperience = prof.data?.yearsExperience ?? 0;
        }
      }
    }
  } catch {
    // Clerk unavailable — skip personalization
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to jobs
      </Link>

      {isClosed && (
        <div
          role="status"
          className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-muted px-4 py-3 text-sm"
        >
          <CircleOff className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="font-medium">This job is no longer accepting applications</p>
            <p className="mt-0.5 text-muted-foreground">
              It has been removed from its original job board.{" "}
              <Link href="/jobs" className="text-primary hover:underline">
                Browse current remote jobs
              </Link>
            </p>
          </div>
        </div>
      )}

      <article className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-gradient-to-r from-primary/5 to-accent/5 px-6 py-8 sm:px-8">
          <div className="flex items-start gap-4">
            {job.companyLogo ? (
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border">
                <Image
                  src={job.companyLogo}
                  alt=""
                  fill
                  className="object-contain p-1.5"
                  sizes="56px"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground shadow-sm">
                {initial}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold sm:text-3xl">{job.title}</h1>
                  <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    {job.company}
                  </p>
                </div>
                <IndiaBadge accepted={job.indiaFriendly} />
              </div>
              <div className="mt-4">
                <SalaryBadge
                  salaryMin={job.salaryMin}
                  salaryMax={job.salaryMax}
                  inrRate={inrRate}
                />
              </div>
              {job.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {job.tags.map((tag: string) => (
                    <Link
                      key={tag}
                      href={"/jobs/tag/" + tag}
                      className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-8 sm:px-8">
          <div className="prose prose-sm max-w-none prose-headings:font-display prose-a:text-primary">
            <div dangerouslySetInnerHTML={{ __html: jobDescriptionHtml(job.description) }} />
          </div>

          {isClosed ? (
            <div className="mt-8 border-t border-border pt-8">
              <Button disabled className="w-full sm:w-auto">
                Applications closed
              </Button>
            </div>
          ) : (
            <>
              <div className="mt-8 flex flex-col gap-4 border-t border-border pt-8">
                <ApplyTrackButton
                  jobId={job.id}
                  applyUrl={applyUrl}
                  apiUrl={getPublicApiUrl()}
                />
                <ScoreResumeCTA job={job} />
              </div>

              <div className="mt-6">
                <CoverLetterGenerator
                  jobTitle={job.title}
                  company={job.company}
                  jobDescription={jobDescriptionText(job.description, 1000)}
                  userSkills={userSkills}
                  userExperience={userExperience}
                  isPremium={isPremium}
                />
              </div>
            </>
          )}
        </div>
      </article>

      {!isClosed && (
        <div className="mt-8">
          <FeaturedCheckout jobId={job.id} jobTitle={job.title} />
        </div>
      )}
      {job.isFeatured && (
        <div className="mt-8">
          <EmployerUpsellBanner job={job} />
        </div>
      )}
    </div>
  );
}
