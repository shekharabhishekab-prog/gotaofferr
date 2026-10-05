import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { TESTING_UNLOCK_ALL_PLANS, TESTING_PLAN_PRICE_ID } from '@/lib/access';
import {
  type StripeEnv,
  planIdFor,
  getPaymentsErrorMessage,
  rzp,
  totalCountFor,
} from '@/lib/razorpay.server';
import { isEntitled, isFestivalPriceId, isPaymentFailing, planChangeKind, tierForPriceId, type PlanTier } from '@/lib/plans';
import { isFestivalActive } from '@/lib/festival-pricing';
import { z } from 'zod';

const checkoutInputSchema = z
  .object({
    priceId: z.string().trim().min(1).max(80),
    environment: z.enum(['live', 'sandbox']).optional(),
  })
  .strict();

type SubscriptionStatusResult =
  | {
      active: boolean;
      plan: string | null;
      tier: PlanTier;
      currentPeriodEnd: string | null;
      status: string | null;
      cancelAtPeriodEnd?: boolean;
      paymentFailing?: boolean;
      error?: never;
    }
  | {
      error: string;
      active?: never;
      plan?: never;
      tier?: never;
      currentPeriodEnd?: never;
      status?: never;
      cancelAtPeriodEnd?: never;
      paymentFailing?: never;
    };

/** Latest subscription row for the signed-in user in this environment. */
async function latestSubscription(supabase: any, userId: string, environment: StripeEnv) {
  const { data } = await supabase
    .from('subscriptions')
    .select(
      'stripe_subscription_id, stripe_customer_id, status, price_id, current_period_end, cancel_at_period_end',
    )
    .eq('user_id', userId)
    .eq('environment', environment)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}

/** Finds or creates the Razorpay customer for this signed-in user. */
async function resolveCustomer(email?: string, name?: string): Promise<string | undefined> {
  if (!email) return undefined;
  try {
    const created = await rzp<any>('/customers', {
      method: 'POST',
      body: { email, ...(name ? { name } : {}), fail_existing: 0 },
    });
    return created?.id;
  } catch {
    // A customer record is a nicety (prefill); never block checkout on it.
    return undefined;
  }
}

type CheckoutResult =
  | { subscriptionId: string; keyId: string; prefill: { email?: string; name?: string } }
  | { error: string };

/**
 * Creates a Razorpay subscription in `created` state. The browser then opens
 * Razorpay Checkout with this ID to authorise the mandate / first payment.
 */
export const createSubscriptionCheckout = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const data = checkoutInputSchema.parse(input);
    if (!planIdFor(data.priceId)) throw new Error('Unknown plan');
    // Festival pricing is only purchasable while the offer window is open.
    if (data.priceId.endsWith('_yearly')) {
      throw new Error('Yearly billing is no longer available. Please choose the monthly plan.');
    }
    if (isFestivalPriceId(data.priceId) && !isFestivalActive(Date.now(), 'IN')) {
      throw new Error('That festival offer has ended.');
    }
    return data;
  })
  .handler(async ({ data, context }): Promise<CheckoutResult> => {
    const environment: StripeEnv = data.environment ?? 'live';
    try {
      const { enforcePolicy } = await import('@/lib/rate-limit.server');
      await enforcePolicy('payments-checkout', context.userId);
      const existing = await latestSubscription(context.supabase, context.userId, environment);
      if (isEntitled(existing) && existing?.stripe_subscription_id) {
        return {
          error:
            'You already have an active plan. Use "Switch plan" to move between Job Hunt and Career Pro Packs.',
        };
      }

      const {
        data: { user },
      } = await context.supabase.auth.getUser();
      const email = user?.email ?? undefined;
      const name = (user?.user_metadata as any)?.full_name ?? undefined;
      const customerId = await resolveCustomer(email, name);

      const subscription = await rzp<any>('/subscriptions', {
        method: 'POST',
        body: {
          plan_id: planIdFor(data.priceId),
          total_count: totalCountFor(data.priceId),
          customer_notify: 1,
          ...(customerId ? { customer_id: customerId } : {}),
          notes: {
            userId: context.userId,
            lookup_key: data.priceId,
            ...(email ? { email } : {}),
            ...(name ? { name } : {}),
          },
        },
      });

      return {
        subscriptionId: subscription.id,
        keyId: process.env['RAZORPAY_KEY_ID']!,
        prefill: { ...(email && { email }), ...(name && { name }) },
      };
    } catch (error) {
      return { error: getPaymentsErrorMessage(error) };
    }
  });

// No id is a valid call: the handler then falls back to the newest
// subscription row for this user, which is what /checkout/return relies on
// when Razorpay does not hand back a subscription id in the URL.
const syncSubscriptionSchema = z
  .object({
    environment: z.enum(['live', 'sandbox']).optional(),
    subscriptionId: z.string().trim().max(64).optional(),
    sessionId: z.string().trim().max(64).optional(),
  })
  .strict();

/**
 * Reads the subscription straight from Razorpay and writes it into the
 * database, so entitlement is right even if the webhook is late or lost.
 */
export const syncSubscription = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => syncSubscriptionSchema.parse(input))
  .handler(async ({ data, context }): Promise<{ synced: boolean; status?: string | null; error?: string }> => {
    const environment: StripeEnv = data.environment ?? 'live';
    const id = data.subscriptionId ?? data.sessionId;
    try {
      let subscription: any = null;
      if (id && /^sub_[A-Za-z0-9]+$/.test(id)) {
        subscription = await rzp<any>(`/subscriptions/${id}`);
        // Fail closed: an explicitly supplied subscription id must be tagged
        // with this exact user. A missing owner tag is a denial, not a pass.
        if (subscription?.notes?.userId !== context.userId) {
          return { synced: false, error: 'Subscription does not belong to this account' };
        }
      } else {
        const row = await latestSubscription(context.supabase, context.userId, environment);
        if (!row?.stripe_subscription_id) return { synced: false };
        subscription = await rzp<any>(`/subscriptions/${row.stripe_subscription_id}`);
      }
      if (!subscription) return { synced: false };

      const { upsertRazorpaySubscriptionRow } = await import('@/lib/subscription-sync.server');
      const result = await upsertRazorpaySubscriptionRow(subscription, environment, context.userId);
      return { synced: result.ok, status: subscription.status, ...(result.reason && { error: result.reason }) };
    } catch (error) {
      return { synced: false, error: getPaymentsErrorMessage(error) };
    }
  });

type PlanChangeResult =
  | { ok: true; kind: 'upgrade' | 'downgrade'; effective: 'now' | 'period_end'; effectiveDate: string | null }
  | { ok?: never; error: string; needsCheckout?: boolean };

/**
 * Moves an existing subscriber between plans on the SAME Razorpay
 * subscription: upgrades apply immediately, downgrades at the cycle end.
 */
export const changePlan = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { priceId: string; environment?: StripeEnv }) => {
    if (!planIdFor(data.priceId)) throw new Error('Unknown plan');
    // Festival pricing is only purchasable while the offer window is open.
    if (data.priceId.endsWith('_yearly')) {
      throw new Error('Yearly billing is no longer available. Please choose the monthly plan.');
    }
    if (isFestivalPriceId(data.priceId) && !isFestivalActive(Date.now(), 'IN')) {
      throw new Error('That festival offer has ended.');
    }
    return data;
  })
  .handler(async ({ data, context }): Promise<PlanChangeResult> => {
    const environment: StripeEnv = data.environment ?? 'live';
    const current = await latestSubscription(context.supabase, context.userId, environment);
    if (!current?.stripe_subscription_id || !isEntitled(current)) {
      return { error: 'No active subscription to switch. Start a new plan instead.', needsCheckout: true };
    }

    const kind = planChangeKind(current.price_id, data.priceId);
    if (kind === 'same') return { error: "You're already on this plan." };

    try {
      const updated = await rzp<any>(`/subscriptions/${current.stripe_subscription_id}`, {
        method: 'PATCH',
        body: {
          plan_id: planIdFor(data.priceId),
          schedule_change_at: kind === 'upgrade' ? 'now' : 'cycle_end',
          customer_notify: 1,
        },
      });

      const { upsertRazorpaySubscriptionRow } = await import('@/lib/subscription-sync.server');
      await upsertRazorpaySubscriptionRow(updated, environment, context.userId);

      return kind === 'upgrade'
        ? { ok: true, kind, effective: 'now', effectiveDate: null }
        : { ok: true, kind, effective: 'period_end', effectiveDate: current.current_period_end ?? null };
    } catch (error) {
      const message = getPaymentsErrorMessage(error);
      // UPI-mandate subscriptions cannot be patched to another plan by the
      // gateway. Send the user through a fresh checkout for the new plan instead.
      const cannotUpdateInPlace =
        /payment mode is upi|cannot be updated|not allowed to update|update.*not supported/i.test(message);
      if (cannotUpdateInPlace) {
        return {
          error:
            'Your current plan is paid by UPI autopay, which cannot be switched in place. Continue to checkout to start the new plan, then cancel the old one from Account → Subscription.',
          needsCheckout: true,
        };
      }
      return { error: message };
    }
  });

export const getSubscriptionStatus = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { environment?: StripeEnv }) => data)
  .handler(async ({ data, context }): Promise<SubscriptionStatusResult> => {
    try {
      // Temporary testing switch — see src/lib/access.ts
      if (TESTING_UNLOCK_ALL_PLANS) {
        return {
          active: true,
          plan: TESTING_PLAN_PRICE_ID,
          tier: tierForPriceId(TESTING_PLAN_PRICE_ID),
          currentPeriodEnd: null,
          status: 'active',
          cancelAtPeriodEnd: false,
          paymentFailing: false,
        };
      }
      const { getCompedGrant } = await import('@/lib/access.server');
      const comped = getCompedGrant((context.claims as any)?.email);
      if (comped) {
        return {
          active: true,
          plan: comped.priceId,
          tier: tierForPriceId(comped.priceId),
          currentPeriodEnd: comped.expiresAt,
          status: 'active',
          cancelAtPeriodEnd: false,
          paymentFailing: false,
        };
      }

      const sub = await latestSubscription(context.supabase, context.userId, data.environment ?? 'live');

      return {
        active: isEntitled(sub),
        plan: sub?.price_id ?? null,
        tier: tierForPriceId(sub?.price_id),
        currentPeriodEnd: sub?.current_period_end ?? null,
        status: sub?.status ?? null,
        cancelAtPeriodEnd: sub?.cancel_at_period_end ?? false,
        paymentFailing: isPaymentFailing(sub),
      };
    } catch (error) {
      const { safeErrorMessage } = await import('@/lib/safe-error.server');
      return { error: safeErrorMessage('subscriptionStatus', error, 'Failed to load subscription') };
    }
  });

type AutoRenewResult =
  | { ok: true; cancelAtPeriodEnd: boolean; currentPeriodEnd: string | null }
  | { ok?: never; error: string };

/**
 * Turns auto-renewal off. Access is kept until the end of the paid period —
 * we never revoke immediately. Razorpay cannot un-cancel a subscription, so
 * turning renewal back on means starting a fresh plan.
 */
export const setAutoRenew = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    environment?: StripeEnv;
    autoRenew: boolean;
    reason?: string;
    feedback?: string;
  }) => data)
  .handler(async ({ data, context }): Promise<AutoRenewResult> => {
    const environment: StripeEnv = data.environment ?? 'live';
    const { supabase, userId } = context;
    const sub = await latestSubscription(supabase, userId, environment);
    if (!sub?.stripe_subscription_id) return { error: 'No active subscription found' };

    if (data.autoRenew) {
      return {
        error:
          'Renewal cannot be switched back on once cancelled. You keep access until the end of the paid period — after that, start the plan again from the pricing page.',
      };
    }

    try {
      const cancelled = await rzp<any>(`/subscriptions/${sub.stripe_subscription_id}/cancel`, {
        method: 'POST',
        body: { cancel_at_cycle_end: 1 },
      });

      const { upsertRazorpaySubscriptionRow } = await import('@/lib/subscription-sync.server');
      await upsertRazorpaySubscriptionRow(cancelled, environment, userId, { cancelAtPeriodEnd: true });

      const end = cancelled?.current_end ? new Date(cancelled.current_end * 1000).toISOString() : sub.current_period_end ?? null;
      return { ok: true, cancelAtPeriodEnd: true, currentPeriodEnd: end };
    } catch (error) {
      return { error: getPaymentsErrorMessage(error) };
    }
  });

