import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { PlanTier } from "@/lib/plans";

type Ctx = { supabase: any; userId: string; claims?: any };

/** Saved builder resumes: Free none, Starter 1, Job Hunt and Career Pro 2. */
export const BUILDER_SAVE_SLOTS: Record<PlanTier, number> = {
  free: 0,
  starter: 1,
  job_hunt: 2,
  career_pro: 2,
};

/** Saved resumes are removed automatically after 3 months. */
const KEEP_MONTHS = 3;

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as any;
}

async function purgeOld(sb: any, userId: string) {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - KEEP_MONTHS);
  const { error } = await sb.from("default_resumes").delete().eq("user_id", userId).lt("created_at", cutoff.toISOString());
  if (error) console.error("[builder-saves] purge failed", error.message);
}

async function readSaves(sb: any, userId: string) {
  const { data, error } = await sb
    .from("default_resumes")
    .select("id, label, result, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) return [] as any[];
  // Saved resumes are encrypted at rest. Old plaintext rows pass through unchanged.
  const { decryptResult } = await import("@/lib/resume-crypto.server");
  const out: any[] = [];
  for (const row of data ?? []) {
    try {
      out.push({ ...row, result: await decryptResult(row.result) });
    } catch (e) {
      // A row sealed with a key this environment does not hold: hide it, never show raw data.
      console.error("[builder-saves] could not unlock a saved resume");
    }
  }
  return out;
}

/** The member's saved builder resumes plus how many slots their plan has. */
export const listBuilderSaves = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as unknown as Ctx;
    const tier = await (await import("@/lib/tier.server")).tierFor(ctx);
    const sb = await admin();
    await purgeOld(sb, ctx.userId);
    const items = await readSaves(sb, ctx.userId);
    return { tier, slots: BUILDER_SAVE_SLOTS[tier], items };
  });

const saveInput = z.object({
  label: z.string().trim().max(120).optional(),
  draft: z.any(),
  polished: z.any().nullable().optional(),
});

/** Saves one built resume. A full plan must delete one first; nothing is replaced silently. */
export const saveBuilderResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => saveInput.parse(input))
  .handler(async ({ context, data }) => {
    const ctx = context as unknown as Ctx;
    const tier = await (await import("@/lib/tier.server")).tierFor(ctx);
    const slots = BUILDER_SAVE_SLOTS[tier];
    if (slots <= 0) return { ok: false as const, reason: "no_plan" as const, slots };
    const json = JSON.stringify({ draft: data.draft, polished: data.polished ?? null });
    if (json.length > 200_000) return { ok: false as const, reason: "too_big" as const, slots };
    const sb = await admin();
    await purgeOld(sb, ctx.userId);
    const items = await readSaves(sb, ctx.userId);
    if (items.length >= slots) return { ok: false as const, reason: "full" as const, slots };
    // Encrypt before the write. If the key is missing or crypto fails we refuse to save, never store plaintext.
    let sealed: unknown;
    try {
      const { encryptResult } = await import("@/lib/resume-crypto.server");
      sealed = await encryptResult({ draft: data.draft, polished: data.polished ?? null });
    } catch (e) {
      console.error("[builder-saves] encrypt failed, nothing saved");
      return { ok: false as const, reason: "error" as const, slots };
    }
    const { error } = await sb
      .from("default_resumes")
      .insert({ user_id: ctx.userId, label: data.label || null, result: sealed });
    if (error) {
      console.error("[builder-saves] insert failed", error.message);
      return { ok: false as const, reason: "error" as const, slots };
    }
    return { ok: true as const, slots, used: items.length + 1 };
  });

/** Deletes one saved resume, only if it belongs to the member. */
export const deleteBuilderSave = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const ctx = context as unknown as Ctx;
    const sb = await admin();
    const { error } = await sb.from("default_resumes").delete().eq("id", data.id).eq("user_id", ctx.userId);
    return { ok: !error };
  });
