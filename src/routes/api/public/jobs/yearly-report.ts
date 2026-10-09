import { createFileRoute } from "@tanstack/react-router";

/**
 * Year-end report. A scheduler calls this once a day; it only acts on 30 Dec (India date).
 * ?preview=1..4 returns that PDF for checking (no email). ?force=1 skips the date check.
 * The send happens once per year (marker file in R2).
 */
export const Route = createFileRoute("/api/public/jobs/yearly-report")({
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
        const url = new URL(request.url);
        try {
          const ist = new Date(Date.now() + 330 * 60_000);
          const year = ist.getUTCFullYear();
          const { buildYearlyReports, sendYearlyReports } = await import("@/lib/yearly-report.server");
          const preview = Number(url.searchParams.get("preview") ?? 0);
          if (preview >= 1 && preview <= 4) {
            const files = await buildYearlyReports(year);
            const f = files[preview - 1];
            return new Response(f.bytes as BodyInit, { headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename="${f.filename}"` } });
          }
          const isDay = ist.getUTCMonth() === 11 && ist.getUTCDate() === 30;
          if (!isDay && url.searchParams.get("force") !== "1") return Response.json({ ok: true, skipped: true });
          const r = await sendYearlyReports(year);
          return Response.json(r, { status: r.ok ? 200 : 500 });
        } catch (error) {
          console.error("Yearly report failed:", error);
          return Response.json({ ok: false, reason: "report-error", detail: String((error as Error)?.message ?? error).slice(0, 200) }, { status: 500 });
        }
      },
    },
  },
});
