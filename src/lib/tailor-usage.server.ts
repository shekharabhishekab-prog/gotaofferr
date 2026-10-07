/**
 * Monthly tailoring usage is counted from a tiny log (user id + time only), so the
 * saved resumes themselves can be deleted. Until the log table exists, every helper
 * falls back to the old behaviour (count saved rows, delete nothing).
 */
export const MAX_SAVED_RUNS = 7;

async function admin() {
  return (await import("@/integrations/supabase/client.server")).supabaseAdmin as any;
}

export async function countTailorUsage(supabase: any, userId: string, sinceIso?: string): Promise<number> {
  try {
    const sb = await admin();
    let q = sb.from("tailor_usage_log").select("id", { count: "exact", head: true }).eq("user_id", userId);
    if (sinceIso) q = q.gte("created_at", sinceIso);
    const { count, error } = await q;
    if (!error) return count ?? 0;
  } catch {
    /* fall through to the old count */
  }
  let q2 = supabase.from("tailor_runs").select("id", { count: "exact", head: true }).eq("user_id", userId);
  if (sinceIso) q2 = q2.gte("created_at", sinceIso);
  const { count } = await q2;
  return count ?? 0;
}

/** Records one run in the usage log, then keeps only the newest MAX_SAVED_RUNS saved runs. */
/** Free accounts keep only their newest 2 saved resumes; paid tiers keep MAX_SAVED_RUNS. */
export const FREE_MAX_SAVED_RUNS = 2;

export async function recordTailorRun(supabase: any, userId: string, keepNewest: number = MAX_SAVED_RUNS): Promise<void> {
  try {
    const sb = await admin();
    const { error } = await sb.from("tailor_usage_log").insert({ user_id: userId });
    if (error) return; // table not there yet: keep every saved run so usage stays correct
    const { data: old } = await sb
      .from("tailor_runs")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(keepNewest, keepNewest + 500);
    const ids = (old ?? []).map((r: { id: string }) => r.id);
    if (ids.length) await sb.from("tailor_runs").delete().in("id", ids).eq("user_id", userId);
  } catch (e) {
    console.error("[tailor-usage] record failed", e);
  }
}
