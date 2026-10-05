/**
 * Writes Razorpay subscription state into the `subscriptions` table.
 *
 * Server-only. Used by both the webhook route and the post-checkout sync
 * server function so the two paths can never disagree.
 *
 * The `stripe_*` column names are historical; they hold Razorpay IDs now.
 */
import { type StripeEnv, lookupKeyForPlanId, rzp } from '@/lib/razorpay.server';

/** Razorpay status → the vocabulary the entitlement rules in plans.ts use. */
export function normaliseStatus(status?: string | null): string {
  switch (status) {
    case 'active':
    case 'authenticated':
    case 'created':
      return status === 'active' ? 'active' : 'trialing';
    case 'pending':
      return 'past_due';
    case 'halted':
      // Razorpay halts a subscription after its 3 failed retries: no more access.
      return 'unpaid';
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

  const lookupKey = lookupKeyForPlanId(subscription?.plan_id) || subscription?.notes?.lookup_key || '';

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
        options?.cancelAtPeriodEnd ??
        // Razorpay sets end_at on every subscription (total_count cycles ahead), so
        // end_at alone does not mean "cancelled". It only means cancel-at-period-end
        // when the end falls on (or within a day of) the current period's end.
        Boolean(
          subscription.status === 'active' &&
            subscription.end_at &&
            subscription.current_end &&
            subscription.end_at <= subscription.current_end + 86400,
        ),
      environment: env,
      updated_at: new Date().toISOString(),
    } as any,
    { onConflict: 'stripe_subscription_id' },
  );

  if (error) return { ok: false, reason: error.message };

  // Upgrade = a brand new full-price subscription. Once its first payment has
  // gone through (status active), the plan it replaces is cancelled right away
  // so the customer is never billed for two plans. Safe to run many times.
  const replaces = subscription?.notes?.replaces;
  if (
    subscription?.status === 'active' &&
    typeof replaces === 'string' &&
    /^sub_[A-Za-z0-9]+$/.test(replaces) &&
    replaces !== subscription.id
  ) {
    try {
      const { data: old } = await supabaseAdmin
        .from('subscriptions')
        .select('status')
        .eq('stripe_subscription_id', replaces)
        .eq('user_id', userId)
        .eq('environment', env)
        .maybeSingle();
      if (old && old.status !== 'canceled') {
        try {
          await rzp(`/subscriptions/${replaces}/cancel`, { method: 'POST', body: { cancel_at_cycle_end: 0 } });
        } catch (e) {
          console.error('[upgrade] could not cancel replaced subscription', replaces, e);
        }
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'canceled',
            cancel_at_period_end: false,
            current_period_end: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as any)
          .eq('stripe_subscription_id', replaces)
          .eq('user_id', userId)
          .eq('environment', env);
      }
    } catch (e) {
      console.error('[upgrade] replace step failed', e);
    }
  }
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

