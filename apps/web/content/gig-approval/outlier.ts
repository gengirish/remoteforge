import type { GigApprovalContent } from "./types";

export const outlier: GigApprovalContent = {
  lastVerified: "2026-09-17",
  summary:
    "Outlier (run by Scale AI) accepts contributors based in India and lists India-specific projects, including Hindi, Telugu, Bengali, Marathi, Gujarati and Tamil language work alongside coding, math and domain-expert projects. Approval is not a single yes/no: you pass skill screenings to get matched to a project, and rates depend on your expertise, the project and your location.",
  eligibility: [
    "At least an associate degree, per Outlier's FAQ. Some projects require a bachelor's, master's or PhD.",
    "You must be legally authorised to work in your country of residence. Outlier does not sponsor visas.",
    "You must pass identity and phone verification as the person, and in the location, you signed up with.",
    "Language projects for India ask for native or highly fluent speakers of that language.",
    "Expert projects (coding, math, finance and similar) screen for real domain skill, not just a degree.",
  ],
  steps: [
    {
      title: "Create your account with accurate details",
      detail:
        "Use your real name, your actual location (India) and a degree you can back up. Pay rates and the projects you're shown depend on location, and verification is checked against these details.",
    },
    {
      title: "Pick areas of expertise you can actually do",
      detail:
        "Choose the domains and languages you're strongest in. Screenings are matched to what you select, so claiming extra areas mostly adds tests you're likely to fail.",
    },
    {
      title: "Complete identity and phone verification",
      detail:
        "Outlier's FAQ says onboarding (account, expertise, skill screenings and ID verification) usually takes 30 to 90 minutes. Do it in one sitting with your government ID to hand.",
    },
    {
      title: "Prepare for the skill screenings",
      detail:
        "Read every instruction and rubric before you start. Screenings test whether you can follow detailed guidelines and explain your reasoning clearly in written English (or the project language), not only whether you know the subject.",
    },
    {
      title: "Finish project onboarding, then start tasking",
      detail:
        "Once matched, projects have their own onboarding modules. Outlier says lower rates apply to non-core work such as initial project onboarding. You'll see the tasking rate before you start.",
    },
  ],
  rejectionReasons: [
    {
      q: "Why did I fail the Outlier skill screening?",
      a: "Outlier doesn't publish scoring details. Applicants commonly report failing because they skimmed the guidelines, gave short or unsupported rationales, or picked expertise areas they weren't strong in. Re-read the instructions, slow down and justify each judgement in writing.",
    },
    {
      q: "I passed onboarding but there are no tasks. Was I rejected?",
      a: "Not necessarily. Outlier works project by project, and contributors on Reddit often describe an \"empty queue\" when a project pauses or ends. It usually means no project currently matches your profile, not that your account was rejected.",
    },
    {
      q: "Can identity verification get me blocked?",
      a: "Yes, if your ID, name or location don't match your profile. Sign up with accurate details from the start. Never use a VPN or misstate your location: it breaks Outlier's terms and gets accounts removed.",
    },
    {
      q: "Is using ChatGPT or other AI tools allowed in screenings or tasks?",
      a: "Treat it as not allowed unless a project's instructions say otherwise. AI training platforms generally prohibit AI-generated responses, and getting flagged for them is a commonly reported reason for removal.",
    },
    {
      q: "Does my degree matter if I have the skills?",
      a: "Outlier's FAQ states a minimum of an associate degree, and some projects need higher degrees. Without the minimum you may not be eligible, however strong your skills are.",
    },
  ],
  approvalTime:
    "Outlier says account onboarding takes about 30 to 90 minutes. Getting matched to a paid project after that varies. Applicants report anywhere from same-day to several weeks, depending on demand for their skills and language.",
  payoutToIndia:
    "Outlier pays weekly, on Tuesdays, for work done the previous Tuesday to Monday (UTC). The FAQ lists PayPal, Airtm and ACH bank transfer. From India, PayPal and Airtm are the realistic options since ACH needs a US bank account. Rates vary by location, and India language projects have been advertised at up to $7.50/hr. Expect currency conversion fees when withdrawing to an Indian bank.",
  sources: [
    { label: "Outlier FAQ (official)", url: "https://outlier.ai/faq" },
    { label: "Outlier: Hindi Voice AI Evaluator, India (official listing)", url: "https://outlier.ai/languages/hi-in" },
    { label: "Outlier: Telugu (India) Freelance Writer (official listing)", url: "https://outlier.ai/languages/te-in" },
    {
      label: "Summary of Reddit contributor reports on empty queues (community, secondhand)",
      url: "https://discover.oreateai.com/discover/the-real-truth-about-outlier-ai-according-to-reddit-reviews",
    },
  ],
  relatedGuides: [
    { slug: "outlier-assessment-failed-india", title: "Failed the Outlier assessment? What to do next (India)" },
    { slug: "outlier-review-india", title: "Outlier review for Indian contributors" },
    { slug: "ai-training-jobs-india-2026", title: "AI training jobs in India (2026)" },
  ],
};
