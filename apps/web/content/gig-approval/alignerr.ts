import type { GigApprovalContent } from "./types";

export const alignerr: GigApprovalContent = {
  lastVerified: "2026-09-17",
  summary:
    "Alignerr is Labelbox's expert network for AI training work. Its public pages don't publish a country list, and third-party guides report that location requirements vary by role, so check each listing before you apply. The published process is: sign up, apply to a job, verify your identity, set up your contract and billing, then onboard. Some projects add an AI interview (Zara) or a domain assessment.",
  eligibility: [
    "Location and work-authorisation rules vary by listing. Confirm that a role is open to India-based applicants before applying.",
    "A resume that clearly shows the listing's domain (for example finance, law, coding or a language).",
    "Phone verification by SMS and photo-ID verification through Alignerr's partner, Persona.",
    "Access to Stripe Connect or PayPal for payouts. Alignerr says the available option depends on your location.",
  ],
  steps: [
    {
      title: "Sign up and upload your resume",
      detail:
        "Sign in with Google and upload your resume, then check the auto-filled profile, especially your location, and correct anything that's wrong.",
    },
    {
      title: "Apply to specific jobs",
      detail:
        "Apply to listings that match your domain and read each one's location requirements. Tidy your resume so the relevant experience is easy to see.",
    },
    {
      title: "Verify your phone and ID",
      detail:
        "Verify your phone by text message, then verify a photo ID through Persona. Use the same name and details as on your profile.",
    },
    {
      title: "Prepare for the Zara AI interview or domain assessment",
      detail:
        "If your project needs one, practise explaining your reasoning out loud and review the fundamentals of your domain. Work from your own knowledge.",
    },
    {
      title: "Sign the contract, set up billing and onboard",
      detail:
        "Alignerr says contract and billing setup takes about an hour. After that, work through the onboarding resources and the Labelbox platform introduction.",
    },
  ],
  rejectionReasons: [
    {
      q: "I applied to Alignerr weeks ago and heard nothing. Is that a rejection?",
      a: "Not always. Matching reportedly depends on skills, assessment results and availability, so applicants often report waiting until a matching project opens. If a listing you applied to has closed, apply to other listings that fit your profile.",
    },
    {
      q: "Is Alignerr open to applicants from India?",
      a: "Alignerr doesn't publish a country list on its process page, and third-party guides report that location requirements vary by listing. Check each listing. If a role isn't open to India, don't apply with a different location. Misrepresenting where you live will fail ID and payment verification and breaks the terms.",
    },
    {
      q: "Why did my assessment or Zara interview not lead to a project?",
      a: "Third-party guides quoting Alignerr say project matching depends on skills, assessment results, availability and past performance. Applicants commonly report that weak or generic reasoning, or applying outside their real domain, hurts their chances.",
    },
    {
      q: "Can ID verification stop my application?",
      a: "Yes, if the ID doesn't match your profile details. Use your legal name and real location when you sign up.",
    },
  ],
  approvalTime:
    "Alignerr doesn't publish an approval timeline. Third-party reviews report that assessment results can come the same day, but being matched to a project can take weeks. One review site puts the average hiring process at about 28 days. Treat these as applicant reports, not guarantees.",
  payoutToIndia:
    "Alignerr pays through Stripe Connect or PayPal, depending on your location. It doesn't publish India-specific payout terms, so check what's offered during billing setup. Pay is set per listing, so check the rate on each role.",
  sources: [
    { label: "Alignerr: How to become an Alignerr (official process)", url: "https://www.alignerr.com/process" },
    { label: "Alignerr FAQs (official)", url: "https://www.alignerr.com/faqs" },
    {
      label: "Talent Collective: Alignerr review and application process (third-party)",
      url: "https://www.talent-collective.org/platforms/alignerr-review-guide",
    },
  ],
  relatedGuides: [
    { slug: "alignerr-approval-time-india", title: "How long Alignerr approval takes from India" },
    { slug: "ai-training-jobs-india-2026", title: "AI training jobs in India (2026)" },
  ],
};
