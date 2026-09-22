import { AgentMailClient, AgentMailError, AgentMailTimeoutError } from "agentmail";
import { button, cleanText, heading, itemList, layout, paragraph, pill } from "./templates";

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

interface EmailContent {
  subject: string;
  text: string;
  html: string;
}

async function sendEmail(to: string, { subject, text, html }: EmailContent, unsubscribeUrl?: string): Promise<SendResult> {
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
    await am.inboxes.messages.send(inboxId, { to, subject, text: body, html, headers });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: describeError(err) };
  }
}

function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://remoteforge.intelliforge.tech").replace(/\/+$/, "");
}

const DIGEST_REASON = "You're receiving this because you subscribed to the RemoteForge weekly digest.";

/** Pay fields are USD cents per hour, as on the site's SalaryBadge. */
function formatPay(min?: number | null, max?: number | null): string | null {
  const fmt = (c: number) => `$${(c / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  if (min && max) return min === max ? `${fmt(min)}/hr` : `${fmt(min)}–${fmt(max)}/hr`;
  if (min) return `From ${fmt(min)}/hr`;
  if (max) return `Up to ${fmt(max)}/hr`;
  return null;
}

export async function sendJobDigestEmail(
  to: string,
  jobs: DigestJob[],
  unsubscribeUrl?: string,
): Promise<SendResult> {
  const base = appUrl();
  const items = jobs.map((j) => {
    const pay = formatPay(j.salaryMin, j.salaryMax);
    return {
      href: `${base}/jobs/${j.slug}`,
      title: cleanText(j.title),
      subtitle: cleanText(j.company),
      pay,
      meta: pay ? [pill(pay, "success")] : undefined,
    };
  });
  const count = `${jobs.length} new remote ${jobs.length === 1 ? "job" : "jobs"}`;

  const text = [
    `${count} that hire from India, picked for you this week.`,
    "",
    ...items.map((i) => `• ${i.title} at ${i.subtitle}${i.pay ? ` (${i.pay})` : ""}\n  ${i.href}`),
    "",
    `Browse all remote jobs: ${base}/jobs`,
    "",
    "— RemoteForge",
  ].join("\n");

  const html = layout({
    preheader: `${items.slice(0, 3).map((i) => i.title).join(" · ")}`,
    appUrl: base,
    reason: DIGEST_REASON,
    unsubscribeUrl,
    body: [
      heading(`${count} this week`),
      paragraph("Fresh roles that hire from India, from Remotive, We Work Remotely and RemoteOK."),
      itemList(items),
      button(`${base}/jobs`, "Browse all remote jobs"),
    ].join("\n"),
  });

  return sendEmail(to, { subject: `${count} for you this week`, text, html }, unsubscribeUrl);
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
  let title: string;
  let intro: string;
  if (intent.kind === "approval-alert") {
    const target = intent.platformName ?? "an AI training platform";
    subject = `You'll hear when ${intent.platformName ?? "a platform"} opens onboarding for India`;
    title = "You're on the alert list";
    intro = `Thanks for signing up. We'll email you as soon as ${target} opens onboarding to applicants from India.`;
  } else if (intent.kind === "prep-waitlist") {
    const pack = intent.platformName ? `${intent.platformName} assessment prep pack` : "assessment prep packs";
    subject = `You're on the waitlist for the ${pack}`;
    title = "You're on the waitlist";
    intro = `Thanks for joining the waitlist. We'll email you when the ${pack} ${intent.platformName ? "is" : "are"} ready, before anyone else hears about ${intent.platformName ? "it" : "them"}.`;
  } else {
    subject = "You're subscribed to RemoteForge";
    title = "Welcome to RemoteForge";
    intro = "Thanks for subscribing. Your first digest of remote jobs and AI gig platforms open to India arrives on Monday.";
  }

  const base = appUrl();
  const next = "In the meantime, browse AI gig platforms open to India.";
  const text = `${intro}\n\n${next}\n${base}/ai-gigs\n\n— RemoteForge`;
  const html = layout({
    preheader: intro,
    appUrl: base,
    reason: "You're receiving this because you signed up on RemoteForge.",
    unsubscribeUrl,
    body: [heading(title), paragraph(intro), paragraph(next), button(`${base}/ai-gigs`, "Browse AI gig platforms")].join("\n"),
  });

  return sendEmail(to, { subject, text, html }, unsubscribeUrl);
}

export async function sendGigDigestEmail(
  to: string,
  gigs: DigestGig[],
  unsubscribeUrl?: string,
): Promise<SendResult> {
  const base = appUrl();
  const items = gigs.map((g) => {
    const pay = formatPay(g.payMin, g.payMax);
    const meta: string[] = [];
    if (pay) meta.push(pill(pay, "success"));
    if (g.indiaAccepted) meta.push(pill("Open to India"));
    return { href: `${base}/ai-gigs/${g.slug}`, title: cleanText(g.name), pay, meta };
  });
  const count = `${gigs.length} AI gig ${gigs.length === 1 ? "platform" : "platforms"}`;

  const text = [
    `${count} open to India, worth checking this week.`,
    "",
    ...items.map((i) => `• ${i.title}${i.pay ? ` (${i.pay})` : ""}\n  ${i.href}`),
    "",
    `Compare all AI gig platforms: ${base}/ai-gigs`,
    "",
    "— RemoteForge",
  ].join("\n");

  const html = layout({
    preheader: items.map((i) => i.title).join(" · "),
    appUrl: base,
    reason: DIGEST_REASON,
    unsubscribeUrl,
    body: [
      heading(`${count} worth checking`),
      paragraph("AI training and annotation platforms accepting applicants from India, with pay per hour."),
      itemList(items),
      button(`${base}/ai-gigs`, "Compare all AI gig platforms"),
    ].join("\n"),
  });

  return sendEmail(to, { subject: `${count} worth checking this week`, text, html }, unsubscribeUrl);
}
