import { JOB_BOARD_AFFILIATES } from "@intelliforge/affiliate-links";
import { prisma } from "../src/index";

const platforms = [
  {
    slug: "outlier-ai",
    name: "Outlier AI",
    description:
      "Scale AI's Outlier platform offers RLHF, SFT evaluation, and coding tasks. One of the highest-paying AI gig platforms open to India.",
    type: "rlhf",
    specialties: ["code", "math", "writing", "reasoning"],
    indiaAccepted: true,
    payMin: 2000,
    payMax: 5000,
    payNote: "Expert tier $40-50/hr requires STEM PhD",
    onboardingDays: "1-7",
    referralUrl: process.env.OUTLIER_REFERRAL_URL ?? null,
    trustpilotScore: 3.8,
    isFeatured: true,
    sortOrder: 1,
  },
  {
    slug: "appen",
    name: "Appen",
    description:
      "Global crowdsourcing platform for image annotation, search evaluation, and translation tasks. Lower pay but steady volume.",
    type: "annotation",
    specialties: ["image", "text", "translation", "search"],
    indiaAccepted: true,
    payMin: 900,
    payMax: 2000,
    onboardingDays: "14-42",
    onboardingNote: "Onboarding can take 2-6 weeks; project availability varies",
    trustpilotScore: 3.2,
    sortOrder: 2,
  },
  {
    slug: "telus-international-ai",
    name: "TELUS International AI",
    description:
      "Search quality and ads evaluation tasks. Moderate pay with consistent project flow for India-based annotators.",
    type: "evaluator",
    specialties: ["search", "ads", "multilingual"],
    indiaAccepted: true,
    payMin: 1200,
    payMax: 1500,
    onboardingDays: "14-56",
    sortOrder: 3,
  },
  {
    slug: "alignerr",
    name: "Alignerr",
    description:
      "Labelbox's RLHF platform focusing on reasoning, decision-making, and ethics evaluation tasks.",
    type: "rlhf",
    specialties: ["reasoning", "decision", "ethics"],
    indiaAccepted: true,
    payMin: 2000,
    payMax: 3500,
    onboardingDays: "7-28",
    sortOrder: 4,
  },
  {
    slug: "dataannotation-tech",
    name: "DataAnnotation.tech",
    description:
      "High-paying annotation platform for US/UK/CA/AU/NZ residents only. Not available in India.",
    type: "annotation",
    specialties: ["code", "math", "writing"],
    indiaAccepted: false,
    indiaPayNote: "US/UK/CA/AU/NZ only — not available in India",
    payMin: 2000,
    payMax: 4000,
    onboardingDays: "3-14",
    sortOrder: 5,
  },
  {
    slug: "prolific",
    name: "Prolific",
    description:
      "Academic research surveys and studies. Same-day onboarding, lower volume but high trust scores.",
    type: "evaluator",
    specialties: ["research", "surveys"],
    indiaAccepted: true,
    payMin: 800,
    payMax: 1500,
    onboardingDays: "1-2",
    trustpilotScore: 4.6,
    sortOrder: 6,
  },
  {
    slug: "toloka",
    name: "Toloka",
    description:
      "Yandex micro-task platform. Very low pay but instant onboarding and no experience required.",
    type: "microtask",
    specialties: ["image", "text", "microtask"],
    indiaAccepted: true,
    payMin: 100,
    payMax: 500,
    onboardingDays: "1",
    sortOrder: 7,
  },
];

async function main() {
  console.log("Seeding gig platforms...");

  for (const platform of platforms) {
    await prisma.gigPlatform.upsert({
      where: { slug: platform.slug },
      create: platform,
      update: platform,
    });
  }

  console.log(`Seeded ${platforms.length} gig platforms.`);

  console.log("Seeding affiliate product settings...");
  for (const def of JOB_BOARD_AFFILIATES) {
    await prisma.productSetting.upsert({
      where: { key: def.key },
      create: {
        key: def.key,
        value: process.env[def.envKey] ?? null,
        label: def.label,
        description: def.description,
        group: "affiliate",
        sortOrder: def.sortOrder,
      },
      update: {
        label: def.label,
        description: def.description,
        sortOrder: def.sortOrder,
      },
    });
  }
  console.log(`Seeded ${JOB_BOARD_AFFILIATES.length} affiliate settings.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
