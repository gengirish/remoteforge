import type { Guide } from "./types";

export const mercorInterviewTips: Guide = {
  slug: "mercor-interview-tips",
  title: "Mercor Interview Tips for Indian Applicants (AI Interview Guide)",
  metaDescription:
    "Practical Mercor interview tips for applicants in India: how the 20-minute AI interview works, retakes, setup, answering with specifics, and what happens after.",
  targetQuery: "mercor interview tips",
  lastVerified: "2026-09-17",
  intro:
    "Mercor screens most applicants with a recorded AI interview before any human looks at your profile. The good news for applicants in India: the format is predictable, there is a free practice mode, and good preparation makes a real difference. These Mercor interview tips cover how the interview works according to Mercor's own help docs, how to prepare your setup and answers, and what to expect afterwards.",
  sections: [
    {
      heading: "How the Mercor AI interview works",
      paragraphs: [
        "According to Mercor's talent help centre, an AI interviewer asks role-specific questions, creates a transcript of your answers and evaluates your performance for the listing you applied to. Most interviews take about 20 minutes, though some are shorter or longer.",
        "Interviews differ by role. Mercor says some are technical and go deep into your prior experience, while others test language or reasoning skills. So the interview for a software role will not look like one for a Hindi language expert or a finance specialist.",
        "You answer out loud on camera. There is no human on the other side in real time, which many applicants find awkward at first. That is exactly why the practice mode exists.",
      ],
    },
    {
      heading: "Retakes and the practice interview",
      paragraphs: [
        "Mercor offers a free practice interview that does not affect your official evaluation and can be taken as many times as you like. Use it at least twice before your real attempt: once to get used to the format, once to rehearse properly.",
        "For the official interview, Mercor's help docs say you get up to three retakes across all applications for a given interview. If a technical problem happens after you have used them, support may grant a one-time exception. Retakes are limited, so do not treat the official interview as practice.",
      ],
    },
    {
      heading: "Setup checklist for interviewing from India",
      paragraphs: [
        "Mercor lists specific technical requirements. Power cuts, shared rooms and patchy broadband are real issues for many Indian applicants, so plan for them rather than hoping for the best.",
      ],
      bullets: [
        "A computer with a working webcam and microphone — test both first. Headphones and an external mic are recommended.",
        "Chrome (recommended), Edge or Safari. Close other tabs and pause downloads.",
        "A stable connection. If your broadband is unreliable, keep a mobile hotspot ready as backup and charge your laptop fully in case of a power cut.",
        "A quiet room with your full face visible and decent front lighting. Early morning or late evening is often quieter in a shared home.",
        "Pen, paper and a calculator nearby, which Mercor itself suggests.",
        "Be ready to share your full screen if the interview asks for it.",
      ],
    },
    {
      heading: "Mercor interview tips for stronger answers",
      paragraphs: [
        "Because the AI works from a transcript, what you say matters far more than how polished you look. The most consistent advice from Mercor and independent prep guides is to be specific.",
      ],
      bullets: [
        "Use concrete examples. 'I built a Django API that handled payment reconciliation for 40 stores' beats 'I have worked on many backend projects'.",
        "Structure answers: context, what you did, the result, what you learned. Keep each answer focused on the question asked.",
        "Name tools, methods, numbers and trade-offs you actually used. Do not claim experience you cannot explain in follow-up.",
        "Speak clearly and avoid long pauses. It is fine to take a breath and say 'let me think about that for a moment'.",
        "Do not read from a script. Practise out loud so your spoken answers flow; people who prepare only in writing often struggle with fluency on camera.",
        "Accent is not the issue — clarity is. Slow down slightly, finish your sentences, and avoid mumbling technical terms.",
      ],
    },
    {
      heading: "Using AI tools: what Mercor allows",
      paragraphs: [
        "Mercor's LLM usage policy allows grammar and wording checks where needed but asks candidates not to use large language models to compose their responses. Do not have ChatGPT open generating answers during the interview, and do not memorise AI-written scripts. Beyond the policy risk, generic AI answers are exactly the vague responses that score poorly.",
        "Preparing with AI is a different matter. Asking a chatbot to quiz you on your own field, or to critique a practice answer you wrote yourself, is reasonable prep.",
      ],
    },
    {
      heading: "Preparing your profile before the interview",
      paragraphs: [
        "Your resume and the interview work together. Before you record, make sure your Mercor profile reflects the role: relevant degrees, years of experience, specific projects and languages. If your resume says you know PyTorch, expect to be asked about it.",
        "Indian applicants often under-describe their experience — 'worked at an IT services company' hides the useful detail. Name the domain (banking, healthcare, telecom), the stack and your actual responsibilities.",
        "Keep details honest and consistent with your ID. Mercor verifies identity, and mismatches between your profile and documents create avoidable problems.",
      ],
    },
    {
      heading: "What happens after the interview",
      paragraphs: [
        "Mercor's help docs say it usually takes 2 to 4 weeks to hear whether you have moved to the next stage. Silence for a couple of weeks is normal, not a rejection. Keep applying to other listings that match your background during that time.",
        "If you are selected for hourly work, Mercor's payments docs say contractors are paid weekly on Wednesdays through Stripe Connect or, in countries Stripe Connect does not support, through Wise. Check your payout setup in the Mercor dashboard rather than assuming which method applies to you.",
        "If you do not get through, review your recording notes, strengthen weak areas and apply to a better-matched listing rather than burning retakes on the same role.",
      ],
    },
  ],
  faq: [
    {
      q: "How long is the Mercor AI interview?",
      a: "Mercor says most interviews take about 20 minutes, though some are shorter or longer depending on the role.",
    },
    {
      q: "Can I retake the Mercor interview?",
      a: "Mercor's help centre says you get up to three retakes across all applications for a given interview, plus an unlimited free practice interview that does not affect your evaluation.",
    },
    {
      q: "Can I use ChatGPT during the Mercor interview?",
      a: "Mercor's policy allows grammar and wording checks but asks you not to use LLMs to compose your responses. Answer in your own words.",
    },
    {
      q: "How long does Mercor take to respond after the interview?",
      a: "According to Mercor, it usually takes 2 to 4 weeks to hear whether you have moved on to the next stage.",
    },
  ],
  relatedGigSlugs: ["mercor", "outlier-ai", "alignerr"],
  sources: [
    { label: "Mercor Talent Docs — AI Interview (official)", url: "https://talent.docs.mercor.com/support/ai-interview" },
    { label: "Mercor Talent Docs — Payments (official)", url: "https://talent.docs.mercor.com/how-to/payments" },
    {
      label: "Annotation Academy — Mercor AI interview prep guide (independent)",
      url: "https://annotation.academy/blog/how-to-prepare-for-mercor-ai-interview",
    },
  ],
  signal: "prep-waitlist:mercor",
};
