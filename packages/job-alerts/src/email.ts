import { AgentMailClient, AgentMailError, AgentMailTimeoutError } from "agentmail";

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

type SendResult = { ok: boolean; error?: string };

// Built lazily so the API boots (and typechecks) without AgentMail configured;
// sends then fail soft with a structured error instead of throwing.
let client: AgentMailClient | null = null;

function getClient(): AgentMailClient | null {
  if (client) return client;
  const apiKey = process.env.AGENTMAIL_API_KEY?.trim();
  if (!apiKey) return null;
  client = new AgentMailClient({ apiKey });
  return client;
}

function describeError(err: unknown): string {
  if (err instanceof AgentMailTimeoutError) return "AgentMail timeout";
  if (err instanceof AgentMailError) {
    return `AgentMail API error${err.statusCode ? ` ${err.statusCode}` : ""}: ${err.message}`;
  }
  return err instanceof Error ? err.message : String(err);
}

async function sendEmail(to: string, subject: string, text: string): Promise<SendResult> {
  const am = getClient();
  if (!am) return { ok: false, error: "AGENTMAIL_API_KEY not configured" };

  const inboxId = process.env.AGENTMAIL_INBOX_ID?.trim();
  if (!inboxId) return { ok: false, error: "AGENTMAIL_INBOX_ID not configured" };

  try {
    await am.inboxes.messages.send(inboxId, { to, subject, text });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: describeError(err) };
  }
}

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://remoteforge.intelliforge.tech";
}

export async function sendJobDigestEmail(to: string, jobs: DigestJob[]): Promise<SendResult> {
  const jobList = jobs
    .map((j) => `• ${j.title} at ${j.company} — ${appUrl()}/jobs/${j.slug}`)
    .join("\n");

  return sendEmail(
    to,
    `${jobs.length} new remote jobs for you`,
    `Your weekly remote job digest:\n\n${jobList}\n\n— RemoteForge`,
  );
}

export async function sendGigDigestEmail(to: string, gigs: DigestGig[]): Promise<SendResult> {
  const gigList = gigs.map((g) => `• ${g.name} — ${appUrl()}/ai-gigs/${g.slug}`).join("\n");

  return sendEmail(
    to,
    `${gigs.length} AI gig platforms worth checking`,
    `Your weekly AI gig digest:\n\n${gigList}\n\n— RemoteForge`,
  );
}
