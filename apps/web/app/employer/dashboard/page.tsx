import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { fetchEmployerProfile } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function EmployerDashboardPage() {
  const { userId, getToken } = await auth();
  if (!userId) redirect("/employer/onboard");

  const employer = await fetchEmployerProfile(await getToken());
  if (!employer) redirect("/employer/onboard");

  const isStarter = employer.subscriptionTier === "starter";

  return (
    <main className="min-h-screen bg-muted/50 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{employer.companyName}</h1>
            <p className="text-sm text-muted-foreground">
              {isStarter ? (
                <span className="text-primary font-medium">Starter plan</span>
              ) : (
                "Free plan"
              )}
              {employer.indiaBadge && (
                <span className="ml-2 rounded-full bg-green-100 dark:bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-300">
                  India-Friendly ✓
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/employer/jobs/new"
              className="btn-brand rounded-full px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              + Post a Job
            </Link>
            {!isStarter && (
              <Link
                href="/employer/talent-report"
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted/50"
              >
                Upgrade for Talent Report →
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-card p-6 shadow-sm">
            <div className="text-3xl font-bold text-foreground">{employer.jobs.length}</div>
            <div className="mt-1 text-sm text-muted-foreground">Active Jobs</div>
          </div>
          <div className="rounded-xl bg-card p-6 shadow-sm">
            <div className="text-3xl font-bold text-foreground">
              {isStarter ? "Unlimited" : "1"}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">Job Slots</div>
          </div>
          <div className="rounded-xl bg-card p-6 shadow-sm">
            <div className="text-3xl font-bold text-foreground">
              {employer.subscription
                ? new Date(employer.subscription.expiresAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })
                : "—"}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">Plan renews</div>
          </div>
        </div>

        {/* Active Jobs */}
        <div className="rounded-2xl bg-card shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-semibold text-foreground">Your job postings</h2>
          </div>
          {employer.jobs.length === 0 ? (
            <div className="px-6 py-12 text-center text-muted-foreground">
              No jobs yet.{" "}
              <Link href="/employer/jobs/new" className="text-primary hover:underline">
                Post your first job →
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {employer.jobs.map((job) => (
                <li key={job.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <div className="font-medium text-foreground">{job.title}</div>
                    <div className="text-xs text-muted-foreground">
                      Posted {new Date(job.postedAt).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      job.isActive
                        ? "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-300"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {job.isActive ? "Active" : "Closed"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Upgrade CTA */}
        {!isStarter && (
          <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/10 p-6">
            <h3 className="mb-1 font-semibold text-foreground">
              Upgrade to Starter — ₹2,999/month
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Unlimited job postings + Talent Intelligence report with skill demand data
              and salary benchmarks for India.
            </p>
            <Link
              href="/employer/talent-report"
              className="inline-block btn-brand rounded-full px-5 py-2 text-sm font-semibold text-primary-foreground"
            >
              View Talent Report + Upgrade →
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
