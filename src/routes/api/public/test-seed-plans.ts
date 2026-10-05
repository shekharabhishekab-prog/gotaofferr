import { createFileRoute } from '@tanstack/react-router';
import { rzp } from '@/lib/razorpay.server';
import { pricingForCurrency, amountFor, type PlanId } from '@/lib/pricing-currency';

// TEST-ONLY helper. Does nothing unless the preview TEST Razorpay keys are present
// (they never exist on production). Creates TEST plans and returns their ids.
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NOK', 'BRL', 'MXN', 'AED', 'ZAR', 'SGD'];
const TIERS: PlanId[] = ['starter', 'job_hunt', 'career_pro'];

export const Route = createFileRoute('/api/public/test-seed-plans')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const tid = process.env['RAZORPAY_TEST_KEY_ID'] || '';
        if (!tid.startsWith('rzp_test_') || !process.env['RAZORPAY_TEST_KEY_SECRET']) {
          return new Response('Not found', { status: 404 });
        }
        const url = new URL(request.url);
        if (url.searchParams.get('reset') === 'qa') {
          // TEST-only (route 404s without TEST keys): ends the QA test account's subscription row.
          const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
          const { data: list } = await (supabaseAdmin as any).auth.admin.listUsers({ page: 1, perPage: 200 });
          const u = (list?.users ?? []).find((x: any) => x.email === 'mailboss@mail.instinct.com');
          if (!u) return new Response('{"err":"no user"}');
          const { error } = await (supabaseAdmin as any)
            .from('subscriptions')
            .update({ status: 'canceled', current_period_end: new Date(Date.now() - 60000).toISOString() })
            .eq('user_id', u.id);
          return new Response(JSON.stringify({ ok: !error, err: error?.message }));
        }
        const subq = url.searchParams.get('sub');
        if (subq && /^sub_[A-Za-z0-9]+$/.test(subq)) {
          try {
            const r: any = await rzp(`/subscriptions/${subq}`);
            return new Response(JSON.stringify({ id: r.id, status: r.status, plan_id: r.plan_id, paid_count: r.paid_count, ended_at: r.ended_at, notes: r.notes }));
          } catch (e) {
            return new Response(JSON.stringify({ err: e instanceof Error ? e.message : String(e) }));
          }
        }
        const diag = url.searchParams.get('diag');
        if (diag) {
          const { planIdFor } = await import('@/lib/razorpay.server');
          try {
            const r = await rzp<any>('/subscriptions', {
              method: 'POST',
              body: { plan_id: planIdFor(diag), total_count: 12, customer_notify: 0 },
            });
            return new Response(JSON.stringify({ ok: true, id: r.id, plan: planIdFor(diag) }));
          } catch (e) {
            return new Response(JSON.stringify({ plan: planIdFor(diag), err: e instanceof Error ? e.message : String(e) }));
          }
        }
        const only = url.searchParams.get('cur');
        const out: Record<string, string> = {};
        const errors: Record<string, string> = {};
        const jobs: Array<[string, string, PlanId, boolean]> = [];
        for (const c of only ? only.split(',') : CURRENCIES)
          for (const t of TIERS) {
            jobs.push([`${t}_${c.toLowerCase()}_monthly`, c, t, false]);
            if (c === 'INR') jobs.push([`${t}_inr_festival_monthly`, c, t, true]);
          }
        for (const [key, cur, tier, fest] of jobs) {
          try {
            const amt = amountFor(pricingForCurrency(cur), tier, 'month', fest);
            const p = await rzp<any>('/plans', {
              method: 'POST',
              body: {
                period: 'monthly',
                interval: 1,
                item: { name: `TEST ${key}`, amount: Math.round(amt * ((url.searchParams.get('zd') ? 1 : 100))), currency: cur },
              },
            });
            out[key] = p.id;
          } catch (e) {
            errors[key] = e instanceof Error ? e.message : 'failed';
          }
        }
        return new Response(JSON.stringify({ overrides: out, errors }), {
          headers: { 'Content-Type': 'application/json' },
        });
      },
    },
  },
});
