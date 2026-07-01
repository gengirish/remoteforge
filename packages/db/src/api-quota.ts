import { prisma } from "./client";

/** UTC month key, e.g. `2026-07` */
export function currentQuotaMonth(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export async function getApiQuotaUsage(
  provider: string,
  limit: number,
  month = currentQuotaMonth(),
): Promise<{ used: number; limit: number; remaining: number }> {
  const row = await prisma.apiQuotaUsage.findUnique({
    where: { provider_month: { provider, month } },
  });
  const used = row?.used ?? 0;
  const effectiveLimit = row?.limit ?? limit;
  return {
    used,
    limit: effectiveLimit,
    remaining: Math.max(0, effectiveLimit - used),
  };
}

/** Atomically reserve quota; returns false when monthly limit would be exceeded. */
export async function acquireApiQuota(
  provider: string,
  limit: number,
  amount = 1,
  month = currentQuotaMonth(),
): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const row = await tx.apiQuotaUsage.findUnique({
      where: { provider_month: { provider, month } },
    });

    const used = row?.used ?? 0;
    const effectiveLimit = row?.limit ?? limit;

    if (used + amount > effectiveLimit) return false;

    await tx.apiQuotaUsage.upsert({
      where: { provider_month: { provider, month } },
      create: { provider, month, used: amount, limit: effectiveLimit },
      update: { used: { increment: amount } },
    });

    return true;
  });
}
