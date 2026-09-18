import sanitizeHtml from "sanitize-html";

// Job descriptions come from three feeds plus employer posts, in three shapes:
// HTML (Remotive, RemoteOK), entity-escaped HTML (WWR rows ingested before the
// parser decoded it, e.g. "&lt;p&gt;"), and plain text (employer posts).
// Everything rendered goes through sanitize-html: feed HTML is untrusted.

const ALLOWED_TAGS = [
  "p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "a",
  "h2", "h3", "h4", "h5", "blockquote", "code", "pre", "hr",
];

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
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

const HAS_TAG = /<\/?[a-z][^>]*>/i;
const HAS_ESCAPED_TAG = /&lt;\/?[a-z][\s\S]*?&gt;/i;

function toHtml(raw: string): string {
  if (!HAS_TAG.test(raw) && HAS_ESCAPED_TAG.test(raw)) return decodeEntities(raw);
  if (HAS_TAG.test(raw)) return raw;
  // Plain text: keep paragraph and line breaks.
  return raw
    .split(/\n\s*\n/)
    .map((p) => `<p>${sanitizeHtml(p.trim(), { allowedTags: [] }).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

/** Safe HTML for the job page body and JobPosting structured data. */
export function jobDescriptionHtml(raw: string): string {
  return sanitizeHtml(toHtml(raw), {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "nofollow noopener noreferrer" }),
      // Feeds use h1 and h4 inconsistently; the page already has the h1.
      h1: "h3",
    },
    exclusiveFilter: (frame) => ["p", "li"].includes(frame.tag) && !frame.text.trim(),
  });
}

/** Plain text, whitespace collapsed, for meta descriptions and prompts. */
export function jobDescriptionText(raw: string, maxLength?: number): string {
  const text = decodeEntities(sanitizeHtml(toHtml(raw), { allowedTags: [], allowedAttributes: {} }))
    .replace(/\s+/g, " ")
    .trim();
  if (maxLength === undefined || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).replace(/\s+\S*$/, "")}…`;
}
