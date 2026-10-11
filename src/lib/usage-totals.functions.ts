import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** All-time counts per feature for the signed-in user. Read from logs that already exist. */
export const getUsageTotals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as any;
    const count = async (table: string) => {
      const { count: c, error } = await admin.from(table).select("user_id", { count: "exact", head: true }).eq("user_id", context.userId);
      return error ? null : (c ?? 0);
    };
    const [resumesBuilt, interviews, jobSearches] = await Promise.all([
      count("builder_uses"),
      count("interview_log"),
      count("job_search_runs"),
    ]);
    return { resumesBuilt, interviews, jobSearches };
  });
