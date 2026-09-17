import Link from "next/link";
import { BellRing, Briefcase, ClipboardCheck, Globe, Search, Sparkles } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { EmailCapture } from "@/components/email-capture";
import { Button } from "@/components/ui/button";
import { fetchHomeData, fetchRecommendedJobs, fetchIncomeReport } from "@/lib/data";
import { fetchUsdToInrRate } from "@/lib/currency";
import { LandingTabs } from "./landing-tabs";
import { ReferralCapture } from "@/components/referral-capture";

export const revalidate = 3600;

const STEPS = [
  {
    icon: Search,
    title: "Pick a platform that takes you",
    body: "India eligibility, real pay bands, and payout methods side by side, so you skip platforms that geo-block Indians.",
  },
  {
    icon: ClipboardCheck,
    title: "Pass the assessment",
    body: "Approval guides for each platform: what the qualification tests check, common rejection reasons, and how long review takes.",
  },
  {
    icon: BellRing,
    title: "Keep getting tasks",
    body: "Alerts when onboarding reopens or pay changes, so you are not stuck waiting on one platform with an empty queue.",
  },
] as const;

export default async function HomePage() {
  let token: string | null = null;
  try {
    const session = await auth();
    token = session.userId ? await session.getToken() : null;
  } catch {
    // Clerk not configured — skip personalization
  }

  const [homeData, recommended, report, inrRate] = await Promise.all([
    fetchHomeData(),
    fetchRecommendedJobs(token),
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
              For Indians breaking into AI training work
            </p>
            <h1 className="animate-fade-up mt-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl [animation-delay:80ms]">
              Get approved on AI training platforms{" "}
              <span className="text-primary">from India</span>
            </h1>
            <p className="animate-fade-up mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground [animation-delay:160ms]">
              Which platforms actually accept Indians, what they pay, how long approval
              takes, and how to pass the assessment — before you lose weeks on the wrong one.
            </p>

            <div className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-3 [animation-delay:240ms]">
              <Button asChild size="lg">
                <Link href="/ai-gigs">Find platforms that accept India</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/guides/ai-gigs-india-starter">Read the approval guide</Link>
              </Button>
            </div>

            <div className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-3 [animation-delay:320ms]">
              <span className="stat-pill">
                <Sparkles className="h-4 w-4 text-accent" />
                {stats.gigCount} AI platforms reviewed
              </span>
              <span className="stat-pill">
                <Globe className="h-4 w-4 text-emerald-600" />
                {stats.indiaGigCount} accept India
              </span>
              <Link href="/jobs" className="stat-pill hover:text-foreground">
                <Briefcase className="h-4 w-4 text-primary" />
                Also: remote jobs that hire from India
              </Link>
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

      <section className="mx-auto max-w-6xl px-4 pt-14">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          From &ldquo;which platform?&rdquo; to your first paid task
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="rounded-xl border border-border bg-card p-6">
              <step.icon className="h-5 w-5 text-primary" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Step {i + 1}
              </p>
              <h3 className="mt-1 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12">
        <section>
          <EmailCapture
            title="Know when a platform opens onboarding for Indians"
            description="Onboarding windows open and close without notice. We send an alert when a platform starts accepting Indian applicants for your skills, or changes its pay."
            submitLabel="Get approval alerts"
            source="home-approval-alerts"
            defaultJobAlerts={false}
            defaultGigAlerts
          />
        </section>

        <LandingTabs
          jobs={homeData?.jobs ?? []}
          gigs={homeData?.gigs ?? []}
          recommendedJobs={recommended?.personalized ? recommended.jobs : undefined}
          inrRate={inrRate}
        />
        <section className="mt-20">
          <EmailCapture
            title="Assessment prep packs — join the waitlist"
            description="Practice tasks, rubric walkthroughs, and an application review for Outlier, Mercor, and Alignerr, from hands-on RLHF work. Prep, not leaked answers. Planned ₹499–₹1,499 per platform; waitlist gets launch pricing."
            submitLabel="Join the prep waitlist"
            source="prep-waitlist"
            defaultJobAlerts={false}
            defaultGigAlerts
          />
        </section>
      </div>
    </>
  );
}
