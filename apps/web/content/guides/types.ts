export interface GuideSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface GuideFaq {
  q: string;
  a: string;
}

export interface GuideSource {
  label: string;
  url: string;
}

export interface Guide {
  slug: string;
  title: string;
  metaDescription: string;
  targetQuery: string;
  /** ISO date (YYYY-MM-DD) the facts in this guide were last checked. */
  lastVerified: string;
  intro: string;
  sections: GuideSection[];
  faq: GuideFaq[];
  relatedGigSlugs: string[];
  sources: GuideSource[];
  /** Email-capture signal, e.g. `prep-waitlist:outlier-ai` or `approval-alert:all`. */
  signal: string;
}
