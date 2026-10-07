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
    const { sendOpsMessage } = await import("./ops-alert-test.policy");
    await sendOpsMessage({ key, domain, to, subject: `[gotaofferr alert] ${safeKind}`,
      text: `Something needs a look on gotaofferr.com.\n\nWhat: ${safeKind}\nWhen: ${new Date().toISOString()}\nNote: ${text || "(no extra detail)"}\n\nMore alerts of this same kind are held back for 1 hour.\nLogs: Cloudflare dashboard > gotaofferr-copy > Observability.` });
  } catch (e) {
    console.error("[ops-alert] failed", e);
  }
}

/** Fire and forget: never makes the caller wait or fail. */
export function opsAlert(kind: string, note?: unknown): void {
  void sendOpsAlert(kind, note);
}

/** Only called after the admin AAL2 and exact preview-host gates. */
export async function sendOpsDeliveryTest(): Promise<{ accepted: boolean; id?: string }> {
  const { OPS_TEST_RECIPIENT, OPS_TEST_SUBJECT, OPS_TEST_BODY, sendOpsMessage } = await import("./ops-alert-test.policy");
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Email sender is not configured on preview.");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // Dedicated atomic reservation: never fail open, never roll into another window.
  const { data: count, error } = await supabaseAdmin.rpc("bump_rate_limit" as any, {
    _bucket: "ops_test", _identifier: "owner-20261007-105708", _window_start: "2026-10-07T00:00:00.000Z",
  } as any);
  if (error || !Number.isFinite(Number(count)) || Number(count) < 1) throw new Error("Test reservation could not be verified. Nothing sent.");
  if (Number(count) !== 1) throw new Error("This approved test has already been attempted. Check delivery before sending again.");
  return sendOpsMessage({ key, domain: "gotaofferr.com", to: [OPS_TEST_RECIPIENT], subject: OPS_TEST_SUBJECT, text: OPS_TEST_BODY, idempotencyKey: "gotaofferr-ops-test-20261007-105708" });
}
