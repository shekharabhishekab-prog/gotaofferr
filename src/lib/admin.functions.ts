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
  // Audit trail: every admin data access, and every refused attempt, goes to the Worker logs.
  if (!(await hasAdminRole(context))) {
    console.warn(`[audit] admin access refused: not an admin user=${context.userId}`);
    throw new Error("Forbidden");
  }
  if (!hasSecondFactor(context)) {
    console.warn(`[audit] admin access refused: no second factor user=${context.userId}`);
    throw new Error("Forbidden: two-factor required");
  }
  console.info(`[audit] admin data access user=${context.userId}`);
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
  phone: string | null;
  emailConfirmed: boolean;
  cancelAtPeriodEnd: boolean;
  fullName: string | null;
  createdAt: string | null;
  lastSignInAt: string | null;
  runsTotal: number;
  runsThisMonth: number;
  alertsThisMonth: number;
  searchesThisMonth: number;
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
    const { planLabel, isEntitled } = await import("./plans");

    const { safeError } = await import("./safe-error.server");
    const { getStripeEnvironment } = await import("./stripe");
    async function rows(makeQuery: () => any): Promise<any[]> {
      const all: any[] = [];
      for (let offset = 0; offset < 100000; offset += 1000) {
        const { data, error } = await makeQuery().range(offset, offset + 999);
        if (error) throw safeError("admin-read", error, "Could not load complete admin data. Please try again.");
        all.push(...(data ?? []));
        if ((data ?? []).length < 1000) return all;
      }
      throw new Error("Admin data is too large for this view. Please use a filtered report.");
    }
    const authUsers: any[] = [];
    for (let page = 1; page <= 100; page++) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw safeError("admin-users", error, "Could not load all users right now.");
      authUsers.push(...(data?.users ?? []));
      if ((data?.users ?? []).length < 1000) break;
      if (page === 100) throw new Error("User list is too large for this view.");
    }
    const [subs, profileRows, runRows, alertRows, usageRows, searchRows, builderRows] = await Promise.all([
      rows(() => supabaseAdmin.from("subscriptions").select("id,user_id,price_id,status,current_period_end,cancel_at_period_end,environment,created_at").eq("environment", getStripeEnvironment()).order("created_at", { ascending: false }).order("id")),
      rows(() => supabaseAdmin.from("profiles").select("id,full_name").order("id")),
      rows(() => supabaseAdmin.from("tailor_runs").select("id,user_id,created_at").order("id")),
      rows(() => supabaseAdmin.from("job_alerts").select("id,user_id,enabled,created_at").order("id")),
      rows(() => supabaseAdmin.from("tailor_usage_log").select("id,user_id,created_at").order("id")),
      rows(() => supabaseAdmin.from("job_search_runs").select("id,user_id,created_at").order("id")),
      rows(() => supabaseAdmin.from("builder_uses").select("id,user_id,created_at").order("id")),
    ]);

    const { decryptText } = await import("@/lib/field-crypto.server");
    const profiles = new Map(await Promise.all(profileRows.map(async (p) => [p.id, await decryptText(p.full_name)] as const)));
    const firstSub = new Map<string, (typeof subs)[number]>();
    for (const s of subs) if (!firstSub.has(s.user_id)) firstSub.set(s.user_id, s);

    const runCounts = new Map<string, number>();
    // Calendar month in Asia/Kolkata (fixed UTC+05:30, no daylight saving).
    const indiaNow = new Date(Date.now() + 330 * 60_000);
    const monthStart = new Date(Date.UTC(indiaNow.getUTCFullYear(), indiaNow.getUTCMonth(), 1) - 330 * 60_000);
    const asOf = new Date();
    const yearStart = new Date(Date.UTC(asOf.getUTCFullYear(), 0, 1));
    function inThisMonth(row: { created_at?: string | null }): boolean {
      const time = new Date(row.created_at ?? "").getTime();
      return Number.isFinite(time) && time >= monthStart.getTime() && time <= asOf.getTime();
    }
    function inThisYear(row: { created_at?: string | null }): boolean {
      const time = new Date(row.created_at ?? "").getTime();
      return Number.isFinite(time) && time >= yearStart.getTime() && time <= asOf.getTime();
    }
    let runsThisMonth = 0;
    for (const r of usageRows) {
      runCounts.set(r.user_id, (runCounts.get(r.user_id) ?? 0) + 1);
      if (inThisMonth(r)) runsThisMonth += 1;
    }

    const alertCounts = new Map<string, number>();
    let activeAlerts = 0;
    for (const a of alertRows) {
      alertCounts.set(a.user_id, (alertCounts.get(a.user_id) ?? 0) + 1);
      if (a.enabled) activeAlerts += 1;
    }

    function monthCounts(data: any[]): Map<string, number> {
      const counts = new Map<string, number>();
      for (const row of data) if (inThisMonth(row)) counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1);
      return counts;
    }
    const monthlyRuns = monthCounts(usageRows), monthlyAlerts = monthCounts(alertRows), monthlySearches = monthCounts(searchRows);
    const users: AdminUserRow[] = authUsers.map((u) => {
      const sub = firstSub.get(u.id);
      return {
        id: u.id,
        email: u.email ?? null,
        phone: u.phone || null,
        emailConfirmed: Boolean(u.email_confirmed_at),
        cancelAtPeriodEnd: Boolean(sub?.cancel_at_period_end),
        fullName: profiles.get(u.id) ?? null,
        createdAt: u.created_at ?? null,
        lastSignInAt: u.last_sign_in_at ?? null,
        runsTotal: runCounts.get(u.id) ?? 0,
        runsThisMonth: monthlyRuns.get(u.id) ?? 0,
        alertsThisMonth: monthlyAlerts.get(u.id) ?? 0,
        searchesThisMonth: monthlySearches.get(u.id) ?? 0,
        alerts: alertCounts.get(u.id) ?? 0,
        plan: sub && isEntitled(sub) ? planLabel(sub.price_id) : "Free",
        planStatus: sub?.status ?? null,
        planEnd: sub?.current_period_end ?? null,
      };
    });
    users.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

    const planBreakdown: Record<string, number> = {};
    let activeSubs = 0;
    for (const u of users) {
      const s = firstSub.get(u.id);
      const active = s && isEntitled(s);
      const label = active ? planLabel(s.price_id) : "Free";
      planBreakdown[label] = (planBreakdown[label] ?? 0) + 1;
      if (active) activeSubs += 1;
    }
    // Known QA accounts remain in records and activity totals, but not this ratio.
    const knownQaEmails = new Set(["mailboss@mail.instinct.com", "mailboss+gotaqa1@mail.instinct.com"]);
    const shareUsers = users.filter((u) => !knownQaEmails.has((u.email ?? "").trim().toLowerCase()));
    const shareEntitledUsers = shareUsers.filter((u) => {
      const sub = firstSub.get(u.id);
      return sub && isEntitled(sub);
    }).length;
    const searchesThisMonth = searchRows.filter(inThisMonth).length;

    return {
      totals: {
        users: users.length,
        usersThisMonth: authUsers.filter(inThisMonth).length,
        usersThisYear: authUsers.filter(inThisYear).length,
        subscriptionRecordsThisYear: subs.filter(inThisYear).length,
        alertRecordsThisYear: alertRows.filter(inThisYear).length,
        builderDownloadAttemptsThisYear: builderRows.filter(inThisYear).length,
        runsThisYear: usageRows.filter(inThisYear).length,
        searchesThisYear: searchRows.filter(inThisYear).length,
        subscriptionRecordsThisMonth: subs.filter(inThisMonth).length,
        alertRecordsThisMonth: alertRows.filter(inThisMonth).length,
        builderDownloadAttemptsThisMonth: builderRows.filter(inThisMonth).length,
        activeSubs,
        subscriberSharePercent: shareUsers.length ? shareEntitledUsers / shareUsers.length * 100 : 0,
        subscriberShareEligibleUsers: shareUsers.length,
        subscriberShareEntitledUsers: shareEntitledUsers,
        subscriptionRecords: subs.length,
        searchRecords: searchRows.length,
        builderDownloadAttempts: builderRows.length,
        searchesThisMonth,
        alertRecords: alertRows.length,
        runsTotal: usageRows.length,
        savedResumes: runRows.length,
        runsThisMonth,
        activeAlerts,
      },
      planBreakdown,
      users,
      subscriptions: subs.map((s) => ({
        userId: s.user_id,
        email: users.find((u) => u.id === s.user_id)?.email ?? null,
        fullName: profiles.get(s.user_id) ?? null,
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
