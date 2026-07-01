export type ComparisonRow = {
  label: string;
  /** Static copy keyed by platform slug; live API data overrides pay/india/onboarding/type in the page */
  values: Record<string, string>;
};

export type PlatformProsCons = {
  pros: string[];
  cons: string[];
};

export type ComparisonSection = {
  title: string;
  rows?: ComparisonRow[];
  prosCons?: Record<string, PlatformProsCons>;
};

export type ComparisonFaq = {
  question: string;
  answer: string;
};

export type GigComparison = {
  slug: string;
  title: string;
  metaDescription: string;
  intro: string;
  platformSlugs: string[];
  sections: ComparisonSection[];
  faq: ComparisonFaq[];
};

const OUTLIER_VS_APPEN_VS_TELUS: GigComparison = {
  slug: "outlier-vs-appen-vs-telus",
  title: "Outlier AI vs Appen vs TELUS International AI",
  metaDescription:
    "Compare Outlier AI, Appen, and TELUS International AI for India-based AI gig work — hourly pay, onboarding time, task types, and pros/cons.",
  intro:
    "Three of the most popular AI gig platforms for annotators in India. Outlier pays the most for RLHF and coding tasks; Appen and TELUS offer steadier evaluator and search-quality work at lower rates but with more project volume.",
  platformSlugs: ["outlier-ai", "appen", "telus-international-ai"],
  sections: [
    {
      title: "At a glance",
      rows: [
        {
          label: "Pay (USD/hr)",
          values: {
            "outlier-ai": "$20–50/hr (expert tier up to $50)",
            appen: "$9–20/hr",
            "telus-international-ai": "$12–15/hr",
          },
        },
        {
          label: "India eligibility",
          values: {
            "outlier-ai": "Accepted",
            appen: "Accepted",
            "telus-international-ai": "Accepted",
          },
        },
        {
          label: "Onboarding",
          values: {
            "outlier-ai": "1–7 days",
            appen: "14–42 days (can take 2–6 weeks)",
            "telus-international-ai": "14–56 days",
          },
        },
        {
          label: "Task types",
          values: {
            "outlier-ai": "RLHF, SFT evaluation, coding, math, writing",
            appen: "Image annotation, search evaluation, translation",
            "telus-international-ai": "Search quality, ads evaluation, multilingual",
          },
        },
      ],
    },
    {
      title: "Pros & cons",
      prosCons: {
        "outlier-ai": {
          pros: [
            "Highest pay among the three — up to $50/hr for expert STEM tiers",
            "Fast onboarding (often under a week)",
            "RLHF and coding tasks suit technical backgrounds",
          ],
          cons: [
            "Project availability can be uneven between qualification tiers",
            "Expert rates require strong STEM credentials",
            "Competitive qualification exams",
          ],
        },
        appen: {
          pros: [
            "Long-running platform with diverse project types",
            "Steady microtask volume once onboarded",
            "Good entry point for first-time annotators",
          ],
          cons: [
            "Lower hourly pay than Outlier or Alignerr",
            "Onboarding often takes 2–6 weeks",
            "Project availability varies by locale and skill",
          ],
        },
        "telus-international-ai": {
          pros: [
            "Consistent search and ads evaluation projects",
            "Moderate pay with predictable task flow",
            "Multilingual tasks for non-English speakers",
          ],
          cons: [
            "Slower onboarding (up to 8 weeks)",
            "Pay ceiling lower than Outlier",
            "Less variety than Appen's project catalog",
          ],
        },
      },
    },
  ],
  faq: [
    {
      question: "Which pays the most for India-based workers?",
      answer:
        "Outlier AI typically pays the most ($20–50/hr), especially for RLHF and coding tasks. TELUS International AI sits in the middle ($12–15/hr), and Appen is often lower ($9–20/hr) but offers more steady volume.",
    },
    {
      question: "Which platform has the fastest onboarding?",
      answer:
        "Outlier AI is fastest at 1–7 days. Appen and TELUS International AI both commonly take 2–8 weeks depending on project demand and qualification exams.",
    },
    {
      question: "Can I work on more than one platform at once?",
      answer:
        "Yes — many India-based annotators stack Outlier for high-pay RLHF work with Appen or TELUS for filler volume. Check each platform's exclusivity rules before committing.",
    },
  ],
};

const OUTLIER_VS_ALIGNERR: GigComparison = {
  slug: "outlier-vs-alignerr",
  title: "Outlier AI vs Alignerr",
  metaDescription:
    "Outlier AI vs Alignerr for RLHF gigs in India — compare pay, onboarding speed, task focus, and which platform fits your background.",
  intro:
    "Both platforms focus on RLHF and reasoning evaluation, accept workers from India, and pay well above typical annotation rates. Outlier tends to pay more and onboard faster; Alignerr emphasizes ethics and decision-making tasks via Labelbox.",
  platformSlugs: ["outlier-ai", "alignerr"],
  sections: [
    {
      title: "At a glance",
      rows: [
        {
          label: "Pay (USD/hr)",
          values: {
            "outlier-ai": "$20–50/hr",
            alignerr: "$20–35/hr",
          },
        },
        {
          label: "India eligibility",
          values: {
            "outlier-ai": "Accepted",
            alignerr: "Accepted",
          },
        },
        {
          label: "Onboarding",
          values: {
            "outlier-ai": "1–7 days",
            alignerr: "7–28 days",
          },
        },
        {
          label: "Task types",
          values: {
            "outlier-ai": "RLHF, SFT, coding, math, writing",
            alignerr: "Reasoning, decision-making, ethics evaluation",
          },
        },
      ],
    },
    {
      title: "Pros & cons",
      prosCons: {
        "outlier-ai": {
          pros: [
            "Higher pay ceiling ($50/hr expert tier)",
            "Faster onboarding",
            "Broader task variety including coding",
          ],
          cons: [
            "Qualification can be competitive",
            "Scale AI ecosystem — policies change with parent company",
          ],
        },
        alignerr: {
          pros: [
            "Strong focus on reasoning and ethics tasks",
            "Backed by Labelbox — stable RLHF pipeline",
            "Good pay floor ($20/hr)",
          ],
          cons: [
            "Slower onboarding than Outlier",
            "Lower pay ceiling than Outlier expert tier",
            "Smaller platform with fewer open projects",
          ],
        },
      },
    },
  ],
  faq: [
    {
      question: "Is Outlier or Alignerr better for India?",
      answer:
        "Both accept India. Choose Outlier if you want faster onboarding and higher peak pay; choose Alignerr if you prefer reasoning and ethics evaluation tasks and don't mind a longer wait to start.",
    },
    {
      question: "Do I need a STEM degree for either platform?",
      answer:
        "Outlier's highest tiers often require STEM credentials. Alignerr focuses on reasoning quality — strong analytical skills matter more than a specific degree, but both platforms use qualification exams.",
    },
  ],
};

const COMPARISONS: GigComparison[] = [
  OUTLIER_VS_APPEN_VS_TELUS,
  OUTLIER_VS_ALIGNERR,
];

export function getAllComparisons(): GigComparison[] {
  return COMPARISONS;
}

export function getComparisonSlugs(): string[] {
  return COMPARISONS.map((c) => c.slug);
}

export function getComparisonBySlug(slug: string): GigComparison | undefined {
  return COMPARISONS.find((c) => c.slug === slug);
}

export function comparisonJsonLd(comparison: GigComparison, baseUrl: string) {
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: comparison.title,
    description: comparison.metaDescription,
    url: `${baseUrl}/ai-gigs/compare/${comparison.slug}`,
    publisher: {
      "@type": "Organization",
      name: "RemoteForge",
      url: baseUrl,
    },
  };

  const faq =
    comparison.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: comparison.faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null;

  return faq ? [article, faq] : [article];
}
