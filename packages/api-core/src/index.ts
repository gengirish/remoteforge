export { ok, fail, type ApiResponse } from "./response";
export { computeMatchScore } from "./match-score";
export {
  handleCompaniesIndia,
  handleDigest,
  handleAffiliateSettingsGet,
  handleAffiliateSettingsUpdate,
  handleFeaturedCreateOrder,
  handleGigAffiliateUpdate,
  handleGigSlugs,
  handleGigsGet,
  handleGoRedirect,
  handleHealth,
  handleHome,
  handleIngest,
  handleInternalStats,
  handleJobBySlug,
  handleJobSlugs,
  handleJobsGet,
  handleRazorpayWebhook,
  handleRecommendedJobs,
  handleSubscribe,
  handleUpsertProfile,
  handleGetProfile,
  handleToggleSavedJob,
  handleGetSavedJobs,
} from "./handlers";
export { getAffiliateSettingsForAdmin, loadAffiliateSettings } from "./affiliate-config";
