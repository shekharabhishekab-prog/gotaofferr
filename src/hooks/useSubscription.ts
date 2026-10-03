import { useCallback, useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { getStripeEnvironment } from '@/lib/stripe';
import { getSubscriptionStatus } from '@/lib/payments.functions';
import { useSession } from '@/hooks/useSession';
import { planLabel, type PlanTier } from '@/lib/plans';

export function useSubscription() {
  const { session } = useSession();
  const check = useServerFn(getSubscriptionStatus);
  const [state, setState] = useState<{
    active: boolean;
    plan: string | null;
    tier: PlanTier;
    currentPeriodEnd: string | null;
    status: string | null;
    cancelAtPeriodEnd: boolean;
    paymentFailing: boolean;
    loading: boolean;
    error: string | null;
  }>({
    active: false,
    plan: null,
    tier: 'free',
    currentPeriodEnd: null,
    status: null,
    cancelAtPeriodEnd: false,
    paymentFailing: false,
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    if (!session) {
      setState((s) => ({
        ...s,
        loading: false,
        active: false,
        plan: null,
        tier: 'free',
        status: null,
        paymentFailing: false,
      }));
      return;
    }
    try {
      const res = await check({ data: { environment: getStripeEnvironment() } });
      if ('error' in res && res.error) {
        setState((s) => ({ ...s, loading: false, error: res.error ?? null }));
      } else {
        setState((s) => ({
          ...s,
          loading: false,
          error: null,
          active: Boolean(res.active),
          plan: res.plan ?? null,
          tier: (res.tier ?? 'free') as PlanTier,
          currentPeriodEnd: res.currentPeriodEnd ?? null,
          status: res.status ?? null,
          cancelAtPeriodEnd: Boolean(res.cancelAtPeriodEnd),
          paymentFailing: Boolean(res.paymentFailing),
        }));
      }
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load subscription',
      }));
    }
  }, [session, check]);

  useEffect(() => {
    let alive = true;
    void (async () => {
      await load();
      if (!alive) return;
    })();
    return () => {
      alive = false;
    };
  }, [load]);

  return {
    ...state,
    planName: planLabel(state.plan),
    isSubscribed: state.active,
    refresh: load,
  };
}
