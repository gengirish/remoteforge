import { aiTrainingJobsIndia2026 } from "./ai-training-jobs-india-2026";
import { alignerrApprovalTimeIndia } from "./alignerr-approval-time-india";
import { mercorInterviewTips } from "./mercor-interview-tips";
import { outlierAssessmentFailedIndia } from "./outlier-assessment-failed-india";
import { outlierReviewIndia } from "./outlier-review-india";
import type { Guide } from "./types";

export type { Guide, GuideFaq, GuideSection, GuideSource } from "./types";

export const guides: Guide[] = [
  outlierAssessmentFailedIndia,
  mercorInterviewTips,
  alignerrApprovalTimeIndia,
  outlierReviewIndia,
  aiTrainingJobsIndia2026,
];

export const guideSlugs: string[] = guides.map((g) => g.slug);

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}
