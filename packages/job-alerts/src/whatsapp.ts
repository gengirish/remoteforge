export interface WhatsAppDigest {
  phone: string;
  message: string;
}

export async function sendWhatsAppAlert(
  digest: WhatsAppDigest,
): Promise<{ ok: boolean; error?: string }> {
  // Sarvam / WABA integration placeholder — wire when credentials are available
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    console.warn("[job-alerts] SARVAM_API_KEY not set, skipping WhatsApp send");
    return { ok: false, error: "SARVAM_API_KEY not configured" };
  }

  // TODO: integrate Sarvam WhatsApp Business API
  console.log(`[whatsapp] Would send to ${digest.phone}: ${digest.message.slice(0, 80)}...`);
  return { ok: true };
}

export function formatJobDigestMessage(
  jobs: { title: string; company: string }[],
): string {
  const lines = jobs.map((j) => `• ${j.title} @ ${j.company}`).join("\n");
  return `RemoteForge job alerts:\n${lines}`;
}

export function formatGigDigestMessage(
  gigs: { name: string; payMin: number; payMax: number }[],
): string {
  const lines = gigs
    .map((g) => `• ${g.name} ($${g.payMin / 100}-$${g.payMax / 100}/hr)`)
    .join("\n");
  return `RemoteForge AI gig alerts:\n${lines}`;
}
