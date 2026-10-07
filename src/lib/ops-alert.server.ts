/**
 * Tells the site owner by email when something important breaks on the server
 * (payment webhook failure, cron failure, job-source failure, strike applied,
 * unexpected server error). Free: uses the existing Resend account.
 *
 * - One email per alert kind per hour at most (stored in the database, so it
 *   holds across servers), so a burst of errors never floods an inbox.
 * - Never sends secrets, tokens, resume text or customer emails: only the
 *   alert kind and a short technical note.
 * - Never throws and never blocks the customer's request.
 */
const WINDOW_SECONDS = 3600;

export async function sendOpsAlert(kind: string, note?: unknown): Promise<void> {
  try {
    const to = (process.env.OPS_ALERT_EMAIL || "").split(",").map((x) => x.trim()).filter((x) => /^[^\s@]+@[^\s@]+$/.test(x)).slice(0, 5);
    const key = process.env.RESEND_API_KEY;
    if (!to.length || !key) return;
    const safeKind = String(kind).replace(/[^a-zA-Z0-9:_.\- ]/g, "").slice(0, 80) || "unknown";

    const { checkRateLimit } = await import("./rate-limit.server");
    const res = await checkRateLimit("ops_alert", safeKind, 1, WINDOW_SECONDS);
    if (!res.allowed) return;

    const raw = note instanceof Error ? note.message : typeof note === "string" ? note : "";
    const text = raw
      .replace(/(Bearer\s+)[A-Za-z0-9._\-]+/gi, "$1[hidden]")
      .replace(/\b(sk|rzp|AIza|eyJ)[A-Za-z0-9._\-]{8,}/g, "[hidden]")
      .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]")
      .slice(0, 400);

    const domain = process.env.RESEND_FROM_DOMAIN || "gotaofferr.com";
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `GotaOfferr alerts <noreply@${domain}>`,
        to,
        subject: `[gotaofferr alert] ${safeKind}`,
        text: `Something needs a look on gotaofferr.com.\n\nWhat: ${safeKind}\nWhen: ${new Date().toISOString()}\nNote: ${text || "(no extra detail)"}\n\nMore alerts of this same kind are held back for 1 hour.\nLogs: Cloudflare dashboard > gotaofferr-copy > Observability.`,
      }),
    });
  } catch (e) {
    console.error("[ops-alert] failed", e);
  }
}

/** Fire and forget: never makes the caller wait or fail. */
export function opsAlert(kind: string, note?: unknown): void {
  void sendOpsAlert(kind, note);
}
