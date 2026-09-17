import type { Guide } from "./types";

export const alignerrApprovalTimeIndia: Guide = {
  slug: "alignerr-approval-time-india",
  title: "Alignerr Approval Time in India: What to Expect in 2026",
  metaDescription:
    "How long Alignerr approval takes for applicants in India: each onboarding step, what is officially stated vs reported, why applications stall, and what to do while you wait.",
  targetQuery: "alignerr approval time india",
  lastVerified: "2026-09-17",
  intro:
    "Alignerr, the Labelbox-run AI training network, is one of the platforms Indian applicants ask about most, and the most common question is how long approval takes. The honest answer is that Alignerr does not publish an official approval time for India or anywhere else. This guide separates what Alignerr officially says from what applicants report, and explains how to avoid the delays you can control.",
  sections: [
    {
      heading: "The Alignerr onboarding steps",
      paragraphs: [
        "Alignerr's process page lays out the path from sign-up to work. Knowing the steps helps you see where your application actually is.",
      ],
      bullets: [
        "Application and profile: sign in with Google and upload your resume, which Alignerr says auto-fills your profile in about 30 seconds. Choose skill and domain preferences.",
        "Apply to specific roles: you apply to listings that match your expertise, not to Alignerr in general.",
        "Assessment where required: some roles need a Zara AI interview or a domain-specific assessment. You are told if this applies.",
        "Identity verification: phone verification by text, then ID verification through Persona using an official ID.",
        "Contract and billing: sign the contract and set up payments via Stripe Connect or PayPal. Alignerr says this takes about an hour.",
        "Onboarding: an email with onboarding resources, access to the Labelbox platform, and the community Discord.",
      ],
    },
    {
      heading: "Alignerr approval time in India: official vs reported",
      paragraphs: [
        "Officially, Alignerr gives timings only for individual steps — around 30 seconds for resume parsing and about an hour for billing setup — plus a note in third-party summaries that applications are reviewed daily. There is no published end-to-end approval time, and nothing specific to India.",
        "Reported experiences vary a lot. Talent Collective's review cites an average hiring process of about 28 days across job titles, based on user-submitted interview data. Individual applicants on Glassdoor and community forums describe onboarding that 'takes forever', and some describe waiting for weeks or months with no project after acceptance. These are self-reported experiences, not guarantees in either direction.",
        "For planning, assume weeks rather than days, and do not stop applying elsewhere while you wait. RemoteForge's Alignerr listing shows our current onboarding estimate and is updated as we collect more data.",
      ],
    },
    {
      heading: "Why applications from India stall",
      paragraphs: [
        "Most delays come from matching, not from where you live. Alignerr hires for specific roles, so approval depends on whether a project currently needs your skills. That said, several avoidable issues slow Indian applicants down.",
      ],
      bullets: [
        "Incomplete steps. If phone or Persona ID verification is unfinished, nothing moves. Log in and check every step shows as complete.",
        "Name mismatches. Use the name exactly as it appears on your ID (passport, PAN or Aadhaar as accepted by Persona) across your resume and profile.",
        "A generic resume. 'Software engineer, 3 years' tells the parser little. Name domains, stacks, languages and degrees clearly.",
        "Applying to roles that do not fit. A long list of unrelated applications does not improve your odds; well-matched ones do.",
        "Unfinished assessments. If you were invited to a Zara AI interview or domain test, the clock is effectively paused until you complete it.",
        "Missed emails. Onboarding emails land in spam or Promotions tabs more often than people expect.",
      ],
    },
    {
      heading: "Preparing for the Zara interview and assessments",
      paragraphs: [
        "If your role requires the Zara AI interview, treat it like any professional screening. Prepare specific examples from your work or studies, test your camera and microphone, and pick a quiet time. Third-party reviews note that engineering interviews have covered fundamentals such as React, TypeScript and Python; domain roles focus on your field.",
        "Applicants in reviews describe the interview itself as reasonable but say later assessments can be harder than the initial resume screen suggests. Prepare for depth in your stated specialism rather than breadth, and never use AI tools to generate answers.",
      ],
    },
    {
      heading: "What to do while you wait",
      paragraphs: [
        "Waiting is where most applicants lose momentum. A little structure helps.",
      ],
      bullets: [
        "Check your Alignerr dashboard weekly rather than daily; make sure no step is pending on your side.",
        "Set up your payout account early. Alignerr uses Stripe Connect or PayPal, so confirm your Indian bank KYC and PayPal account are in order.",
        "Apply in parallel to other platforms that accept India, such as Outlier and Mercor.",
        "Join the Alignerr Discord only once you receive the official invite, and ignore anyone offering to 'speed up' approval for a fee.",
        "Do not create a second account or reapply under different details. It creates identity conflicts and can get you removed.",
      ],
    },
    {
      heading: "After approval: pay and taxes",
      paragraphs: [
        "Alignerr advertises roles with hourly rates up to $150, but that is a ceiling for specialised expert roles, not a typical rate. Community reports put many roles far lower. Check the rate on each listing you apply to.",
        "Income from Alignerr is taxable in India. Keep your payout statements and speak to a chartered accountant about income tax and whether GST applies to your situation. This is not tax advice.",
        "Approval also does not guarantee steady work. Contributors report periods with no available projects, so keep a second income stream until you have several months of consistent tasks.",
      ],
    },
  ],
  faq: [
    {
      q: "How long does Alignerr approval take in India?",
      a: "Alignerr does not publish an official approval time. A third-party review cites an average of about 28 days based on user-submitted data, and individual reports range from quick approvals to waits of several weeks or more.",
    },
    {
      q: "Does Alignerr accept applicants from India?",
      a: "Alignerr accepts international applicants, and RemoteForge lists it as India-accepted. Individual roles may still have their own requirements, so read each listing.",
    },
    {
      q: "Why is my Alignerr application still pending?",
      a: "Common causes are unfinished ID or phone verification, an incomplete assessment, or no current project matching your skills. Check every onboarding step and your spam folder.",
    },
    {
      q: "How does Alignerr pay contributors in India?",
      a: "Alignerr's process page lists Stripe Connect or PayPal for billing setup, which you complete after approval.",
    },
  ],
  relatedGigSlugs: ["alignerr", "outlier-ai", "mercor"],
  sources: [
    { label: "Alignerr — onboarding process (official)", url: "https://www.alignerr.com/process" },
    {
      label: "Talent Collective — Alignerr review and application process (independent, includes user-submitted data)",
      url: "https://www.talent-collective.org/platforms/alignerr-review-guide",
    },
    {
      label: "Glassdoor — Alignerr review: 'Onboarding process takes forever' (reported experience)",
      url: "https://www.glassdoor.com/Reviews/Employee-Review-Alignerr-E10042963-RVW94407599.htm",
    },
  ],
  signal: "approval-alert:alignerr",
};
