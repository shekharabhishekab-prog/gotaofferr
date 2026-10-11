// AI Interview attempts per month, by plan. Guests cannot use it (sign-in needed).
export const INTERVIEW_MONTHLY_LIMIT = {
  free: 1,
  starter: 3,
  job_hunt: 8,
  career_pro: 15,
} as const;

export type InterviewTier = keyof typeof INTERVIEW_MONTHLY_LIMIT;

export const INTERVIEW_TIER_LABEL: Record<InterviewTier, string> = {
  free: "Free",
  starter: "Starter",
  job_hunt: "Job Hunt",
  career_pro: "Career Pro",
};

export function interviewLimitMessage(tier: InterviewTier): string {
  const n = INTERVIEW_MONTHLY_LIMIT[tier];
  const base = `You have used all ${n} AI interview${n === 1 ? "" : "s"} on your ${INTERVIEW_TIER_LABEL[tier]} plan this month.`;
  if (tier === "career_pro") return `${base} It resets next month.`;
  return `${base} It resets next month, or upgrade for more.`;
}
