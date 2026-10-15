/**
 * ProNet anonymous job alerts (owner-approved 2026-10-15). ProNet has no
 * accounts, so alerts key on the email address itself. Everything else reuses
 * terbey's alert engine: same searchAlertListings source, same 3-emails-3-days
 * -apart cycle, same job-alert email template, same style of signed
 * unsubscribe links, same free-tier limit (1 alert per month).
 *
 * Storage: public.pronet_job_alerts + public.pronet_job_alert_sent (service
 * role only). Email + free-text criteria are encrypted at rest with the same
 * field-crypto helpers terbey uses for account alerts.
 */

import { ALERT_TOTAL_EMAILS } from "@/lib/job-alert-digest.server";

const ALERT_INTERVAL_DAYS = 3;
const MAX_JOBS_PER_ALERT = 8;

export type PronetAlertRow = {
  id: string;
  email: string;
  role: string;
  location: string | null;
  remote_only: boolean;
  experience: string | null;
  salary_range: string | null;
  extra_filters: string | null;
  local_hour: number;
  timezone: string;
  last_sent_at: string | null;
  emails_sent: number;
  created_at: string;
};

export const PRONET_ALERT_COLUMNS =
  "id, email, role, location, remote_only, experience, salary_range, extra_filters, local_hour, timezone, last_sent_at, emails_sent, created_at";

function tableMissing(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return /pronet_job_alert|does not exist|42P01/i.test(msg);
}

/** True when the migration hasn't been applied yet - lets the API answer cleanly. */
export async function pronetAlertsReady(): Promise<boolean> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("pronet_job_alerts").select("id").limit(1);
  return !(error && tableMissing(error));
}

async function decryptRow(row: any): Promise<PronetAlertRow> {
  const { decryptText } = await import("@/lib/field-crypto.server");
  return {
    ...row,
    email: (await decryptText(row.email)) ?? "",
    role: (await decryptText(row.role)) ?? "",
    location: await decryptText(row.location),
    experience: await decryptText(row.experience),
    salary_range: await decryptText(row.salary_range),
    extra_filters: await decryptText(row.extra_filters),
  };
}

async function hmac(id: string): Promise<string> {
  const secret = process.env.JOB_ALERTS_CRON_SECRET || "";
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`pronet-alert-unsub:${id}`));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function pronetAlertUnsubscribeUrl(alertId: string): Promise<string> {
  return `https://terbey.com/api/public/pronet/job-alert-unsub?a=${alertId}&t=${await hmac(alertId)}`;
}

export async function verifyPronetAlertUnsubscribe(alertId: string, token: string): Promise<boolean> {
  if (!process.env.JOB_ALERTS_CRON_SECRET) return false;
  return (await hmac(alertId)) === token;
}

/** Runs the saved search for one ProNet alert and emails it. Mirrors sendDigestForAlert. */
export async function sendDigestForPronetAlert(
  alert: PronetAlertRow,
  options: { now?: Date } = {},
): Promise<{ sent: boolean; reason?: string; count?: number }> {
  const now = options.now ?? new Date();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { searchAlertListings } = await import("@/lib/jobs.server");
  const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");

  const jobs = await searchAlertListings({
    role: alert.role,
    location: alert.location ?? undefined,
    remoteOnly: alert.remote_only,
    experience: alert.experience ?? undefined,
    salaryRange: alert.salary_range ?? undefined,
    extraFilters: alert.extra_filters ?? undefined,
  }, null);
  if (jobs.length === 0) return { sent: false, reason: "no_jobs" };

  const { data: seen } = await supabaseAdmin
    .from("pronet_job_alert_sent")
    .select("job_url")
    .eq("alert_id", alert.id);
  const seenUrls = new Set((seen ?? []).map((s: { job_url: string }) => s.job_url));

  const fresh = jobs.filter((job) => !seenUrls.has(job.url));
  const topUp = jobs.filter((job) => seenUrls.has(job.url));
  const digest = [...fresh, ...topUp].slice(0, MAX_JOBS_PER_ALERT);
  if (digest.length === 0) return { sent: false, reason: "not_enough_jobs" };

  const unsubscribeUrl = await pronetAlertUnsubscribeUrl(alert.id);
  const result = await sendTemplateEmail("job-alert", alert.email, {
    unsubscribeUrl,
    idempotencyKey: `pronet-job-alert-${alert.id}-${(alert.emails_sent ?? 0) + 1}`,
    templateData: {
      role: alert.role,
      location: alert.location,
      experience: alert.experience,
      salaryRange: alert.salary_range,
      jobs: digest,
      jobsUrl: "https://pronet-75o.pages.dev/jobs",
      emailNumber: (alert.emails_sent ?? 0) + 1,
      unsubscribeUrl,
    },
  });
  if (!result.sent) return { sent: false, reason: result.reason };

  await supabaseAdmin.from("pronet_job_alert_sent").upsert(
    digest.map((job) => ({ alert_id: alert.id, job_url: job.url })),
    { onConflict: "alert_id,job_url" },
  );

  await supabaseAdmin
    .from("pronet_job_alerts")
    .update({
      last_sent_at: now.toISOString(),
      emails_sent: (alert.emails_sent ?? 0) + 1,
      // Same lifecycle as terbey: after the third email the alert ends for good.
      ...((alert.emails_sent ?? 0) + 1 >= ALERT_TOTAL_EMAILS ? { enabled: false } : {}),
    })
    .eq("id", alert.id);

  return { sent: true, count: digest.length };
}

function due(alert: PronetAlertRow, now: Date): boolean {
  if ((alert.emails_sent ?? 0) >= ALERT_TOTAL_EMAILS) return false;
  if (!alert.last_sent_at) return true;
  const elapsedDays = (now.getTime() - new Date(alert.last_sent_at).getTime()) / 86_400_000;
  return elapsedDays >= ALERT_INTERVAL_DAYS - 0.5;
}

/** Cron side: every enabled ProNet alert whose next email is due. Mirrors runDueDigests. */
export async function runDuePronetDigests() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const now = new Date();
  const { data, error } = await supabaseAdmin
    .from("pronet_job_alerts")
    .select(PRONET_ALERT_COLUMNS)
    .eq("enabled", true)
    .lt("emails_sent", ALERT_TOTAL_EMAILS);
  if (error) {
    if (tableMissing(error)) return { skipped: "table_missing" as const };
    throw error;
  }
  let sent = 0;
  let failed = 0;
  for (const raw of data ?? []) {
    const alert = await decryptRow(raw);
    if (!due(alert, now)) continue;
    try {
      const r = await sendDigestForPronetAlert(alert, { now });
      if (r.sent) sent++;
    } catch (e) {
      failed++;
      console.error("ProNet alert digest failed for", alert.id, e);
    }
  }
  return { sent, failed, scanned: (data ?? []).length };
}
