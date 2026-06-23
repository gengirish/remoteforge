import { auth } from "@clerk/nextjs/server";
import { EmailCapture } from "@/components/email-capture";
import { fetchHomeData, fetchRecommendedJobs } from "@/lib/data";
import { LandingTabs } from "./landing-tabs";

export const revalidate = 3600;

export default async function HomePage() {
  let userId: string | undefined;
  try {
    const session = await auth();
    userId = session.userId ?? undefined;
  } catch {
    // Clerk not configured — skip personalization
  }

  const [homeData, recommended] = await Promise.all([
    fetchHomeData(),
    fetchRecommendedJobs(userId),
  ]);

  const stats = {
    jobCount: homeData?.jobCount ?? 0,
    gigCount: homeData?.gigCount ?? 0,
    indiaGigCount: homeData?.indiaGigCount ?? 0,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          India&apos;s home for{" "}
          <span className="text-primary">remote jobs</span> and{" "}
          <span className="text-primary">AI gig work</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Compare pay, India eligibility, and onboarding time — then apply with
          referral links that actually work.
        </p>
        <div className="mt-6 inline-flex rounded-full bg-muted px-4 py-2 text-sm font-medium">
          {stats.jobCount.toLocaleString()} remote jobs · {stats.gigCount} AI
          platforms · {stats.indiaGigCount} India-eligible
        </div>
      </section>
      <LandingTabs
        jobs={homeData?.jobs ?? []}
        gigs={homeData?.gigs ?? []}
        recommendedJobs={recommended?.personalized ? recommended.jobs : undefined}
      />
      <section className="mt-16">
        <EmailCapture />
      </section>
    </div>
  );
}
