import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { passwordChangeSchema, profileUpdateSchema, runIdSchema } from "./account-schema";

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

    const totalCount = await (await import("./tailor-usage.server")).countTailorUsage(context.supabase, context.userId);

    return {
      fullName: profile?.full_name ?? null,
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
      .upsert({ id: context.userId, full_name: data.fullName || null });
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

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [profile, runs, alerts, subs, searches, builder] = await Promise.all([
      context.supabase.from("profiles").select("*").eq("id", context.userId).maybeSingle(),
      context.supabase.from("tailor_runs").select("*").eq("user_id", context.userId),
      context.supabase.from("job_alerts").select("*").eq("user_id", context.userId),
      context.supabase.from("subscriptions").select("*").eq("user_id", context.userId),
      context.supabase.from("job_search_runs").select("*").eq("user_id", context.userId),
      supabaseAdmin.from("default_resumes").select("*").eq("user_id", context.userId),
    ]);

    const { safeError } = await import("@/lib/safe-error.server");
    for (const response of [profile, runs, alerts, subs, searches, builder]) {
      if (response.error) throw safeError("account-export", response.error, "Could not export your complete account data right now.");
    }
    // The data-export copy is decrypted so the user gets readable resumes.
    const { decryptResult } = await import("@/lib/resume-crypto.server");
    let tailoredResumes: any[], savedBuilderResumes: any[];
    try {
      tailoredResumes = await Promise.all((runs.data ?? []).map(async (run) => ({ ...run, result: await decryptResult(run.result) })));
      savedBuilderResumes = await Promise.all((builder.data ?? []).map(async (run) => ({ ...run, result: await decryptResult(run.result) })));
    } catch (error) {
      throw safeError("account-export-unlock", error, "Could not unlock all your saved resumes for export. Please try again.");
    }

    return {
      exportedAt: new Date().toISOString(),
      account: { id: context.userId, email: context.claims?.email ?? null },
      profile: profile.data ?? null,
      tailoredResumes,
      savedBuilderResumes,
      jobAlerts: alerts.data ?? [],
      subscriptions: subs.data ?? [],
      jobSearches: searches.data ?? [],
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

    // Fail closed before destructive work while mandate and retention prerequisites
    // are unresolved. Never delete auth after a failed app-data delete.
    const { safeError } = await import("@/lib/safe-error.server");
    throw safeError("deleteMyAccount", null, "Account deletion is temporarily unavailable. Please contact support so we can safely close any renewals and remove your data.");
  });
