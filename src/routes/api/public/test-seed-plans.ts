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
        const al = url.searchParams.get('alerts');
        if (al) {
          // TEST-only: drive the job-alert cadence for the QA account.
          const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
          const sb = supabaseAdmin as any;
          const { data: list } = await sb.auth.admin.listUsers({ page: 1, perPage: 200 });
          const u = (list?.users ?? []).find((x: any) => x.email === 'mailboss@mail.instinct.com');
          if (!u) return new Response('{"err":"no user"}');
          if (al === 'seed') {
            await sb.from('job_alerts').delete().eq('user_id', u.id);
            const { data, error } = await sb.from('job_alerts').insert({ user_id: u.id, role: 'Digital Marketing Manager', location: 'New York', local_hour: 0, timezone: 'Asia/Kolkata', enabled: true }).select('id, emails_sent, last_sent_at').single();
            return new Response(JSON.stringify({ data, err: error?.message }));
          }
          if (al === 'age') {
            const { error } = await sb.from('job_alerts').update({ last_sent_at: new Date(Date.now() - 3.1 * 86400000).toISOString() }).eq('user_id', u.id);
            return new Response(JSON.stringify({ aged: !error, err: error?.message }));
          }
          if (al === 'clearusage') {
            const { error } = await (sb as any).from('tailor_usage_log').delete().eq('user_id', u.id);
            return new Response(JSON.stringify({ cleared: !error, err: error?.message }));
          }
          if (al === 'usage') {
            const { data } = await (sb as any).from('ai_model_usage').select('*').eq('day', new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' }));
            return new Response(JSON.stringify(data));
          }
          if (al === 'status') {
            const { data } = await sb.from('job_alerts').select('id, enabled, emails_sent, last_sent_at, completed_at').eq('user_id', u.id);
            return new Response(JSON.stringify({ data, envlen: (process.env.JOB_ALERTS_CRON_SECRET || '').length, resend: !!process.env.RESEND_API_KEY, stamp: 'v3' }));
          }
          if (al === 'run') {
            if (!process.env.JOB_ALERTS_CRON_SECRET) process.env.JOB_ALERTS_CRON_SECRET = 'preview-test-only-' + 'x'.repeat(24);
            const { runDueDigests } = await import('@/lib/job-alert-digest.server');
            return new Response(JSON.stringify(await runDueDigests()));
          }
        }
        const pb = url.searchParams.get('pban');
        if (pb) {
          // TEST-only: drive the suspension ladder for the QA account.
          const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
          const sb = supabaseAdmin as any;
          const { data: list } = await sb.auth.admin.listUsers({ page: 1, perPage: 200 });
          const u = (list?.users ?? []).find((x: any) => x.email === 'mailboss@mail.instinct.com');
          if (!u) return new Response('{"err":"no user"}');
          if (pb === 'reset') {
            await sb.auth.admin.updateUserById(u.id, { app_metadata: { pban: null } });
            return new Response('{"ok":true,"reset":true}');
          }
          if (pb === 'iptest') {
            // TEST-only: 18 strikes with an address hash, then wipe the account state and check the address block alone.
            const { recordStrike, purchaseBlockMessage } = await import('@/lib/purchase-guard.server');
            await sb.auth.admin.updateUserById(u.id, { app_metadata: { ...(u.app_metadata || {}), pban: { strikes: 2, cycles: 5, seen: [] } } });
            await recordStrike(u.id, `ip${Date.now()}`, 'testiphash01');
            await sb.auth.admin.updateUserById(u.id, { app_metadata: { pban: null } });
            const { data: rowChk, error: rowErr } = await sb.from('rate_limits').select('count').eq('bucket', 'ipban').eq('identifier', 'testiphash01');
            const msg = await purchaseBlockMessage(u.id, 'testiphash01');
            const other = await purchaseBlockMessage(u.id, 'someotherhash');
            await sb.from('rate_limits').delete().eq('bucket', 'ipban').eq('identifier', 'testiphash01');
            return new Response(JSON.stringify({ blockedByAddress: msg, otherAddress: other, rowChk, rowErr: rowErr?.message }));
          }
          const n = Math.min(30, Number(pb) || 0);
          const { recordStrike } = await import('@/lib/purchase-guard.server');
          for (let i = 0; i < n; i++) await recordStrike(u.id, `t${Date.now()}_${i}`);
          const { data: again } = await sb.auth.admin.getUserById(u.id);
          return new Response(JSON.stringify({ pban: (again?.user?.app_metadata as any)?.pban ?? null }));
        }
        const cq = url.searchParams.get('cancelsub');
        if (cq && /^sub_[A-Za-z0-9]+$/.test(cq)) {
          try {
            const r: any = await rzp(`/subscriptions/${cq}/cancel`, { method: 'POST', body: { cancel_at_cycle_end: 0 } });
            return new Response(JSON.stringify({ id: r.id, status: r.status }));
          } catch (e) {
            return new Response(JSON.stringify({ err: e instanceof Error ? e.message : String(e) }));
          }
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
// redeploy 1791264784
