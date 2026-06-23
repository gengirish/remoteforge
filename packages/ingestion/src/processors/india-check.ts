const US_ONLY_PATTERNS = [
  "us only",
  "united states only",
  "must be located in us",
  "us citizen",
  "us work authorization",
  "must reside in us",
  "not available in india",
];

export function detectIndiaEligibility(
  description: string,
  company: string,
): boolean {
  const text = `${description} ${company}`.toLowerCase();
  return !US_ONLY_PATTERNS.some((pattern) => text.includes(pattern));
}

// Unit test examples (run manually):
// detectIndiaEligibility("US only candidates", "Acme") === false
// detectIndiaEligibility("Remote worldwide", "Acme") === true
// detectIndiaEligibility("Must be located in US", "Corp") === false
