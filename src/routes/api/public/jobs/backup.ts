import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/jobs/backup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Dedicated token. Fails closed when no token secret is configured.
        const expected = process.env.BACKUP_TRIGGER_TOKEN;
        if (!expected) return new Response("Backup not configured", { status: 503 });
        const header = request.headers.get("authorization") ?? "";
        const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
        const { timingSafeEqual } = await import("node:crypto");
        const a = Buffer.from(provided);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !timingSafeEqual(a, b)) return new Response("Unauthorized", { status: 401 });
        try {
          const { runBackup } = await import("@/lib/backup.server");
          const r = await runBackup();
          if (!r.ok) {
            console.error("Backup failed:", r.reason);
            return Response.json({ ok: false, reason: r.reason }, { status: 500 });
          }
          // Counts only, never row data.
          return Response.json(r);
        } catch (error) {
          console.error("Backup run failed:", error);
          return Response.json({ ok: false, reason: "backup-error" }, { status: 500 });
        }
      },
    },
  },
});
