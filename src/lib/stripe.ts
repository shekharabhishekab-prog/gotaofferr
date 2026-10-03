/**
 * Client-side payments configuration.
 *
 * Payments run on our own Razorpay account. This module only exposes the
 * publishable key ID and the environment tag stored on subscription rows.
 * (File name kept so existing imports keep resolving.)
 */

export type StripeEnv = 'sandbox' | 'live';

export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;

/** Environment tag written on subscription rows. */
export function getStripeEnvironment(): StripeEnv {
  return 'live';
}

export function getPaymentsEnvironment(): StripeEnv {
  return getStripeEnvironment();
}
