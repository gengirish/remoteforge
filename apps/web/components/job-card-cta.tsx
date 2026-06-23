"use client";

import type { Job } from "@intelliforge/db";

const FORGEAHEAD_URL =
  process.env.NEXT_PUBLIC_FORGEAHEAD_URL ??
  "https://forgeahead.intelliforge.tech";

interface ScoreResumeCTAProps {
  job: Pick<Job, "slug" | "title" | "company">;
}

export function ScoreResumeCTA({ job }: ScoreResumeCTAProps) {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://remoteforge.in";

  const deepLink =
    `${FORGEAHEAD_URL}/resume/score?` +
    new URLSearchParams({
      jd_url: `${appUrl}/jobs/${job.slug}`,
      jd_title: job.title,
      jd_company: job.company,
      utm_source: "remoteforge",
      utm_medium: "job_page",
      utm_campaign: "jd_deeplink",
    }).toString();

  return (
    <a
      href={deepLink}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center text-sm font-medium text-primary hover:underline"
    >
      Score your resume against this JD →
    </a>
  );
}
