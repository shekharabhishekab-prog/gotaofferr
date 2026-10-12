import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Signs out every OTHER device of the signed-in user and keeps this one. The browser
 * calls it right after a password was set through the email-code or reset-link flows,
 * which change the password without a server step. Best effort: the password change
 * never depends on it.
 */
export const signOutOtherSessions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    try {
      const { getRequest } = await import("@tanstack/react-start/server");
      const jwt = getRequest()?.headers.get("authorization")?.replace(/^Bearer /, "");
      if (!jwt) return { ok: false };
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.auth.admin.signOut(jwt, "others");
      if (error) {
        console.error("[signOutOtherSessions] failed");
        return { ok: false };
      }
      return { ok: true };
    } catch {
      console.error("[signOutOtherSessions] failed");
      return { ok: false };
    }
  });
