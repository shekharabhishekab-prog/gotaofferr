import { createFileRoute } from "@tanstack/react-router";

/** One-click unsubscribe from ProNet alert emails (signed link, same pattern as terbey's). */
export const Route = createFileRoute("/api/public/pronet/job-alert-unsub")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const id = url.searchParams.get("a") ?? "";
        const token = url.searchParams.get("t") ?? "";
        const { verifyPronetAlertUnsubscribe } = await import("@/lib/pronet-alerts.server");
        const ok = id && token && (await verifyPronetAlertUnsubscribe(id, token));
        if (ok) {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          await supabaseAdmin.from("pronet_job_alerts").update({ enabled: false }).eq("id", id);
        }
        const html = `<!doctype html><html><head><meta charset="utf-8"><title>Job alerts</title></head><body style="font-family:system-ui;max-width:420px;margin:80px auto;text-align:center">${
          ok
            ? "<h2>You're unsubscribed</h2><p>This job alert is off. No more emails from it.</p>"
            : "<h2>Link not valid</h2><p>This unsubscribe link is invalid or expired.</p>"
        }</body></html>`;
        return new Response(html, { status: ok ? 200 : 400, headers: { "content-type": "text/html" } });
      },
    },
  },
});
