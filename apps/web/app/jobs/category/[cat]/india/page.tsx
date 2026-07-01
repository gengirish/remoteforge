import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JobCard } from "@/components/job-card";
import { fetchJobs } from "@/lib/data";
import { fetchUsdToInrRate } from "@/lib/currency";

export const revalidate = 3600;

const VALID = [
  "engineering",
  "design",
  "marketing",
  "sales",
  "support",
  "writing",
  "product",
];

export function generateStaticParams() {
  return VALID.map((cat) => ({ cat }));
}

export function generateMetadata({
  params,
}: {
  params: { cat: string };
}): Metadata {
  const cat = params.cat;
  return {
    title: `India-eligible ${cat} remote jobs 2026 | RemoteForge`,
    description: `Browse remote ${cat} jobs open to India-based applicants. Compare pay, eligibility, and apply with one click.`,
    alternates: {
      canonical: `/jobs/category/${cat}/india`,
    },
  };
}

export default async function CategoryIndiaPage({
  params,
}: {
  params: { cat: string };
}) {
  if (!VALID.includes(params.cat)) notFound();

  const [data, inrRate] = await Promise.all([
    fetchJobs({
      category: params.cat,
      indiaOnly: "true",
      limit: "50",
    }),
    fetchUsdToInrRate(),
  ]);
  const jobs = data?.jobs ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold capitalize">
        India-eligible {params.cat} remote jobs
      </h1>
      <p className="mt-2 text-muted-foreground">
        {jobs.length} {params.cat} jobs open to India
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} inrRate={inrRate} />
        ))}
      </div>
    </div>
  );
}
