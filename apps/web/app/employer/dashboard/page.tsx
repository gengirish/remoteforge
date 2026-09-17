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
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{employer.companyName}</h1>
            <p className="text-sm text-gray-500">
              {isStarter ? (
                <span className="text-indigo-600 font-medium">Starter plan</span>
              ) : (
                "Free plan"
              )}
              {employer.indiaBadge && (
                <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  India-Friendly ✓
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/employer/jobs/new"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              + Post a Job
            </Link>
            {!isStarter && (
              <Link
                href="/employer/talent-report"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Upgrade for Talent Report →
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="text-3xl font-bold text-gray-900">{employer.jobs.length}</div>
            <div className="mt-1 text-sm text-gray-500">Active Jobs</div>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="text-3xl font-bold text-gray-900">
              {isStarter ? "Unlimited" : "1"}
            </div>
            <div className="mt-1 text-sm text-gray-500">Job Slots</div>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="text-3xl font-bold text-gray-900">
              {employer.subscription
                ? new Date(employer.subscription.expiresAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })
                : "—"}
            </div>
            <div className="mt-1 text-sm text-gray-500">Plan renews</div>
          </div>
        </div>

        {/* Active Jobs */}
        <div className="rounded-2xl bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Your job postings</h2>
          </div>
          {employer.jobs.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No jobs yet.{" "}
              <Link href="/employer/jobs/new" className="text-indigo-600 hover:underline">
                Post your first job →
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {employer.jobs.map((job) => (
                <li key={job.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{job.title}</div>
                    <div className="text-xs text-gray-400">
                      Posted {new Date(job.postedAt).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      job.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
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
          <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
            <h3 className="mb-1 font-semibold text-gray-900">
              Upgrade to Starter — ₹2,999/month
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              Unlimited job postings + Talent Intelligence report with skill demand data
              and salary benchmarks for India.
            </p>
            <Link
              href="/employer/talent-report"
              className="inline-block rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              View Talent Report + Upgrade →
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
