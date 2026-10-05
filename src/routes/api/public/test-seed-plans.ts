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
      GET: async () => {
        const tid = process.env['RAZORPAY_TEST_KEY_ID'] || '';
        if (!tid.startsWith('rzp_test_') || !process.env['RAZORPAY_TEST_KEY_SECRET']) {
          return new Response('Not found', { status: 404 });
        }
        const out: Record<string, string> = {};
        const errors: Record<string, string> = {};
        const jobs: Array<[string, string, PlanId, boolean]> = [];
        for (const c of CURRENCIES)
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
                item: { name: `TEST ${key}`, amount: Math.round(amt * 100), currency: cur },
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
