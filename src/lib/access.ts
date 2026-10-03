/**
 * Client-safe access flags. No customer data lives here — comped grants
 * (which contain email addresses) live in src/lib/access.server.ts.
 */

/**
 * Global testing switch is OFF — real subscriptions are enforced for everyone.
 */
export const TESTING_UNLOCK_ALL_PLANS = false;

/** Plan reported to the UI while the testing switch is on. */
export const TESTING_PLAN_PRICE_ID = "career_pro_inr_monthly";

// Plan/tier definitions live in one place — see src/lib/plans.ts
export { tierForPriceId, planLabel, PLAN_PRICE_IDS } from "./plans";
