export { prisma, PrismaClient } from "./client";
export { loadAffiliateSettings } from "./affiliate-settings";
export {
  USD_INR_PAIR,
  getUsdToInrRate,
  getUsdToInrRateFromEnv,
  getLatestExchangeRate,
  isExchangeRateStale,
  upsertExchangeRate,
} from "./exchange-rate";
export {
  currentQuotaMonth,
  getApiQuotaUsage,
  acquireApiQuota,
} from "./api-quota";
export type {
  Job,
  GigPlatform,
  JobClick,
  GigClick,
  Subscriber,
  FeaturedSlot,
  ProductSetting,
  UserProfile,
  SavedJob,
  ApplicationRecord,
  ApplicationEvent,
  CompanyProfile,
  SalaryReport,
  GigEarningsReport,
  ReferralCode,
  Referral,
  ReferralWallet,
  SuccessStory,
  EmployerProfile,
  DirectJobPosting,
  EmployerSubscription,
  PremiumSubscription,
  ApiKey,
  ApiKeyUsage,
} from "@prisma/client";
