import { createFileRoute } from "@tanstack/react-router";

/**
 * Keep-alive ping so the free database never counts as inactive.
 * Read-only: one row-count query. Creates no rows, no signups, no stats.
 * Same token as the other scheduled jobs. Returns nothing about the data.
 */
export const Route = createFileRoute("/api/public/jobs/keepalive")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.BACKUP_TRIGGER_TOKEN;
        if (!expected) return new Response("Not configured", { status: 503 });
        const header = request.headers.get("authorization") ?? "";
        const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
        const { timingSafeEqual } = await import("node:crypto");
        const a = Buffer.from(provided);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !timingSafeEqual(a, b)) return new Response("Unauthorized", { status: 401 });
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { error } = await supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).limit(1);
          if (error) return Response.json({ ok: false }, { status: 500 });
          return Response.json({ ok: true });
        } catch {
          return Response.json({ ok: false }, { status: 500 });
        }
      },
    },
  },
});
