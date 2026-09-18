import type { NormalizedJob } from "./remotive";

export async function fetchWwrJobs(): Promise<NormalizedJob[]> {
  const res = await fetch("https://weworkremotely.com/remote-jobs.rss");
  if (!res.ok) throw new Error(`WWR RSS error: ${res.status}`);

  const xml = await res.text();
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];

  return items.map((item, index) => {
    const { company, title } = splitTitle(extractTag(item, "title") ?? "Untitled");
    const link = extractTag(item, "link") ?? "";
    // Without CDATA the RSS entity-escapes the HTML ("&lt;p&gt;"); decode it once
    // and store HTML like the other sources. Drop the inline company logo.
    const rawDescription = extractTag(item, "description") ?? "";
    const description = (rawDescription.includes("&lt;") ? decodeEntities(rawDescription) : rawDescription)
      .replace(/<img\b[^>]*>/gi, "")
      .trim();
    const pubDate = extractTag(item, "pubDate");
    const region = extractTag(item, "region") ?? "";

    return {
      sourceBoard: "wwr",
      sourceId: link || String(index),
      title,
      company,
      description,
      url: link,
      postedAt: pubDate ? new Date(pubDate) : new Date(),
      tags: extractTagsFromDescription(stripHtml(description)),
      category: mapWwrRegion(region),
    };
  });
}

function extractTag(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`))
    ?? xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
  return match?.[1]?.trim() ?? null;
}

/**
 * WWR titles are "Company: Job Title". Split on the first colon only, since job
 * titles can contain colons too. Keeping the text before the colon as the title
 * stored the company name as the job title.
 */
function splitTitle(raw: string): { company: string; title: string } {
  const idx = raw.indexOf(":");
  if (idx <= 0) return { company: "Unknown", title: raw.trim() };
  const company = raw.slice(0, idx).trim();
  const title = raw.slice(idx + 1).trim();
  return title ? { company, title } : { company: "Unknown", title: company };
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
};

/** One pass, so "&amp;nbsp;" becomes "&nbsp;" and is not decoded twice. */
function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return NAMED_ENTITIES[e.toLowerCase()] ?? m;
  });
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractTagsFromDescription(desc: string): string[] {
  const tags: string[] = [];
  const techs = ["react", "python", "node", "typescript", "java", "go", "rust"];
  const lower = desc.toLowerCase();
  for (const t of techs) {
    if (lower.includes(t)) tags.push(t);
  }
  return tags;
}

function mapWwrRegion(region: string): string {
  const lower = region.toLowerCase();
  if (lower.includes("design")) return "design";
  if (lower.includes("marketing")) return "marketing";
  if (lower.includes("sales")) return "sales";
  if (lower.includes("support")) return "support";
  if (lower.includes("writing")) return "writing";
  return "engineering";
}
