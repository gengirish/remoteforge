interface JobSignals {
  tags: string[];
  salaryMin?: number | null;
  salaryMax?: number | null;
  indiaFriendly: boolean;
  timezoneFriendly?: boolean;
}

interface UserSignals {
  skills: string[];
  targetSalaryMin?: number | null;
  targetSalaryMax?: number | null;
}

export function computeMatchScore(job: JobSignals, user: UserSignals): number {
  let score = 0;

  // Skill overlap (0–50 points)
  if (user.skills.length > 0 && job.tags.length > 0) {
    const userSkillsLower = user.skills.map((s) => s.toLowerCase());
    const jobTagsLower = job.tags.map((t) => t.toLowerCase());
    const matches = userSkillsLower.filter((s) =>
      jobTagsLower.some((t) => t.includes(s) || s.includes(t)),
    );
    score += Math.min(50, Math.round((matches.length / Math.max(user.skills.length, 1)) * 50));
  }

  // India friendly (20 points)
  if (job.indiaFriendly) score += 20;

  // Timezone friendly (10 points)
  if (job.timezoneFriendly) score += 10;

  // Salary fit (0–20 points)
  if (job.salaryMin && user.targetSalaryMin) {
    const jobMid = job.salaryMax ? (job.salaryMin + job.salaryMax) / 2 : job.salaryMin;
    const userMid = user.targetSalaryMax
      ? (user.targetSalaryMin + user.targetSalaryMax) / 2
      : user.targetSalaryMin;
    const diff = Math.abs(jobMid - userMid) / userMid;
    if (diff <= 0.1) score += 20;
    else if (diff <= 0.25) score += 12;
    else if (diff <= 0.5) score += 6;
  }

  return Math.min(100, score);
}
