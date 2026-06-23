import {
  getEnvAffiliateSettings,
  JOB_BOARD_AFFILIATES,
  type AffiliateSettings,
} from "@intelliforge/affiliate-links";
import { prisma } from "./client";

export async function loadAffiliateSettings(): Promise<AffiliateSettings> {
  const rows = await prisma.productSetting.findMany({
    where: { group: "affiliate" },
    select: { key: true, value: true },
  });
  const rowByKey = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const env = getEnvAffiliateSettings();
  const result: AffiliateSettings = {};

  for (const def of JOB_BOARD_AFFILIATES) {
    if (def.key in rowByKey) {
      result[def.settingsField] = rowByKey[def.key] || null;
    } else {
      result[def.settingsField] = env[def.settingsField] ?? null;
    }
  }

  return result;
}
