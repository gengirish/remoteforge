export interface NormalizedJob {
  sourceBoard: string;
  sourceId: string;
  title: string;
  company: string;
  description: string;
  url: string;
  postedAt: Date;
  salary?: { min?: number; max?: number };
  tags: string[];
  category: string;
}

export async function fetchRemotiveJobs(): Promise<NormalizedJob[]> {
  const url = "https://remotive.com/api/remote-jobs?limit=100";
  let delay = 1000;

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
      continue;
    }

    if (!res.ok) {
      throw new Error(`Remotive API error: ${res.status}`);
    }

    const data = (await res.json()) as {
      jobs: Array<{
        id: number;
        title: string;
        company_name: string;
        description: string;
        url: string;
        publication_date: string;
        tags?: string;
        job_type?: string;
        category?: string;
        salary?: string;
      }>;
    };

    return data.jobs.map((job) => ({
      sourceBoard: "remotive",
      sourceId: String(job.id),
      title: job.title,
      company: job.company_name,
      description: job.description,
      url: job.url,
      postedAt: new Date(job.publication_date),
      tags: job.tags?.split(",").map((t) => t.trim().toLowerCase()) ?? [],
      category: mapCategory(job.category ?? job.job_type ?? "engineering"),
    }));
  }

  throw new Error("Remotive API rate limited after retries");
}

function mapCategory(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("design")) return "design";
  if (lower.includes("market")) return "marketing";
  if (lower.includes("sales")) return "sales";
  if (lower.includes("support")) return "support";
  if (lower.includes("writ")) return "writing";
  if (lower.includes("product")) return "product";
  return "engineering";
}
