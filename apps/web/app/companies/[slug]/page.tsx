import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { fetchCompaniesHiringIndia, fetchCompanyBySlug } from "@/lib/data";

export const revalidate = 3600;

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const data = await fetchCompaniesHiringIndia();
  return (data?.companies ?? []).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const company = await fetchCompanyBySlug(params.slug);
  if (!company) return { title: "Company not found" };
  return {
    title: `Does ${company.name} hire from India? | RemoteForge`,
    description: `${company.name} has posted ${company.totalJobsPosted} remote jobs, ${company.indiaFriendlyCount} open to India (${Math.round((company.indiaAcceptRate ?? 0) * 100)}% India accept rate).`,
  };
}

export default async function CompanyPage({ params }: Props) {
  const company = await fetchCompanyBySlug(params.slug);
  if (!company) notFound();

  const rate = company.indiaAcceptRate ?? 0;
  const rateLabel = `${Math.round(rate * 100)}%`;
  const rateColor =
    rate >= 0.7 ? "text-green-600" : rate >= 0.4 ? "text-yellow-600" : "text-red-500";
  const verdict =
    rate >= 0.7
      ? "Very India-friendly"
      : rate >= 0.4
        ? "Moderately India-friendly"
        : "Rarely hires from India";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/companies/hiring-from-india"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Companies hiring from India
      </Link>

      <div className="mt-6">
        <h1 className="text-3xl font-bold">{company.name}</h1>
        <p className={`mt-2 text-lg font-medium ${rateColor}`}>{verdict}</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="India Accept Rate" value={rateLabel} valueClass={rateColor} />
        <StatCard label="Total Remote Jobs" value={company.totalJobsPosted.toString()} />
        <StatCard label="India-Eligible Jobs" value={company.indiaFriendlyCount.toString()} />
      </div>

      {company.avgResponseDays !== null && (
        <div className="mt-4">
          <StatCard
            label="Avg. Response Time"
            value={`${Math.round(company.avgResponseDays)} days`}
            note="Based on community-reported applications"
          />
        </div>
      )}

      <div className="mt-8 rounded-xl border border-border bg-muted/30 p-5">
        <h2 className="font-semibold">What does India Accept Rate mean?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          India Accept Rate = India-eligible remote jobs ÷ total remote jobs posted by{" "}
          {company.name}. A rate above 70% means most of their remote roles are open to
          India-based applicants. This is derived from live job listings — not
          employer-reported data.
        </p>
      </div>

      <div className="mt-8">
        <Link
          href={`/jobs?search=${encodeURIComponent(company.name)}&indiaOnly=true`}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          View {company.name} jobs open to India →
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  valueClass,
  note,
}: {
  label: string;
  value: string;
  valueClass?: string;
  note?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${valueClass ?? ""}`}>{value}</p>
      {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}
