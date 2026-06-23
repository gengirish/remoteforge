const INDIA_BLOCKER_PATTERNS = [
  "us only",
  "united states only",
  "must be located in us",
  "us citizen",
  "us work authorization",
  "must reside in us",
  "not available in india",
  "us citizens",
  "must be located in",
  "authorized to work in the us",
  "must be based in",
  "us-based only",
  "uk only",
  "eu only",
  "no visa sponsorship",
];

const TIMEZONE_FRIENDLY_PATTERNS = [
  "async",
  "asynchronous",
  "flexible hours",
  "overlap",
  "ist",
  "asia",
  "no timezone requirement",
];

const VISA_SPONSORSHIP_PATTERNS = ["visa sponsorship", "work visa", "sponsor"];

export function detectIndiaEligibility(description: string, company: string): boolean {
  const text = `${description} ${company}`.toLowerCase();
  return !INDIA_BLOCKER_PATTERNS.some((pattern) => text.includes(pattern));
}

export function detectIndiaFriendly(job: {
  indiaFriendly: boolean;
  description: string;
  title: string;
  tags: string[];
}): boolean {
  if (job.indiaFriendly) return true;
  const text = `${job.description} ${job.title}`.toLowerCase();
  if (INDIA_BLOCKER_PATTERNS.some((p) => text.includes(p))) return false;
  return false;
}

export function detectTimezoneFriendly(description: string): boolean {
  const text = description.toLowerCase();
  return TIMEZONE_FRIENDLY_PATTERNS.some((p) => text.includes(p));
}

export function detectVisaSponsorship(description: string): boolean {
  const text = description.toLowerCase();
  if (text.includes("no visa sponsorship")) return false;
  return VISA_SPONSORSHIP_PATTERNS.some((p) => text.includes(p));
}
