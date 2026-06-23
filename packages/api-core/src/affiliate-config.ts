import {
  getEnvAffiliateSettings,
  JOB_BOARD_AFFILIATES,
} from "@intelliforge/affiliate-links";
import { prisma } from "@intelliforge/db";

export { loadAffiliateSettings } from "@intelliforge/db";

export async function getAffiliateSettingsForAdmin() {
  const rows = await prisma.productSetting.findMany({
    where: { group: "affiliate" },
    orderBy: { sortOrder: "asc" },
  });
  const rowByKey = Object.fromEntries(rows.map((r) => [r.key, r]));
  const env = getEnvAffiliateSettings();

  const jobBoards = JOB_BOARD_AFFILIATES.map((def) => {
    const row = rowByKey[def.key];
    const envValue = env[def.settingsField] ?? null;
    const dbValue = row?.value ?? null;
    const effectiveValue = row ? dbValue : envValue;

    return {
      key: def.key,
      label: def.label,
      description: def.description,
      domain: def.domain,
      param: def.param,
      value: effectiveValue,
      dbValue,
      envValue,
      source: row ? ("database" as const) : envValue ? ("env" as const) : ("unset" as const),
    };
  });

  const platforms = await prisma.gigPlatform.findMany({
    where: { isActive: true },
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      referralUrl: true,
      affiliateUrl: true,
      referralReward: true,
      indiaAccepted: true,
    },
  });

  return { jobBoards, platforms };
}
