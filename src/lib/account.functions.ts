import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { passwordChangeSchema, profileUpdateSchema, runIdSchema } from "./account-schema";

let lastSealAt = 0;

export const getAccountOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { usageSince } = await import("./usage-window.server");
    const since = await usageSince(context.supabase, context.userId);

    const [{ data: profile }, count, { data: recent }] = await Promise.all([
      context.supabase
        .from("profiles")
        .select("full_name, created_at")
        .eq("id", context.userId)
        .maybeSingle(),
      import("./tailor-usage.server").then((m) => m.countTailorUsage(context.supabase, context.userId, since)),
      context.supabase
        .from("tailor_runs")
        .select("id, company, role, match_score, created_at, result")
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false })
        .limit(7),
    ]);

    // Seal rows still holding plain text (old rows, and names the signup trigger writes plain).
    // Throttled so a busy site does this at most once every 30 seconds per server instance.
    try {
      const now = Date.now();
      if (now - lastSealAt > 30_000) {
        lastSealAt = now;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { sealLegacyRows } = await import("./field-crypto.server");
        await sealLegacyRows(supabaseAdmin as any);
      }
    } catch (e) {
      console.error("[seal] failed", e instanceof Error ? e.message : e);
    }

    const totalCount = await (await import("./tailor-usage.server")).countTailorUsage(context.supabase, context.userId);

    return {
      fullName: await (await import("./field-crypto.server")).decryptText(profile?.full_name ?? null),
      memberSince: profile?.created_at ?? null,
      runsThisMonth: count ?? 0,
      runsTotal: totalCount ?? 0,
      // Only a flag here — the full resume payload is fetched on demand.
      recentRuns: (recent ?? []).map(({ result, ...run }) => ({
        ...run,
        hasResult: result !== null && result !== undefined,
      })),
    };
  });


/** Returns the stored tailored resume so the user can re-download its PDFs. */
export const getTailorRunResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => runIdSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { enforcePolicy } = await import("@/lib/rate-limit.server");
    await enforcePolicy("run-download", context.userId);

    const { data: run, error } = await context.supabase
      .from("tailor_runs")
      .select("id, company, role, result")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) {
      const { safeError } = await import("@/lib/safe-error.server");
      throw safeError("getTailorRunResult", error, "Could not load that rewrite right now.");
    }
    if (!run?.result) throw new Error("This rewrite was made before we started saving PDFs.");

    const { decryptResult } = await import("@/lib/resume-crypto.server");
    let result: typeof run.result;
    try {
      result = (await decryptResult(run.result)) as typeof run.result;
    } catch (err) {
      const { safeError } = await import("@/lib/safe-error.server");
      throw safeError("getTailorRunResult", err, "Could not unlock that saved rewrite.");
    }
    return { company: run.company, role: run.role, result };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => profileUpdateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { enforcePolicy } = await import("@/lib/rate-limit.server");
    await enforcePolicy("profile-write", context.userId);

    const { error } = await context.supabase
      .from("profiles")
      .upsert({ id: context.userId, full_name: await (await import("./field-crypto.server")).encryptText(data.fullName || null) });
    if (error) {
      const { safeError } = await import("@/lib/safe-error.server");
      throw safeError("updateProfile", error, "Could not save your profile right now.");
    }
    return { ok: true };
  });


/**
 * Re-authenticates with the current password before changing it, so an
 * unattended signed-in browser can't silently take over the account.
 */
export const changePassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => passwordChangeSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { enforcePolicy } = await import("@/lib/rate-limit.server");
    await enforcePolicy("profile-write", context.userId);

    const { passwordProblem } = await import("@/lib/password");
    const problem = passwordProblem(data.newPassword);
    if (problem) throw new Error(problem);
    if (data.newPassword === data.currentPassword) {
      throw new Error("Please choose a password you haven't used before.");
    }

    const email = context.claims?.email;
    if (!email) throw new Error("This account has no email address on file.");

    const { createClient } = await import("@supabase/supabase-js");
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const verifier = createClient(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
            h.delete("Authorization");
          }
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const { error: signInError } = await verifier.auth.signInWithPassword({
      email,
      password: data.currentPassword,
    });
    if (signInError) throw new Error("Your current password is incorrect.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(context.userId, {
      password: data.newPassword,
    });
    if (error) {
      const { safeError } = await import("@/lib/safe-error.server");
      throw safeError("changePassword", error, "Could not update your password right now.");
    }
    return { ok: true };
  });


/** DPDP Act 2023 — Right to Information: full copy of the data we hold on this user. */
export const exportMyData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { enforcePolicy } = await import("@/lib/rate-limit.server");
    await enforcePolicy("profile-write", context.userId);

    const [profile, runs, alerts, subs, searches] = await Promise.all([
      context.supabase.from("profiles").select("*").eq("id", context.userId).maybeSingle(),
      context.supabase.from("tailor_runs").select("*").eq("user_id", context.userId),
      context.supabase.from("job_alerts").select("*").eq("user_id", context.userId),
      context.supabase.from("subscriptions").select("*").eq("user_id", context.userId),
      context.supabase.from("job_search_runs").select("*").eq("user_id", context.userId),
    ]);

    // The data-export copy is decrypted so the user gets readable resumes.
    const { decryptResult } = await import("@/lib/resume-crypto.server");
    const tailoredResumes = await Promise.all(
      (runs.data ?? []).map(async (run) => ({
        ...run,
        result: (await decryptResult(run.result).catch(() => null)) as typeof run.result,
      })),
    );

    const fc = await import("./field-crypto.server");
    return {
      exportedAt: new Date().toISOString(),
      account: { id: context.userId, email: context.claims?.email ?? null },
      profile: profile.data ? { ...profile.data, full_name: await fc.decryptText((profile.data as any).full_name) } : null,
      tailoredResumes,
      jobAlerts: await Promise.all((alerts.data ?? []).map((a) => fc.decryptAlertFields(a as any))),
      subscriptions: subs.data ?? [],
      jobSearches: await Promise.all((searches.data ?? []).map((a) => fc.decryptSearchFields(a as any))),
    };
  });

/** DPDP Act 2023 — Right to Erasure: deletes all personal data and the login itself. */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { enforcePolicy } = await import("@/lib/rate-limit.server");
    await enforcePolicy("profile-write", context.userId);

    const userId = context.userId;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    await Promise.all([
      supabaseAdmin.from("tailor_runs").delete().eq("user_id", userId),
      supabaseAdmin.from("job_alerts").delete().eq("user_id", userId),
      supabaseAdmin.from("job_search_runs").delete().eq("user_id", userId),
      supabaseAdmin.from("credit_topups").delete().eq("user_id", userId),
      supabaseAdmin.from("subscriptions").delete().eq("user_id", userId),
    ]);
    await supabaseAdmin.from("profiles").delete().eq("id", userId);

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      const { safeError } = await import("@/lib/safe-error.server");
      throw safeError("deleteMyAccount", error, "Could not delete your account right now.");
    }
    return { ok: true };
  });
