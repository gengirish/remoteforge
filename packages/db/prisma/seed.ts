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
    slug: "mercor",
    name: "Mercor",
    description:
      "Expert hiring and RLHF platform matching specialists to frontier-model training projects. High pay for vetted domain experts in India.",
    type: "rlhf",
    specialties: ["code", "math", "writing", "reasoning", "domain-expert"],
    indiaAccepted: true,
    payMin: 2500,
    payMax: 6000,
    payNote: "Rates vary by expertise tier and project type",
    onboardingDays: "7-21",
    onboardingNote: "Resume screening and skills assessment before project matching",
    referralUrl: process.env.MERCOR_REFERRAL_URL ?? null,
    isFeatured: true,
    sortOrder: 2,
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
    isFeatured: true,
    sortOrder: 3,
  },
  {
    slug: "micro1",
    name: "micro1",
    description:
      "Expert AI training marketplace connecting vetted specialists to model fine-tuning and evaluation work. Strong pay for STEM and coding backgrounds.",
    type: "rlhf",
    specialties: ["code", "math", "writing", "domain-expert"],
    indiaAccepted: true,
    payMin: 2500,
    payMax: 5000,
    onboardingDays: "7-21",
    referralUrl: process.env.MICRO1_REFERRAL_URL ?? null,
    sortOrder: 4,
  },
  {
    slug: "handshake-ai",
    name: "Handshake AI",
    description:
      "Expert evaluation platform for frontier-model benchmarking and rubric-based quality assessment. Open to India-based specialists.",
    type: "evaluator",
    specialties: ["reasoning", "writing", "domain-expert", "benchmarks"],
    indiaAccepted: true,
    payMin: 2000,
    payMax: 4500,
    onboardingDays: "7-28",
    referralUrl: process.env.HANDSHAKE_AI_REFERRAL_URL ?? null,
    sortOrder: 5,
  },
  {
    slug: "mindrift",
    name: "Mindrift",
    description:
      "Toloka's RLHF brand for reasoning, preference ranking, and expert annotation on frontier AI projects. India contributors accepted.",
    type: "rlhf",
    specialties: ["reasoning", "writing", "preference-ranking"],
    indiaAccepted: true,
    payMin: 2000,
    payMax: 4000,
    onboardingDays: "7-21",
    referralUrl: process.env.MINDRIFT_REFERRAL_URL ?? null,
    sortOrder: 6,
  },
  {
    slug: "remotasks",
    name: "Remotasks",
    description:
      "Scale AI's microtask platform for image labeling, LiDAR annotation, and data collection. Fast onboarding with steady task volume in India.",
    type: "annotation",
    specialties: ["image", "lidar", "segmentation", "data-collection"],
    indiaAccepted: true,
    payMin: 800,
    payMax: 2000,
    onboardingDays: "1-7",
    onboardingNote: "Training modules required before paid tasks unlock",
    referralUrl: process.env.REMOTASKS_REFERRAL_URL ?? null,
    sortOrder: 7,
  },
  {
    slug: "neevo",
    name: "Neevo",
    description:
      "Defined.ai (TELUS Digital) evaluator platform for search quality, speech, and AI output rating. India-based workers accepted on select projects.",
    type: "evaluator",
    specialties: ["search", "speech", "rating", "multilingual"],
    indiaAccepted: true,
    payMin: 1000,
    payMax: 1800,
    onboardingDays: "7-28",
    referralUrl: process.env.NEEVO_REFERRAL_URL ?? null,
    sortOrder: 8,
  },
  {
    slug: "oneforma",
    name: "OneForma",
    description:
      "Centific/TransPerfect crowdsourcing hub for transcription, translation, and AI data annotation. Moderate pay with broad project types for India.",
    type: "annotation",
    specialties: ["transcription", "translation", "text", "speech"],
    indiaAccepted: true,
    payMin: 1000,
    payMax: 2200,
    onboardingDays: "7-21",
    referralUrl: process.env.ONEFORMA_REFERRAL_URL ?? null,
    sortOrder: 9,
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
    sortOrder: 10,
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
    sortOrder: 11,
  },
  {
    slug: "crowdgen",
    name: "CrowdGen",
    description:
      "Appen's worker-facing brand for AI training data, search evaluation, and linguistic annotation. India accepted with project-based pay.",
    type: "annotation",
    specialties: ["search", "text", "speech", "linguistics"],
    indiaAccepted: true,
    payMin: 900,
    payMax: 1800,
    onboardingDays: "14-42",
    referralUrl: process.env.CROWDGEN_REFERRAL_URL ?? null,
    sortOrder: 12,
  },
  {
    slug: "babel-audio",
    name: "Babel Audio",
    description:
      "Audio and speech annotation platform for transcription, diarization, and multilingual voice-data projects. India contributors accepted.",
    type: "multilingual",
    specialties: ["speech", "audio", "transcription", "multilingual"],
    indiaAccepted: true,
    payMin: 1200,
    payMax: 2500,
    onboardingDays: "7-21",
    referralUrl: process.env.BABEL_AUDIO_REFERRAL_URL ?? null,
    sortOrder: 13,
  },
  {
    slug: "welo-data",
    name: "Welo Data",
    description:
      "Welo Data (formerly Defined.ai contributor network) for text, speech, and multimodal AI annotation. India-based freelancers accepted.",
    type: "annotation",
    specialties: ["text", "speech", "multimodal", "translation"],
    indiaAccepted: true,
    payMin: 900,
    payMax: 2000,
    onboardingDays: "7-28",
    referralUrl: process.env.WELO_DATA_REFERRAL_URL ?? null,
    sortOrder: 14,
  },
  {
    slug: "rws-trainai",
    name: "RWS TrainAI",
    description:
      "RWS TrainAI multilingual data services for translation, localization, and AI training datasets. India linguists and annotators welcome.",
    type: "multilingual",
    specialties: ["translation", "localization", "text", "multilingual"],
    indiaAccepted: true,
    payMin: 1000,
    payMax: 2000,
    onboardingDays: "7-28",
    referralUrl: process.env.RWS_TRAINAI_REFERRAL_URL ?? null,
    sortOrder: 15,
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
    sortOrder: 16,
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
    sortOrder: 17,
  },
  {
    slug: "surge-ai",
    name: "Surge AI",
    description:
      "B2B RLHF data partner for frontier labs. Does not hire contributors directly — workers typically join via partner platforms like Outlier.",
    type: "rlhf",
    specialties: ["reasoning", "writing", "code", "preference-ranking"],
    indiaAccepted: false,
    indiaPayNote:
      "No direct India signup — apply via partner brands such as Outlier AI or Alignerr",
    payMin: 2000,
    payMax: 5000,
    payNote: "Pay shown is typical for partner-platform workers, not direct Surge hires",
    onboardingDays: "N/A",
    referralUrl: process.env.SURGE_AI_REFERRAL_URL ?? null,
    sortOrder: 18,
  },
  {
    slug: "clickworker",
    name: "Clickworker",
    description:
      "Global microtask marketplace for surveys, categorization, and UGC tasks. Very low pay but instant onboarding for India.",
    type: "microtask",
    specialties: ["surveys", "categorization", "text", "microtask"],
    indiaAccepted: true,
    payMin: 200,
    payMax: 800,
    onboardingDays: "1",
    referralUrl: process.env.CLICKWORKER_REFERRAL_URL ?? null,
    sortOrder: 19,
  },
  {
    slug: "hive-micro",
    name: "Hive Micro",
    description:
      "Hive's microtask platform for image moderation, labeling, and simple AI data tasks. Low pay with quick task turnaround in India.",
    type: "microtask",
    specialties: ["image", "moderation", "labeling", "microtask"],
    indiaAccepted: true,
    payMin: 300,
    payMax: 900,
    onboardingDays: "1-3",
    referralUrl: process.env.HIVE_MICRO_REFERRAL_URL ?? null,
    sortOrder: 20,
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
    sortOrder: 21,
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
