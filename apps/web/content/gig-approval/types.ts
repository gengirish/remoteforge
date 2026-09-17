export interface GigApprovalContent {
  /** ISO date (YYYY-MM-DD) the facts below were last checked against the sources. */
  lastVerified: string;
  summary: string;
  eligibility: string[];
  steps: { title: string; detail: string }[];
  /** Rendered as an FAQ and as FAQPage JSON-LD. */
  rejectionReasons: { q: string; a: string }[];
  approvalTime: string;
  payoutToIndia: string;
  sources: { label: string; url: string }[];
  relatedGuides: { slug: string; title: string }[];
}
