import Link from "next/link";
import { Briefcase, Globe, Sparkles } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { EmailCapture } from "@/components/email-capture";
import { Button } from "@/components/ui/button";
import { fetchHomeData, fetchRecommendedJobs, fetchIncomeReport } from "@/lib/data";
import { fetchUsdToInrRate } from "@/lib/currency";
import { LandingTabs } from "./landing-tabs";
import { ReferralCapture } from "@/components/referral-capture";

export const revalidate = 3600;

export default async function HomePage() {
  let userId: string | undefined;
  try {
    const session = await auth();
    userId = session.userId ?? undefined;
  } catch {
    // Clerk not configured — skip personalization
  }

  const [homeData, recommended, report, inrRate] = await Promise.all([
    fetchHomeData(),
    fetchRecommendedJobs(userId),
    fetchIncomeReport(),
    fetchUsdToInrRate(),
  ]);


  const stats = {
    jobCount: homeData?.jobCount ?? 0,
    gigCount: homeData?.gigCount ?? 0,
    indiaGigCount: homeData?.indiaGigCount ?? 0,
  };

  return (
    <>
      <ReferralCapture apiUrl={process.env.NEXT_PUBLIC_API_URL ?? ""} />
      <section className="hero-gradient border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="animate-fade-up text-sm font-semibold uppercase tracking-wider text-primary">
              Built for India&apos;s remote workforce
            </p>
            <h1 className="animate-fade-up mt-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl [animation-delay:80ms]">
              Compare AI gigs that pay Indians{" "}
              <span className="text-primary">$20–40/hr</span>
            </h1>
            <p className="animate-fade-up mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground [animation-delay:160ms]">
              Pay, India eligibility, and onboarding time — pick the right platform
              first try. Plus remote jobs filtered for India.
            </p>

            <div className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-3 [animation-delay:240ms]">
              <Button asChild size="lg">
                <Link href="/ai-gigs">Compare AI platforms</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/jobs">Browse remote jobs</Link>
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
        <LandingTabs
          jobs={homeData?.jobs ?? []}
          gigs={homeData?.gigs ?? []}
          recommendedJobs={recommended?.personalized ? recommended.jobs : undefined}
          inrRate={inrRate}
        />
        <section className="mt-20">
          <EmailCapture />
        </section>
      </div>
    </>
  );
}
