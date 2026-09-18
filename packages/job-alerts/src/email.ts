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

async function sendEmail(
  to: string,
  subject: string,
  text: string,
  unsubscribeUrl?: string,
): Promise<SendResult> {
  const am = getClient();
  if (!am) return { ok: false, error: "AGENTMAIL_API_KEY not configured" };

  const inboxId = process.env.AGENTMAIL_INBOX_ID?.trim();
  if (!inboxId) return { ok: false, error: "AGENTMAIL_INBOX_ID not configured" };

  try {
    const body = unsubscribeUrl ? `${text}\n\nUnsubscribe: ${unsubscribeUrl}` : text;
    // RFC 8058 one-click: Gmail/Yahoo POST to the URL directly from their UI.
    const headers = unsubscribeUrl
      ? { "List-Unsubscribe": `<${unsubscribeUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" }
      : undefined;
    await am.inboxes.messages.send(inboxId, { to, subject, text: body, headers });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: describeError(err) };
  }
}

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://remoteforge.intelliforge.tech";
}

export async function sendJobDigestEmail(
  to: string,
  jobs: DigestJob[],
  unsubscribeUrl?: string,
): Promise<SendResult> {
  const jobList = jobs
    .map((j) => `• ${j.title} at ${j.company} — ${appUrl()}/jobs/${j.slug}`)
    .join("\n");

  return sendEmail(
    to,
    `${jobs.length} new remote jobs for you`,
    `Your weekly remote job digest:\n\n${jobList}\n\n— RemoteForge`,
    unsubscribeUrl,
  );
}

export type SignupIntent =
  | { kind: "approval-alert"; platformName?: string }
  | { kind: "prep-waitlist"; platformName?: string }
  | { kind: "digest" };

export async function sendSignupConfirmationEmail(
  to: string,
  intent: SignupIntent,
  unsubscribeUrl?: string,
): Promise<SendResult> {
  let subject: string;
  let intro: string;
  if (intent.kind === "approval-alert") {
    const target = intent.platformName ?? "an AI training platform";
    subject = `You'll hear when ${intent.platformName ?? "a platform"} opens onboarding for India`;
    intro = `Thanks for signing up. We'll email you as soon as ${target} opens onboarding to applicants from India.`;
  } else if (intent.kind === "prep-waitlist") {
    const pack = intent.platformName ? `${intent.platformName} assessment prep pack` : "assessment prep packs";
    subject = `You're on the waitlist for the ${pack}`;
    intro = `Thanks for joining the waitlist. We'll email you when the ${pack} ${intent.platformName ? "is" : "are"} ready, before anyone else hears about ${intent.platformName ? "it" : "them"}.`;
  } else {
    subject = "You're subscribed to RemoteForge";
    intro = "Thanks for subscribing. Your first digest of remote jobs and AI gig platforms open to India arrives on Monday.";
  }

  return sendEmail(
    to,
    subject,
    `${intro}\n\nIn the meantime, browse AI gig platforms open to India: ${appUrl()}/ai-gigs\n\n— RemoteForge`,
    unsubscribeUrl,
  );
}

export async function sendGigDigestEmail(
  to: string,
  gigs: DigestGig[],
  unsubscribeUrl?: string,
): Promise<SendResult> {
  const gigList = gigs.map((g) => `• ${g.name} — ${appUrl()}/ai-gigs/${g.slug}`).join("\n");

  return sendEmail(
    to,
    `${gigs.length} AI gig platforms worth checking`,
    `Your weekly AI gig digest:\n\n${gigList}\n\n— RemoteForge`,
    unsubscribeUrl,
  );
}
