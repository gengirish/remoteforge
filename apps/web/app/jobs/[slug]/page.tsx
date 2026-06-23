import Link from "next/link";
import { notFound } from "next/navigation";
import { EmployerUpsellBanner } from "@/components/employer-upsell-banner";
import { FeaturedCheckout } from "@/components/featured-checkout";
import { IndiaBadge } from "@/components/india-badge";
import { ScoreResumeCTA } from "@/components/job-card-cta";
import { SalaryBadge } from "@/components/salary-badge";
import { Button } from "@/components/ui/button";
import { fetchJobBySlug, fetchJobSlugs } from "@/lib/data";
import { apiGoUrl } from "@/lib/api-url";
import { jobJsonLd, jobMetadata } from "@/lib/seo";

interface JobDetailPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await fetchJobSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: JobDetailPageProps) {
  const job = await fetchJobBySlug(params.slug);
  if (!job) return { title: "Job not found" };
  return jobMetadata(job);
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const job = await fetchJobBySlug(params.slug);
  if (!job) notFound();

  const jsonLd = jobJsonLd(job);
  const applyUrl = apiGoUrl(job.id, { type: "job", clickType: "apply" });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{job.title}</h1>
          <p className="mt-1 text-lg text-muted-foreground">{job.company}</p>
        </div>
        <IndiaBadge accepted={job.indiaFriendly} />
      </div>
      <div className="mt-4">
        <SalaryBadge salaryMin={job.salaryMin} salaryMax={job.salaryMax} />
      </div>
      {job.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {job.tags.map((tag: string) => (
            <Link
              key={tag}
              href={`/jobs/tag/${tag}`}
              className="rounded-full bg-muted px-3 py-1 text-sm hover:bg-primary/10"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}
      <div className="prose prose-sm mt-8 max-w-none">
        <div dangerouslySetInnerHTML={{ __html: job.description }} />
      </div>
      <div className="mt-8 flex flex-col gap-4">
        <Button asChild size="lg" className="w-fit">
          <a href={applyUrl}>Apply to this job →</a>
        </Button>
        <ScoreResumeCTA job={job} />
      </div>
      <div className="mt-8">
        <FeaturedCheckout jobId={job.id} jobTitle={job.title} />
      </div>
      {job.isFeatured && (
        <div className="mt-8">
          <EmployerUpsellBanner job={job} />
        </div>
      )}
    </div>
  );
}
