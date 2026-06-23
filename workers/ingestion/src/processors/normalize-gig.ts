/** Gig platforms are seeded manually — this processor is for future API imports */

export interface RawGigPlatform {
  name: string;
  slug: string;
  description: string;
  type: string;
  indiaAccepted: boolean;
  payMin: number;
  payMax: number;
  onboardingDays: string;
}

export function normalizeGig(raw: RawGigPlatform) {
  return {
    slug: raw.slug,
    name: raw.name,
    description: raw.description,
    type: raw.type,
    specialties: [] as string[],
    indiaAccepted: raw.indiaAccepted,
    payMin: raw.payMin,
    payMax: raw.payMax,
    onboardingDays: raw.onboardingDays,
  };
}
