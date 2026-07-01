import { getUsdToInrRate as getUsdToInrRateFromDb } from "@intelliforge/db";

const DEFAULT_RATE = 84;

/** Sync fallback for client components (env only). */
export function getUsdToInrRateFromEnv(): number {
  const rate = Number(process.env.USD_TO_INR_RATE ?? DEFAULT_RATE);
  return Number.isFinite(rate) && rate > 0 ? rate : DEFAULT_RATE;
}

/** Server: DB-backed USD→INR with env fallback. */
export async function fetchUsdToInrRate(): Promise<number> {
  try {
    return await getUsdToInrRateFromDb();
  } catch {
    return getUsdToInrRateFromEnv();
  }
}

function resolveRate(inrRate?: number): number {
  if (inrRate != null && inrRate > 0) return inrRate;
  return getUsdToInrRateFromEnv();
}

/** Format USD cents per hour as INR/hr string */
export function usdToInr(centsPerHour: number, inrRate?: number): string {
  const usdPerHour = centsPerHour / 100;
  const inr = usdPerHour * resolveRate(inrRate);
  return `₹${inr.toLocaleString("en-IN", { maximumFractionDigits: 0 })}/hr`;
}

export function formatSalaryRange(
  minCents?: number | null,
  maxCents?: number | null,
  inrRate?: number,
): string | null {
  if (!minCents && !maxCents) return null;

  const fmt = (c: number) => `$${(c / 100).toLocaleString("en-US")}/hr`;

  if (minCents && maxCents) {
    return `${fmt(minCents)}–${fmt(maxCents)} · ${usdToInr(minCents, inrRate)}–${usdToInr(maxCents, inrRate)}`;
  }
  if (minCents) return `${fmt(minCents)} · ${usdToInr(minCents, inrRate)}`;
  if (maxCents) return `Up to ${fmt(maxCents)} · ${usdToInr(maxCents, inrRate)}`;
  return null;
}
