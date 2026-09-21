// Fixture data served by the e2e mock API. Shapes follow the Prisma models the
// web app reads (Job, GigPlatform) and the response types in lib/data.ts.

const iso = (d) => new Date(d).toISOString();

export const jobs = [
  {
    id: "job_e2e_backend",
    slug: "senior-backend-engineer-acme-e2e",
    title: "Senior Backend Engineer",
    company: "Acme Remote",
    companyLogo: null,
    description: "<p>Build APIs for a distributed team. Node.js and Postgres.</p>",
    tags: ["node", "postgres", "typescript", "aws", "docker"],
    salaryMin: 4000,
    salaryMax: 6000,
    currency: "USD",
    location: "Remote",
    category: "engineering",
    sourceBoard: "remotive",
    sourceId: "e2e-1",
    sourceUrl: "https://example.com/jobs/1",
    affiliateUrl: null,
    isActive: true,
    isFeatured: false,
    indiaFriendly: true,
    timezoneFriendly: true,
    visaSponsorship: null,
    postedAt: iso("2026-09-01"),
    expiresAt: null,
    lastSeenAt: iso("2026-09-15"),
    createdAt: iso("2026-09-01"),
    updatedAt: iso("2026-09-15"),
  },
  {
    id: "job_e2e_designer",
    slug: "product-designer-globex-e2e",
    title: "Product Designer",
    company: "Globex",
    companyLogo: null,
    description: "<p>Own the design system. US hours only.</p>",
    tags: ["figma"],
    salaryMin: null,
    salaryMax: null,
    currency: "USD",
    location: "Remote (US)",
    category: "design",
    sourceBoard: "weworkremotely",
    sourceId: "e2e-2",
    sourceUrl: "https://example.com/jobs/2",
    affiliateUrl: null,
    isActive: true,
    isFeatured: false,
    indiaFriendly: false,
    timezoneFriendly: false,
    visaSponsorship: null,
    postedAt: iso("2026-09-05"),
    expiresAt: null,
    lastSeenAt: iso("2026-09-15"),
    createdAt: iso("2026-09-05"),
    updatedAt: iso("2026-09-15"),
  },
];

/** Reachable by slug only: expired jobs drop out of listings and the slug list. */
export const closedJob = {
  ...jobs[0],
  id: "job_e2e_closed",
  slug: "closed-support-role-e2e",
  title: "Customer Support Lead",
  company: "Initech",
  category: "support",
  tags: ["support"],
  sourceId: "e2e-3",
  isActive: false,
};

/**
 * A WWR row as stored before the parser decoded entities: the whole body is
 * escaped once, with a hostile payload inside. Reachable by slug only.
 */
export const escapedWwrJob = {
  ...jobs[0],
  id: "job_e2e_escaped",
  slug: "java-developer-twikey-e2e",
  title: "Java Developer",
  company: "Twikey",
  sourceBoard: "wwr",
  sourceId: "e2e-4",
  description:
    '&lt;img src="https://example.com/logo.gif" /&gt; &lt;p&gt;&lt;strong&gt;Headquarters:&lt;/strong&gt; Ghent&lt;/p&gt; ' +
    "&lt;ul&gt;&lt;li&gt;Build the&amp;nbsp;&lt;strong&gt;back-end&lt;/strong&gt;&lt;/li&gt;&lt;/ul&gt; " +
    '&lt;script&gt;window.__xss = 1&lt;/script&gt;&lt;p onclick="window.__xss = 2"&gt;Apply today&lt;/p&gt;',
};

export const gigs = [
  {
    id: "gig_e2e_outlier",
    slug: "outlier-ai",
    name: "Outlier AI",
    logoUrl: null,
    description: "RLHF and coding evaluation tasks for frontier model labs.",
    type: "rlhf",
    specialties: ["coding", "writing"],
    indiaAccepted: true,
    indiaPayNote: null,
    payMin: 1500,
    payMax: 4000,
    payNote: null,
    onboardingDays: "3-7",
    onboardingNote: null,
    referralUrl: null,
    affiliateUrl: null,
    referralReward: null,
    trustpilotScore: 3.4,
    trustpilotCount: 1200,
    founded: 2023,
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
    createdAt: iso("2026-01-01"),
    updatedAt: iso("2026-09-01"),
  },
  {
    id: "gig_e2e_mercor",
    slug: "mercor",
    name: "Mercor",
    logoUrl: null,
    description: "Expert evaluation contracts matched by AI interview.",
    type: "evaluator",
    specialties: ["domain experts"],
    indiaAccepted: true,
    indiaPayNote: null,
    payMin: 2500,
    payMax: 9000,
    payNote: null,
    onboardingDays: "7-14",
    onboardingNote: null,
    referralUrl: null,
    affiliateUrl: null,
    referralReward: null,
    trustpilotScore: null,
    trustpilotCount: null,
    founded: 2023,
    isActive: true,
    isFeatured: false,
    sortOrder: 2,
    createdAt: iso("2026-01-01"),
    updatedAt: iso("2026-09-01"),
  },
  {
    id: "gig_e2e_usonly",
    slug: "us-only-annotator-e2e",
    name: "StateSide Labels",
    logoUrl: null,
    description: "Image annotation for US residents only.",
    type: "annotation",
    specialties: ["images"],
    indiaAccepted: false,
    indiaPayNote: null,
    payMin: 1200,
    payMax: 2000,
    payNote: null,
    onboardingDays: "1-3",
    onboardingNote: null,
    referralUrl: null,
    affiliateUrl: null,
    referralReward: null,
    trustpilotScore: null,
    trustpilotCount: null,
    founded: 2021,
    isActive: true,
    isFeatured: false,
    sortOrder: 3,
    createdAt: iso("2026-01-01"),
    updatedAt: iso("2026-09-01"),
  },
];

export const companies = [
  {
    id: "co_e2e_acme",
    name: "Acme Remote",
    slug: "acme-remote",
    totalJobsPosted: 12,
    indiaFriendlyCount: 9,
    indiaAcceptRate: 0.75,
    avgResponseDays: 6,
  },
];

export const salaryRoles = [
  { roleSlug: "backend-engineer", role: "Backend Engineer", _count: { id: 5 } },
  { roleSlug: "data-annotator", role: "Data Annotator", _count: { id: 1 } },
];

export const salaryByRole = {
  "backend-engineer": {
    roleSlug: "backend-engineer",
    dataPoints: 5,
    median: 42000,
    p25: 30000,
    p75: 55000,
    avg: 43000,
    min: 18000,
    max: 80000,
  },
  "data-annotator": {
    roleSlug: "data-annotator",
    dataPoints: 1,
    message: "Only 1 report so far. We show benchmarks once a role has 3.",
  },
};

export const wins = [
  {
    id: "win_e2e_1",
    displayName: "Priya S.",
    role: "Backend Engineer",
    company: "Acme Remote",
    salaryUsd: 48000,
    city: "Pune",
    story: "Applied to 30 roles over two months; the timezone-friendly ones replied.",
    appliedCount: 30,
    submittedAt: iso("2026-08-20"),
  },
];

export const incomeReport = {
  generatedAt: iso("2026-09-15"),
  dataPoints: { salaryReports: 6, gigReports: 3, applications: 0 },
  topRoles: [
    { roleSlug: "backend-engineer", role: "Backend Engineer", _count: { id: 5 }, _avg: { salaryUsd: 43000 } },
  ],
  topGigPlatforms: [
    { platformId: "gig_e2e_outlier", _count: { id: 3 }, _avg: { earningsUsdMonth: 650 } },
  ],
  recentStories: [
    { displayName: "Priya S.", role: "Backend Engineer", company: "Acme Remote", salaryUsd: 48000, city: "Pune" },
  ],
};

export function gigEarnings(slug) {
  const gig = gigs.find((g) => g.slug === slug);
  if (!gig) return null;
  return {
    platform: { name: gig.name, payMin: gig.payMin, payMax: gig.payMax, payNote: gig.payNote },
    dataPoints: 3,
    median: 650,
    p90: 1400,
    taskBreakdown: [{ taskType: "rlhf", median: 650, count: 3 }],
  };
}

export const internalStats = {
  clicks: { totalJobClicks: 40, totalGigClicks: 25, jobClicksLast7: 8, gigClicksLast7: 5 },
  subscribers: 57,
  intents: {
    prepWaitlist: 23,
    approvalAlerts: 14,
    bySignal: [
      { signal: "prep-waitlist:outlier-ai", count: 11 },
      { signal: "approval-alert:mercor", count: 9 },
    ],
  },
  featuredSlots: [],
  topJobs: [],
  topGigPlatforms: [],
};
