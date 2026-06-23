import { EmailCapture } from "@/components/email-capture";
import { LandingTabs } from "./landing-tabs";
import { fetchHomeData } from "@/lib/data";

export const revalidate = 3600;

export default async function HomePage() {
  const data = await fetchHomeData();
  const stats = {
    jobCount: data?.jobCount ?? 0,
    gigCount: data?.gigCount ?? 0,
    indiaGigCount: data?.indiaGigCount ?? 0,
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
      <LandingTabs jobs={data?.jobs ?? []} gigs={data?.gigs ?? []} />
      <section className="mt-16">
        <EmailCapture />
      </section>
    </div>
  );
}
