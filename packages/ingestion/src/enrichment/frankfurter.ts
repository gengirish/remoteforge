import {
  getLatestExchangeRate,
  getUsdToInrRateFromEnv,
  isExchangeRateStale,
  upsertExchangeRate,
  USD_INR_PAIR,
} from "@intelliforge/db";

const FRANKFURTER_URL = "https://api.frankfurter.app/latest?from=USD&to=INR";

export async function fetchUsdInrFromFrankfurter(): Promise<number> {
  const res = await fetch(FRANKFURTER_URL, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Frankfurter API error: ${res.status}`);
  }

  const data = (await res.json()) as { rates?: { INR?: number } };
  const rate = data.rates?.INR;
  if (!rate || !Number.isFinite(rate) || rate <= 0) {
    throw new Error("Frankfurter returned invalid INR rate");
  }
  return rate;
}

export interface SyncUsdInrResult {
  updated: boolean;
  rate: number;
  source: "frankfurter" | "cache";
}

/** Refresh USD→INR when missing or older than 24h. */
export async function syncUsdInrRate(): Promise<SyncUsdInrResult> {
  if (!(await isExchangeRateStale())) {
    const cached = await getLatestExchangeRate(USD_INR_PAIR);
    if (cached) return { updated: false, rate: cached, source: "cache" };
  }

  const rate = await fetchUsdInrFromFrankfurter();
  await upsertExchangeRate(USD_INR_PAIR, rate, "frankfurter");
  return { updated: true, rate, source: "frankfurter" };
}
