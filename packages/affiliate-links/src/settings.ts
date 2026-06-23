export interface AffiliateSettings {
  remotiveTag?: string | null;
  wwrRef?: string | null;
  turingRef?: string | null;
  toptalRef?: string | null;
  remotePartnerCode?: string | null;
  flexjobsId?: string | null;
}

export interface JobBoardAffiliateDef {
  key: string;
  envKey: string;
  settingsField: keyof AffiliateSettings;
  domain: string;
  param: string;
  label: string;
  description: string;
  sortOrder: number;
}

export const JOB_BOARD_AFFILIATES: JobBoardAffiliateDef[] = [
  {
    key: "affiliate.remotive_tag",
    envKey: "AFFILIATE_REMOTIVE_TAG",
    settingsField: "remotiveTag",
    domain: "remotive.com",
    param: "ref",
    label: "Remotive",
    description: "Appends ?ref= to remotive.com job links",
    sortOrder: 1,
  },
  {
    key: "affiliate.wwr_ref",
    envKey: "AFFILIATE_WWR_REF",
    settingsField: "wwrRef",
    domain: "weworkremotely.com",
    param: "ref",
    label: "We Work Remotely",
    description: "Appends ?ref= to weworkremotely.com job links",
    sortOrder: 2,
  },
  {
    key: "affiliate.turing_ref",
    envKey: "AFFILIATE_TURING_REF",
    settingsField: "turingRef",
    domain: "turing.com",
    param: "ref",
    label: "Turing",
    description: "Appends ?ref= to turing.com job links",
    sortOrder: 3,
  },
  {
    key: "affiliate.toptal_ref",
    envKey: "AFFILIATE_TOPTAL_REF",
    settingsField: "toptalRef",
    domain: "toptal.com",
    param: "ref",
    label: "Toptal",
    description: "Appends ?ref= to toptal.com job links",
    sortOrder: 4,
  },
  {
    key: "affiliate.remote_partner_code",
    envKey: "AFFILIATE_REMOTE_PARTNER_CODE",
    settingsField: "remotePartnerCode",
    domain: "remote.com",
    param: "partner",
    label: "Remote.com",
    description: "Appends ?partner= to remote.com job links",
    sortOrder: 5,
  },
  {
    key: "affiliate.flexjobs_id",
    envKey: "AFFILIATE_FLEXJOBS_ID",
    settingsField: "flexjobsId",
    domain: "flexjobs.com",
    param: "aid",
    label: "FlexJobs",
    description: "Appends ?aid= to flexjobs.com job links",
    sortOrder: 6,
  },
];

export function getEnvAffiliateSettings(): AffiliateSettings {
  return {
    remotiveTag: process.env.AFFILIATE_REMOTIVE_TAG || null,
    wwrRef: process.env.AFFILIATE_WWR_REF || null,
    turingRef: process.env.AFFILIATE_TURING_REF || null,
    toptalRef: process.env.AFFILIATE_TOPTAL_REF || null,
    remotePartnerCode: process.env.AFFILIATE_REMOTE_PARTNER_CODE || null,
    flexjobsId: process.env.AFFILIATE_FLEXJOBS_ID || null,
  };
}

export function mergeAffiliateSettings(
  dbValues: Partial<AffiliateSettings>,
): AffiliateSettings {
  const env = getEnvAffiliateSettings();
  return {
    remotiveTag: dbValues.remotiveTag ?? env.remotiveTag,
    wwrRef: dbValues.wwrRef ?? env.wwrRef,
    turingRef: dbValues.turingRef ?? env.turingRef,
    toptalRef: dbValues.toptalRef ?? env.toptalRef,
    remotePartnerCode: dbValues.remotePartnerCode ?? env.remotePartnerCode,
    flexjobsId: dbValues.flexjobsId ?? env.flexjobsId,
  };
}

export function settingsFromDbRows(
  rows: { key: string; value: string | null }[],
): Partial<AffiliateSettings> {
  const byKey = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const result: Partial<AffiliateSettings> = {};
  for (const def of JOB_BOARD_AFFILIATES) {
    if (def.key in byKey) {
      result[def.settingsField] = byKey[def.key] || null;
    }
  }
  return result;
}

export function dbRowsFromSettings(
  settings: Partial<AffiliateSettings>,
): { key: string; value: string | null }[] {
  return JOB_BOARD_AFFILIATES.filter(
    (def) => def.settingsField in settings,
  ).map((def) => ({
    key: def.key,
    value: settings[def.settingsField] ?? null,
  }));
}
