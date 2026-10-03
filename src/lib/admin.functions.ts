import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type AdminCtx = { supabase: any; userId: string; claims: Record<string, unknown> };

/** Admin data is only reachable from a session that passed a second factor (AAL2). */
function hasSecondFactor(context: AdminCtx) {
  return String((context.claims as { aal?: string } | undefined)?.aal ?? "") === "aal2";
}

async function hasAdminRole(context: { supabase: any; userId: string }) {
  // Read the caller's own roles through RLS (users can only see their own rows).
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) return false;
  return Boolean(data);
}

async function assertAdmin(context: AdminCtx) {
  if (!(await hasAdminRole(context))) throw new Error("Forbidden");
  if (!hasSecondFactor(context)) throw new Error("Forbidden: two-factor required");
}

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const isAdmin = await hasAdminRole(context);
    return { isAdmin, mfaVerified: isAdmin && hasSecondFactor(context) };
  });


export type AdminUserRow = {
  id: string;
  email: string | null;
  fullName: string | null;
  createdAt: string | null;
  lastSignInAt: string | null;
  runsTotal: number;
  alerts: number;
  plan: string | null;
  planStatus: string | null;
  planEnd: string | null;
};

export const getAdminDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as AdminCtx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { planLabel } = await import("./plans");

    const [{ data: authUsers }, subsRes, profilesRes, runsRes, alertsRes] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      supabaseAdmin
        .from("subscriptions")
        .select(
          "user_id, price_id, status, current_period_end, cancel_at_period_end, environment, created_at",
        )
        .order("created_at", { ascending: false }),
      supabaseAdmin.from("profiles").select("id, full_name"),
      supabaseAdmin.from("tailor_runs").select("user_id, created_at"),
      supabaseAdmin.from("job_alerts").select("user_id, enabled"),
    ]);

    const profiles = new Map((profilesRes.data ?? []).map((p) => [p.id, p.full_name]));
    const subs = subsRes.data ?? [];
    const firstSub = new Map<string, (typeof subs)[number]>();
    for (const s of subs) if (!firstSub.has(s.user_id)) firstSub.set(s.user_id, s);

    const runCounts = new Map<string, number>();
    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);
    let runsThisMonth = 0;
    for (const r of runsRes.data ?? []) {
      runCounts.set(r.user_id, (runCounts.get(r.user_id) ?? 0) + 1);
      if (new Date(r.created_at) >= monthStart) runsThisMonth += 1;
    }

    const alertCounts = new Map<string, number>();
    let activeAlerts = 0;
    for (const a of alertsRes.data ?? []) {
      alertCounts.set(a.user_id, (alertCounts.get(a.user_id) ?? 0) + 1);
      if (a.enabled) activeAlerts += 1;
    }

    const users: AdminUserRow[] = (authUsers?.users ?? []).map((u) => {
      const sub = firstSub.get(u.id);
      return {
        id: u.id,
        email: u.email ?? null,
        fullName: profiles.get(u.id) ?? null,
        createdAt: u.created_at ?? null,
        lastSignInAt: u.last_sign_in_at ?? null,
        runsTotal: runCounts.get(u.id) ?? 0,
        alerts: alertCounts.get(u.id) ?? 0,
        plan: sub ? planLabel(sub.price_id) : null,
        planStatus: sub?.status ?? null,
        planEnd: sub?.current_period_end ?? null,
      };
    });
    users.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

    const activeStatuses = new Set(["active", "trialing", "past_due", "authenticated"]);
    const planBreakdown: Record<string, number> = {};
    let activeSubs = 0;
    for (const [, s] of firstSub) {
      const label = planLabel(s.price_id);
      planBreakdown[label] = (planBreakdown[label] ?? 0) + 1;
      if (activeStatuses.has(String(s.status))) activeSubs += 1;
    }

    return {
      totals: {
        users: users.length,
        activeSubs,
        runsTotal: runsRes.data?.length ?? 0,
        runsThisMonth,
        activeAlerts,
      },
      planBreakdown,
      users,
      subscriptions: subs.slice(0, 100).map((s) => ({
        userId: s.user_id,
        email: users.find((u) => u.id === s.user_id)?.email ?? null,
        plan: planLabel(s.price_id),
        priceId: s.price_id,
        status: s.status,
        environment: s.environment,
        cancelAtPeriodEnd: s.cancel_at_period_end,
        currentPeriodEnd: s.current_period_end,
        createdAt: s.created_at,
      })),
    };
  });
