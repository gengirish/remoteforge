import { prisma } from "./client";

export const USD_INR_PAIR = "USD_INR";
const DEFAULT_USD_INR_RATE = 84;
const STALE_HOURS = 24;

export function getUsdToInrRateFromEnv(): number {
  const rate = Number(process.env.USD_TO_INR_RATE ?? DEFAULT_USD_INR_RATE);
  return Number.isFinite(rate) && rate > 0 ? rate : DEFAULT_USD_INR_RATE;
}

export async function getLatestExchangeRate(
  pair: string = USD_INR_PAIR,
): Promise<number | null> {
  const row = await prisma.exchangeRate.findUnique({ where: { pair } });
  if (!row || row.rate <= 0) return null;
  return row.rate;
}

export async function getUsdToInrRate(): Promise<number> {
  const dbRate = await getLatestExchangeRate();
  return dbRate ?? getUsdToInrRateFromEnv();
}

export async function isExchangeRateStale(
  pair: string = USD_INR_PAIR,
  maxAgeHours = STALE_HOURS,
): Promise<boolean> {
  const row = await prisma.exchangeRate.findUnique({ where: { pair } });
  if (!row) return true;
  const ageMs = Date.now() - row.fetchedAt.getTime();
  return ageMs > maxAgeHours * 60 * 60 * 1000;
}

export async function upsertExchangeRate(
  pair: string,
  rate: number,
  source: string,
): Promise<void> {
  await prisma.exchangeRate.upsert({
    where: { pair },
    create: { pair, rate, source },
    update: { rate, source, fetchedAt: new Date() },
  });
}
