import type { GigApprovalContent } from "./types";

export const mercor: GigApprovalContent = {
  lastVerified: "2026-09-17",
  summary:
    "Mercor matches domain experts (engineers, mathematicians, doctors, lawyers, finance professionals and others) with AI-lab training projects. India is on Mercor's supported-countries list for payments. Getting in usually means applying to a specific listing, clearing an AI-run video interview and sometimes a role-specific assessment, then waiting to be matched to a project.",
  eligibility: [
    "You must live in a country Mercor supports for payment. India is listed, with payouts via Stripe Connect.",
    "Your resume needs to show real depth in the listing's domain, because the AI interview asks follow-up questions about what you claim.",
    "You need a computer with a working camera and microphone, and a quiet space for the interview.",
    "Some roles add a coding challenge, take-home task or domain assessment on top of the interview.",
  ],
  steps: [
    {
      title: "Apply to listings that fit your background",
      detail:
        "Apply to specific roles rather than everything. Make sure your resume clearly shows the degrees, projects and years of experience relevant to that listing.",
    },
    {
      title: "Set up for the AI interview",
      detail:
        "Mercor's docs say most interviews take about 20 minutes. Test your camera and mic, keep your full face visible and speak clearly in a quiet room.",
    },
    {
      title: "Answer from your own experience",
      detail:
        "Expect follow-ups about specific projects on your resume. Structure your answers (context, what you did, the result) and explain your reasoning. Mercor tells candidates not to use LLMs to write responses or explanations.",
    },
    {
      title: "Use retakes deliberately",
      detail:
        "Mercor allows up to three retakes across the applications tied to an interview. Review what went wrong before you retake instead of retaking straight away.",
    },
    {
      title: "Complete any assessment, then wait for a match",
      detail:
        "Finish any role-specific tasks promptly. Mercor says it usually takes 2 to 4 weeks to hear whether you've moved to the next stage.",
    },
  ],
  rejectionReasons: [
    {
      q: "Why didn't I hear back after the Mercor interview?",
      a: "Mercor says it usually takes 2 to 4 weeks to hear whether you've moved on. Reviewers and applicants also report that formal rejection emails are uncommon, so a long silence often means you weren't selected for that listing.",
    },
    {
      q: "What makes the AI interview go badly?",
      a: "Commonly reported problems are vague, generic answers, being unable to go deeper on items listed on your resume, and poor audio or video. Prepare concrete examples from your own work and test your setup first.",
    },
    {
      q: "Can I use AI tools during the interview or assessment?",
      a: "No. Mercor's interview guidance says not to use large language models to compose responses, rate model outputs, write rationales or evaluate code. It also says not to share interview questions or confidential project material.",
    },
    {
      q: "Is India supported, or will I be blocked at payment setup?",
      a: "India is on Mercor's supported-countries list, with payments through Stripe Connect. Set up payouts with your real identity and Indian bank details.",
    },
    {
      q: "Can I retake a failed interview?",
      a: "Mercor allows up to three retakes across all applications tied to that interview. If a technical problem hits after you've used them all, you can email support, but a further retake isn't guaranteed.",
    },
  ],
  approvalTime:
    "Mercor says it usually takes 2 to 4 weeks to hear whether you've moved to the next stage. Applicants report that project matching after that can take several more weeks, and some are never matched.",
  payoutToIndia:
    "India is supported through Stripe Connect, per Mercor's supported-countries page. Mercor's payment docs name Stripe (and Wise in some countries) as its payout providers, not PayPal. Pay rates depend on the project and aren't published as a fixed number. Check each listing's rate before you apply.",
  sources: [
    { label: "Mercor: AI Interview (official talent docs)", url: "https://talent.docs.mercor.com/support/ai-interview" },
    { label: "Mercor: Supported countries for payment (official)", url: "https://talent.docs.mercor.com/policies/supported-countries" },
    { label: "Mercor interview experiences on Glassdoor (community)", url: "https://www.glassdoor.com/Interview/Mercor-Interview-Questions-E9031572.htm" },
  ],
  relatedGuides: [
    { slug: "mercor-interview-tips", title: "Mercor AI interview tips" },
    { slug: "ai-training-jobs-india-2026", title: "AI training jobs in India (2026)" },
  ],
};
