import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/jobs/daily-alerts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Dedicated, non-public cron token. The Supabase anon/publishable key
        // is shipped to every browser, so it can never authenticate this job.
        const expected = process.env.JOB_ALERTS_CRON_SECRET;
        if (!expected) {
          console.error("JOB_ALERTS_CRON_SECRET is not configured");
          return new Response("Unauthorized", { status: 401 });
        }
        const header = request.headers.get("authorization") ?? "";
        const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
        // Constant-time compare so the token can't be recovered byte by byte.
        const { timingSafeEqual } = await import("node:crypto");
        const a = Buffer.from(provided);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !timingSafeEqual(a, b)) {
          return new Response("Unauthorized", { status: 401 });
        }

        try {
          const { runDueDigests } = await import("@/lib/job-alert-digest.server");
          const terbey = await runDueDigests();
          // ProNet anonymous alerts ride the same cron. A missing table (migration not
          // applied yet) must never break terbey's own alert run, so it is isolated.
          let pronet: unknown = { skipped: "not_ready" };
          try {
            const { runDuePronetDigests } = await import("@/lib/pronet-alerts.server");
            pronet = await runDuePronetDigests();
          } catch (e) {
            console.error("ProNet alert run failed (terbey run unaffected):", e);
          }
          return Response.json({ terbey, pronet });
        } catch (error) {
          console.error("Daily job alert run failed:", error);
          return new Response("Alert run failed", { status: 500 });
        }
      },
    },
  },
});
