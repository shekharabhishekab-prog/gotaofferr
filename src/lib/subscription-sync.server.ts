/**
 * Writes Razorpay subscription state into the `subscriptions` table.
 *
 * Server-only. Used by both the webhook route and the post-checkout sync
 * server function so the two paths can never disagree.
 *
 * The `stripe_*` column names are historical; they hold Razorpay IDs now.
 */
import { type StripeEnv, lookupKeyForPlanId } from '@/lib/razorpay.server';

/** Razorpay status → the vocabulary the entitlement rules in plans.ts use. */
export function normaliseStatus(status?: string | null): string {
  switch (status) {
    case 'active':
    case 'authenticated':
    case 'created':
      return status === 'active' ? 'active' : 'trialing';
    case 'pending':
    case 'halted':
      return 'past_due';
    case 'cancelled':
      return 'canceled';
    case 'completed':
    case 'expired':
      return 'expired';
    default:
      return status ?? 'unknown';
  }
}

function iso(seconds?: number | null): string | null {
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}

/** Upserts one subscription row from a Razorpay subscription entity. */
export async function upsertRazorpaySubscriptionRow(
  subscription: any,
  env: StripeEnv,
  userIdOverride?: string | null,
  options?: { cancelAtPeriodEnd?: boolean },
): Promise<{ ok: boolean; reason?: string }> {
  const userId = userIdOverride || subscription?.notes?.userId || null;
  if (!userId) return { ok: false, reason: 'no userId on subscription' };

  const lookupKey = subscription?.notes?.lookup_key || lookupKeyForPlanId(subscription?.plan_id) || '';

  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

  const { error } = await supabaseAdmin.from('subscriptions').upsert(
    {
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer_id ?? '',
      product_id: subscription.plan_id ?? '',
      price_id: lookupKey,
      status: normaliseStatus(subscription.status),
      current_period_start: iso(subscription.current_start ?? subscription.start_at),
      current_period_end: iso(subscription.current_end ?? subscription.charge_at ?? subscription.end_at),
      cancel_at_period_end:
        options?.cancelAtPeriodEnd ?? Boolean(subscription.end_at && subscription.status === 'active'),
      environment: env,
      updated_at: new Date().toISOString(),
    } as any,
    { onConflict: 'stripe_subscription_id' },
  );

  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

/** Marks only the payment status, used by invoice/charge events. */
export async function setSubscriptionStatus(
  subscriptionId: string,
  status: string,
  env: StripeEnv,
): Promise<void> {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  await supabaseAdmin
    .from('subscriptions')
    .update({ status, updated_at: new Date().toISOString() } as any)
    .eq('stripe_subscription_id', subscriptionId)
    .eq('environment', env);
}
