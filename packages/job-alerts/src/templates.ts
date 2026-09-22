// Branded HTML for transactional and digest emails. Email clients ignore
// <style> blocks and external CSS unevenly, so everything is table layout with
// inline styles. Colours mirror apps/web/app/globals.css (light theme).

const C = {
  bg: "#FBF9F5",
  card: "#FFFFFF",
  text: "#0F1729",
  muted: "#5A687C",
  border: "#E5E2DC",
  primary: "#3548F3",
  accent: "#F98C10",
  success: "#065F46",
  successBg: "#ECFDF5",
};

const DISPLAY_FONT = "Sora, 'Segoe UI', Helvetica, Arial, sans-serif";
const BODY_FONT = "'Source Sans 3', 'Segoe UI', Helvetica, Arial, sans-serif";

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
};

/**
 * Ingested titles arrive with HTML entities already in them ("Web &amp; Mobile")
 * and stray double spaces. Decode and tidy before the text goes into either part.
 */
export function cleanText(input: string): string {
  return input
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
      if (code[0] === "#") {
        const n = code[1]?.toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
        return Number.isFinite(n) ? String.fromCodePoint(n) : match;
      }
      return NAMED_ENTITIES[code.toLowerCase()] ?? match;
    })
    .replace(/\s+/g, " ")
    .trim();
}

export function esc(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 4px;">
  <tr><td style="border-radius:10px;background:${C.primary};">
    <a href="${esc(href)}" style="display:inline-block;padding:13px 24px;font-family:${BODY_FONT};font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:10px;">${esc(label)} &rarr;</a>
  </td></tr>
</table>`;
}

export function heading(text: string): string {
  return `<h1 style="margin:0 0 10px;font-family:${DISPLAY_FONT};font-size:24px;line-height:1.3;font-weight:700;color:${C.text};letter-spacing:-0.02em;">${esc(text)}</h1>`;
}

export function paragraph(text: string): string {
  return `<p style="margin:0 0 14px;font-family:${BODY_FONT};font-size:16px;line-height:1.6;color:${C.muted};">${esc(text)}</p>`;
}

export function pill(text: string, tone: "success" | "neutral" = "neutral"): string {
  const [fg, bg] = tone === "success" ? [C.success, C.successBg] : [C.muted, C.bg];
  return `<span style="display:inline-block;padding:2px 8px;border-radius:6px;background:${bg};color:${fg};font-family:${BODY_FONT};font-size:12px;font-weight:600;white-space:nowrap;">${esc(text)}</span>`;
}

export interface ListItem {
  href: string;
  title: string;
  subtitle?: string;
  /** Pre-rendered pill HTML, shown under the subtitle. */
  meta?: string[];
}

export function itemList(items: ListItem[]): string {
  const rows = items
    .map((item, i) => {
      const top = i === 0 ? "" : `border-top:1px solid ${C.border};`;
      const subtitle = item.subtitle
        ? `<div style="margin-top:3px;font-family:${BODY_FONT};font-size:14px;color:${C.muted};">${esc(item.subtitle)}</div>`
        : "";
      const meta = item.meta?.length
        ? `<div style="margin-top:8px;">${item.meta.join("&nbsp;")}</div>`
        : "";
      return `<tr><td style="${top}padding:16px 0;">
  <a href="${esc(item.href)}" style="font-family:${DISPLAY_FONT};font-size:16px;line-height:1.4;font-weight:600;color:${C.text};text-decoration:none;">${esc(item.title)}</a>
  ${subtitle}${meta}
</td></tr>`;
    })
    .join("\n");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;">${rows}</table>`;
}

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

export interface LayoutOptions {
  /** Inbox preview line shown after the subject. */
  preheader: string;
  appUrl: string;
  body: string;
  unsubscribeUrl?: string;
  /** Why the recipient is getting this, shown in the footer. */
  reason: string;
}

export function layout({ preheader, appUrl, body, unsubscribeUrl, reason }: LayoutOptions): string {
  const unsubscribe = unsubscribeUrl
    ? `<div style="margin-top:14px;padding-top:14px;border-top:1px solid ${C.border};">
          Don't want these emails?
          <a href="${esc(unsubscribeUrl)}" style="color:${C.text};font-weight:600;text-decoration:underline;">Unsubscribe</a>
        </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>RemoteForge</title>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=Source+Sans+3:wght@400;600&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:${C.bg};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.bg};">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
      <tr><td style="padding:0 4px 20px;">
        <a href="${esc(appUrl)}" style="text-decoration:none;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="width:32px;height:32px;border-radius:8px;background:${C.primary};text-align:center;vertical-align:middle;font-family:${DISPLAY_FONT};font-size:13px;font-weight:700;color:#FFFFFF;">RF</td>
            <td style="padding-left:10px;font-family:${DISPLAY_FONT};font-size:20px;font-weight:700;color:${C.text};letter-spacing:-0.02em;">Remote<span style="color:${C.primary};">Forge</span></td>
          </tr></table>
        </a>
      </td></tr>
      <tr><td style="background:${C.card};border:1px solid ${C.border};border-radius:14px;overflow:hidden;">
        <div style="height:4px;background:${C.primary};background-image:linear-gradient(90deg, ${C.primary}, ${C.accent});font-size:0;line-height:0;">&nbsp;</div>
        <div style="padding:32px 32px 28px;">
${body}
        </div>
      </td></tr>
      <tr><td style="padding:24px 4px 0;font-family:${BODY_FONT};font-size:13px;line-height:1.6;color:${C.muted};">
        Remote jobs and AI gig platforms that hire from India.<br>
        ${esc(reason)}<br>
        <a href="${esc(appUrl)}" style="color:${C.muted};text-decoration:underline;">${esc(hostOf(appUrl))}</a>
        ${unsubscribe}
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}
