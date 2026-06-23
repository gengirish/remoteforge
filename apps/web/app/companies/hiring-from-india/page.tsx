import type { Metadata } from "next";
import Link from "next/link";
import { fetchCompaniesHiringIndia } from "@/lib/data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Companies Hiring Remotely from India | RemoteForge",
  description:
    "Discover which companies actively hire remote workers from India. See India eligibility rates, total remote jobs posted, and which employers welcome India-based applicants.",
};

export default async function CompaniesHiringFromIndiaPage() {
  const data = await fetchCompaniesHiringIndia();
  const companies = data?.companies ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Companies Hiring Remotely from India</h1>
        <p className="mt-2 text-muted-foreground">
          Ranked by India-eligible job count. Data is derived from live job
          listings across Remotive, We Work Remotely, and RemoteOK.
        </p>
      </div>

      {companies.length === 0 ? (
        <p className="text-muted-foreground">
          No company data yet — run the job ingestion to populate this page.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">#</th>
                <th className="pb-3 pr-4 font-medium">Company</th>
                <th className="pb-3 pr-4 font-medium text-right">Total Remote Jobs</th>
                <th className="pb-3 pr-4 font-medium text-right">India-Eligible</th>
                <th className="pb-3 font-medium text-right">India Accept Rate</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company, i) => {
                const rate = company.indiaAcceptRate ?? 0;
                const rateLabel = `${Math.round(rate * 100)}%`;
                const rateColor =
                  rate >= 0.7
                    ? "text-green-600"
                    : rate >= 0.4
                      ? "text-yellow-600"
                      : "text-red-500";

                return (
                  <tr key={company.id} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="py-3 pr-4 text-muted-foreground">{i + 1}</td>
                    <td className="py-3 pr-4">
                      <Link
                        href={`/jobs?search=${encodeURIComponent(company.name)}&indiaOnly=true`}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {company.name}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums">
                      {company.totalJobsPosted}
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums">
                      {company.indiaFriendlyCount}
                    </td>
                    <td className={`py-3 text-right font-semibold tabular-nums ${rateColor}`}>
                      {rateLabel}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 text-xs text-muted-foreground">
        India eligibility is determined by the absence of location restrictions in each job listing.
        Accept rate = India-eligible jobs / total remote jobs posted by that company.
      </p>
    </div>
  );
}
