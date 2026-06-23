import type { NormalizedJob } from "./remotive";

export async function fetchWwrJobs(): Promise<NormalizedJob[]> {
  const res = await fetch("https://weworkremotely.com/remote-jobs.rss");
  if (!res.ok) throw new Error(`WWR RSS error: ${res.status}`);

  const xml = await res.text();
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];

  return items.map((item, index) => {
    const title = extractTag(item, "title") ?? "Untitled";
    const link = extractTag(item, "link") ?? "";
    const description = extractTag(item, "description") ?? "";
    const pubDate = extractTag(item, "pubDate");
    const region = extractTag(item, "region") ?? "";

    const company = extractCompany(title);

    return {
      sourceBoard: "wwr",
      sourceId: link || String(index),
      title: title.replace(/:.*/, "").trim(),
      company,
      description: stripHtml(description),
      url: link,
      postedAt: pubDate ? new Date(pubDate) : new Date(),
      tags: extractTagsFromDescription(description),
      category: mapWwrRegion(region),
    };
  });
}

function extractTag(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`))
    ?? xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
  return match?.[1]?.trim() ?? null;
}

function extractCompany(title: string): string {
  const parts = title.split(":");
  return parts.length > 1 ? (parts[0]?.trim() ?? "Unknown") : "Unknown";
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
