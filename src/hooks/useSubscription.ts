import { useCallback, useEffect, useRef, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { getStripeEnvironment } from '@/lib/stripe';
import { getSubscriptionStatus } from '@/lib/payments.functions';
import { useSession } from '@/hooks/useSession';
import { planLabel, type PlanTier } from '@/lib/plans';

export function useSubscription() {
  const { session, loading: sessionLoading } = useSession();
  const requestVersion = useRef(0);
  const identity = session?.user.id ?? null;
  const check = useServerFn(getSubscriptionStatus);
  const [state, setState] = useState<{
    identity: string | null;
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
    identity: null,
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
    const version = ++requestVersion.current;
    if (sessionLoading) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    if (!session) {
      setState((s) => ({
        ...s,
        identity: null,
        loading: false,
        active: false,
        plan: null,
        tier: 'free',
        status: null,
        paymentFailing: false,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      }));
      return;
    }
    try {
      const res = await check({ data: { environment: getStripeEnvironment() } });
      if (version !== requestVersion.current) return;
      if ('error' in res && res.error) {
        setState((s) => ({ ...s, identity, loading: false, error: res.error ?? null }));
      } else {
        setState((s) => ({
          ...s,
          identity,
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
      if (version !== requestVersion.current) return;
      setState((s) => ({
        ...s,
        identity,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load subscription',
      }));
    }
  }, [session, sessionLoading, identity, check]);

  useEffect(() => {
    let alive = true;
    void (async () => {
      await load();
      if (!alive) return;
    })();
    return () => {
      alive = false;
      requestVersion.current++;
    };
  }, [load]);

  return {
    ...state,
    ...(state.identity !== identity ? { active: false, plan: null, tier: 'free' as PlanTier, currentPeriodEnd: null, status: null, cancelAtPeriodEnd: false, paymentFailing: false, error: null } : {}),
    loading: sessionLoading || state.loading || state.identity !== identity,
    planName: planLabel(state.identity === identity ? state.plan : null),
    isSubscribed: state.identity === identity && state.active,
    refresh: load,
  };
}
