import type { Job } from "@intelliforge/db";

const VETTD_URL =
  process.env.NEXT_PUBLIC_VETTD_URL ?? "https://www.vettd-app.com";

interface VettdUpsellBannerProps {
  job: Pick<Job, "title">;
}

export function EmployerUpsellBanner({ job }: VettdUpsellBannerProps) {
  const signupLink =
    `${VETTD_URL}/signup?` +
    new URLSearchParams({
      ref: "remoteforge",
      job_title: job.title,
      utm_source: "remoteforge",
      utm_medium: "job_banner",
    }).toString();

  return (
    <aside className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm font-medium text-amber-900">
        Hiring for this role? Screen 200 applicants in 45 minutes.
      </p>
      <a
        href={signupLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-sm font-medium text-amber-800 hover:underline"
      >
        Start screening with Vettd →
      </a>
    </aside>
  );
}
