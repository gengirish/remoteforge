export interface DigestJob {
  title: string;
  company: string;
  slug: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
}

export interface DigestGig {
  name: string;
  slug: string;
  payMin: number;
  payMax: number;
  indiaAccepted: boolean;
}

export async function sendJobDigestEmail(
  to: string,
  jobs: DigestJob[],
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://remoteforge.in";
  const jobList = jobs
    .map(
      (j) =>
        `• ${j.title} at ${j.company} — ${appUrl}/jobs/${j.slug}`,
    )
    .join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "RemoteForge <alerts@remoteforge.in>",
      to,
      subject: `${jobs.length} new remote jobs for you`,
      text: `Your weekly remote job digest:\n\n${jobList}\n\n— RemoteForge`,
    }),
  });

  if (!res.ok) {
    return { ok: false, error: await res.text() };
  }
  return { ok: true };
}

export async function sendGigDigestEmail(
  to: string,
  gigs: DigestGig[],
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://remoteforge.in";
  const gigList = gigs
    .map((g) => `• ${g.name} — ${appUrl}/ai-gigs/${g.slug}`)
    .join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "RemoteForge <alerts@remoteforge.in>",
      to,
      subject: `${gigs.length} AI gig platforms worth checking`,
      text: `Your weekly AI gig digest:\n\n${gigList}\n\n— RemoteForge`,
    }),
  });

  if (!res.ok) {
    return { ok: false, error: await res.text() };
  }
  return { ok: true };
}
