import { createFileRoute } from "@tanstack/react-router";

async function stop(url: URL): Promise<boolean> {
  const id = url.searchParams.get("a") ?? "";
  const token = url.searchParams.get("t") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return false;
  const { verifyAlertUnsubscribe } = await import("@/lib/alert-unsub.server");
  if (!(await verifyAlertUnsubscribe(id, token))) return false;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("job_alerts").update({ enabled: false }).eq("id", id);
  return !error;
}

export const Route = createFileRoute("/api/public/jobs/unsubscribe")({
  server: {
    handlers: {
      // One-click (mail apps POST here).
      POST: async ({ request }) => {
        const ok = await stop(new URL(request.url));
        return new Response(ok ? "Unsubscribed" : "Invalid link", { status: ok ? 200 : 400 });
      },
      // Link in the email body.
      GET: async ({ request }) => {
        const ok = await stop(new URL(request.url));
        const msg = ok
          ? "Done. This job alert is stopped and you will get no more emails from it."
          : "This link is not valid.";
        return new Response(`<!doctype html><meta name=viewport content="width=device-width,initial-scale=1"><body style="font-family:sans-serif;max-width:480px;margin:60px auto;padding:0 20px"><h2>GotaOfferr</h2><p>${msg}</p><p><a href="https://gotaofferr.com/jobs">Back to GotaOfferr</a></p>`, {
          status: ok ? 200 : 400,
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      },
    },
  },
});
