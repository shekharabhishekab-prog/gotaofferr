/**
 * Server-only access grants. Never import this from client-rendered code —
 * it contains customer email addresses (PII).
 */
import { tierForPriceId } from "./plans";

/**
 * Complimentary (comped) accounts — manually granted plans, no payment.
 * Each grant runs for 1 year from the start date below.
 */
const COMPED_GRANTS: Record<string, { priceId: string; expiresAt: string }> = {
  "shekhar.abhishekab@gmail.com": {
    priceId: "career_pro_inr_monthly",
    expiresAt: "2027-07-30T00:00:00.000Z",
  },
  // QA test account comp for production QA of paid-tier paths (added 2026-10-08, replying to the QA test-account options). Remove this entry to revert.
  "mailboss@mail.instinct.com": {
    priceId: "career_pro_inr_monthly",
    expiresAt: "2027-07-30T00:00:00.000Z",
  },
  "rrak28@gmail.com": {
    priceId: "job_hunt_inr_monthly",
    expiresAt: "2027-07-30T00:00:00.000Z",
  },
};

export type CompedGrant = { priceId: string; expiresAt: string };

/** Returns the active comped grant for an email, or null. */
export function getCompedGrant(email?: string | null): CompedGrant | null {
  if (!email) return null;
  const grant = COMPED_GRANTS[email.trim().toLowerCase()];
  if (!grant) return null;
  if (new Date(grant.expiresAt) <= new Date()) return null;
  return grant;
}

/** True when the comped grant includes Career pro features (AI job finder). */
export function isCompedCareerPro(email?: string | null): boolean {
  const grant = getCompedGrant(email);
  return !!grant && tierForPriceId(grant.priceId) === "career_pro";
}
