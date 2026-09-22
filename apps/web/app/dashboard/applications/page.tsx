import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { fetchUserApplications } from "@/lib/data";

export const metadata = { title: "My Applications | RemoteForge" };
export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  applied: "bg-blue-100 dark:bg-blue-500/15 text-blue-800 dark:text-blue-300",
  interviewing: "bg-purple-100 dark:bg-purple-500/15 text-purple-800 dark:text-purple-300",
  offered: "bg-green-100 dark:bg-green-500/15 text-green-800 dark:text-green-300",
  rejected: "bg-red-100 dark:bg-red-500/15 text-red-800 dark:text-red-300",
  ghosted: "bg-muted text-muted-foreground",
};

export default async function ApplicationsPage() {
  const { userId, getToken } = await auth();
  if (!userId) redirect("/sign-in");

  const data = await fetchUserApplications(await getToken());
  const applications = data?.applications ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">My Applications</h1>
      <p className="mt-2 text-muted-foreground">
        Track your remote job applications and outcomes.
      </p>

      {applications.length === 0 ? (
        <div className="mt-8 rounded-xl border border-border p-8 text-center">
          <p className="text-muted-foreground">No applications tracked yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Apply to a job and click &ldquo;+ Track this application&rdquo; to get started.
          </p>
          <Link
            href="/jobs"
            className="mt-4 inline-block text-sm text-primary hover:underline"
          >
            Browse remote jobs →
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {applications.map((app) => (
            <div key={app.id} className="rounded-xl border border-border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link
                    href={`/jobs/${app.job.slug}`}
                    className="font-medium hover:text-primary hover:underline"
                  >
                    {app.job.title}
                  </Link>
                  <p className="mt-0.5 text-sm text-muted-foreground">{app.company}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[app.status] ?? "bg-muted text-muted-foreground"}`}
                >
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Applied {new Date(app.appliedAt).toLocaleDateString("en-IN")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
