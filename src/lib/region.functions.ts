import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Remember where a user first signed in from (country + region), once.
 * Stored in the user's own auth app_metadata (not editable by the user). No new table.
 * Existing users with no value are counted as India in the admin view.
 */
export const captureRegion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context as { userId: string };
    const raw = (getRequest().headers.get("cf-ipcountry") || "").toUpperCase();
    if (!/^[A-Z]{2}$/.test(raw) || raw === "XX" || raw === "T1") return { saved: false };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
    const meta = (data?.user?.app_metadata ?? {}) as Record<string, unknown>;
    if (meta.signup_country) return { saved: false };
    const { regionForCountry } = await import("./region");
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      app_metadata: { ...meta, signup_country: raw, signup_region: regionForCountry(raw) },
    });
    return { saved: true };
  });
