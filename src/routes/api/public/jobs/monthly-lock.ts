import { createFileRoute } from "@tanstack/react-router";

/**
 * Month-end lock. A scheduler calls this every night at about 22:30 India time.
 * It only acts on the last day of the month at or after 22:00 IST; any other call returns "skipped".
 * Same token as the backup job. ?dry=1 counts but writes nothing. ?force=1 skips the date check.
 */
export const Route = createFileRoute("/api/public/jobs/monthly-lock")({
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
          const { isMonthLockWindow, currentMonthIST, lockMonth } = await import("@/lib/monthly-stats.server");
          const asked = url.searchParams.get("month");
          if (!asked && url.searchParams.get("force") !== "1" && !isMonthLockWindow()) return Response.json({ ok: true, skipped: true });
          // ?month=YYYY-MM locks one finished past month by hand (back-fill). It never touches the current month.
          if (asked && (!/^\d{4}-(0[1-9]|1[0-2])$/.test(asked) || asked >= currentMonthIST())) return Response.json({ ok: false, reason: "bad-month" }, { status: 400 });
          const ym = asked ?? currentMonthIST();
          const r = await lockMonth(ym, { dry: url.searchParams.get("dry") === "1" });
          // Numbers only, never names or emails.
          return Response.json({ ok: r.ok, month: ym, reason: r.reason, wrote: r.wrote, cards: r.record?.cards, regions: r.record?.regions }, { status: r.ok ? 200 : 500 });
        } catch (error) {
          console.error("Monthly lock failed:", error);
          return Response.json({ ok: false, reason: "lock-error" }, { status: 500 });
        }
      },
    },
  },
});
