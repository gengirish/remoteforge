const DEFAULT_RATE = 84;

export function getUsdToInrRate(): number {
  const rate = Number(process.env.USD_TO_INR_RATE ?? DEFAULT_RATE);
  return Number.isFinite(rate) && rate > 0 ? rate : DEFAULT_RATE;
}

/** Format USD cents per hour as INR/hr string */
export function usdToInr(centsPerHour: number): string {
  const usdPerHour = centsPerHour / 100;
  const inr = usdPerHour * getUsdToInrRate();
  return `₹${inr.toLocaleString("en-IN", { maximumFractionDigits: 0 })}/hr`;
}

export function formatSalaryRange(
  minCents?: number | null,
  maxCents?: number | null,
): string | null {
  if (!minCents && !maxCents) return null;

  const fmt = (c: number) => `$${(c / 100).toLocaleString("en-US")}/hr`;

  if (minCents && maxCents) {
    return `${fmt(minCents)}–${fmt(maxCents)} · ${usdToInr(minCents)}–${usdToInr(maxCents)}`;
  }
  if (minCents) return `${fmt(minCents)} · ${usdToInr(minCents)}`;
  if (maxCents) return `Up to ${fmt(maxCents)} · ${usdToInr(maxCents)}`;
  return null;
}
