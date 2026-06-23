import { JobCard } from "@/components/job-card";
import { fetchJobs } from "@/lib/data";
import { notFound } from "next/navigation";

export const revalidate = 3600;

const VALID = ["engineering", "design", "marketing", "sales", "support", "writing", "product"];

export default async function CategoryPage({ params }: { params: { cat: string } }) {
  if (!VALID.includes(params.cat)) notFound();
  const data = await fetchJobs({ category: params.cat, limit: "50" });
  const jobs = data?.jobs ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold capitalize">Remote {params.cat} jobs</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
