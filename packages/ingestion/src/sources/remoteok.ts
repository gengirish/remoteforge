import type { NormalizedJob } from "./remotive";

interface RemoteOkJob {
  id: string;
  slug: string;
  position: string;
  company: string;
  description: string;
  url: string;
  date: string;
  tags?: string[];
  salary_min?: number;
  salary_max?: number;
}

export async function fetchRemoteOkJobs(): Promise<NormalizedJob[]> {
  const res = await fetch("https://remoteok.com/api", {
    headers: {
      Accept: "application/json",
      "User-Agent": "RemoteForge/1.0 (job aggregator)",
    },
  });

  if (!res.ok) throw new Error(`RemoteOK API error: ${res.status}`);

  const data = (await res.json()) as RemoteOkJob[];
  const jobs = data.filter((j) => j.id && j.position);

  return jobs.map((job) => ({
    sourceBoard: "remoteok",
    sourceId: job.id,
    title: job.position,
    company: job.company,
    description: job.description ?? "",
    url: job.url ?? `https://remoteok.com/remote-jobs/${job.slug}`,
    postedAt: new Date(job.date),
    salary: {
      min: job.salary_min ? job.salary_min * 100 : undefined,
      max: job.salary_max ? job.salary_max * 100 : undefined,
    },
    tags: (job.tags ?? []).map((t) => t.toLowerCase()),
    category: "engineering",
  }));
}
