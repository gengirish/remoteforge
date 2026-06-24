import Link from "next/link";
import { Briefcase, Globe, Sparkles } from "lucide-react";
import { EmailCapture } from "@/components/email-capture";
import { Button } from "@/components/ui/button";
import { LandingTabs } from "./landing-tabs";
import { fetchHomeData, fetchIncomeReport } from "@/lib/data";

export const revalidate = 3600;

export default async function HomePage() {
  const [data, report] = await Promise.all([fetchHomeData(), fetchIncomeReport()]);
  const stats = {
    jobCount: data?.jobCount ?? 0,
    gigCount: data?.gigCount ?? 0,
    indiaGigCount: data?.indiaGigCount ?? 0,
  };

  return (
    <>
      <section className="hero-gradient border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="animate-fade-up text-sm font-semibold uppercase tracking-wider text-primary">
              Built for India&apos;s remote workforce
            </p>
            <h1 className="animate-fade-up mt-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl [animation-delay:80ms]">
              Find remote jobs &amp; AI gigs that actually hire from{" "}
              <span className="text-primary">India</span>
            </h1>
            <p className="animate-fade-up mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground [animation-delay:160ms]">
              Compare pay ranges, India eligibility, and onboarding timelines —
              then apply with referral links that work.
            </p>

            <div className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-3 [animation-delay:240ms]">
              <Button asChild size="lg">
                <Link href="/jobs">Browse remote jobs</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/ai-gigs">Compare AI platforms</Link>
              </Button>
            </div>

            <div className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-3 [animation-delay:320ms]">
              <span className="stat-pill">
                <Briefcase className="h-4 w-4 text-primary" />
                {stats.jobCount.toLocaleString()} remote jobs
              </span>
              <span className="stat-pill">
                <Sparkles className="h-4 w-4 text-accent" />
                {stats.gigCount} AI platforms
              </span>
              <span className="stat-pill">
                <Globe className="h-4 w-4 text-emerald-600" />
                {stats.indiaGigCount} India-eligible
              </span>
            </div>

            {report && (report.dataPoints.salaryReports > 0 || report.dataPoints.applications > 0 || report.dataPoints.gigReports > 0) && (
              <div className="animate-fade-up mt-4 flex flex-wrap items-center justify-center gap-3 [animation-delay:400ms]">
                {report.dataPoints.salaryReports > 0 && (
                  <Link href="/salary" className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground hover:text-foreground">
                    {report.dataPoints.salaryReports} salary reports
                  </Link>
                )}
                {report.dataPoints.applications > 0 && (
                  <Link href="/dashboard/applications" className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground hover:text-foreground">
                    {report.dataPoints.applications} applications tracked
                  </Link>
                )}
                {report.dataPoints.gigReports > 0 && (
                  <Link href="/community/income-report" className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground hover:text-foreground">
                    {report.dataPoints.gigReports} gig income reports
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12">
        <LandingTabs jobs={data?.jobs ?? []} gigs={data?.gigs ?? []} />
        <section className="mt-20">
          <EmailCapture />
        </section>
      </div>
    </>
  );
}
