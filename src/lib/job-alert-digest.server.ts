import { currentHourInTimezone } from "@/lib/jobs-schema";

export type AlertRow = {
  id: string;
  user_id: string;
  role: string;
  location: string | null;
  remote_only: boolean;
  experience: string | null;
  salary_range: string | null;
  extra_filters: string | null;
  local_hour: number;
  timezone: string;
  last_sent_at: string | null;
  emails_sent?: number;
};

export const ALERT_COLUMNS =
  "id, user_id, role, location, remote_only, experience, salary_range, extra_filters, local_hour, timezone, last_sent_at, emails_sent";

/**
 * Every alert email ships at least this many openings. Kept low on purpose —
 * a strict threshold silently skipped the whole digest on quiet days, so the
 * user never received anything at all.
 */
const MIN_JOBS_PER_ALERT = 1;
const MAX_JOBS_PER_ALERT = 8;

/** Each alert sends exactly this many emails, 3 days apart, then ends for good. */
export const ALERT_TOTAL_EMAILS = 3;

export function dateAndHourInTimezone(timezone: string, date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return {
    date: `${value("year")}-${value("month")}-${value("day")}`,
    hour: Number(value("hour")),
  };
}

/** Alerts go out every 3 days, not daily. */
export const ALERT_INTERVAL_DAYS = 3;

export function isAlertDue(alert: AlertRow, now: Date) {
  if ((alert.emails_sent ?? 0) >= ALERT_TOTAL_EMAILS) return false;
  try {
    const localNow = dateAndHourInTimezone(alert.timezone, now);
    if (!Number.isFinite(localNow.hour) || localNow.hour < alert.local_hour) return false;
    if (!alert.last_sent_at) return true;
    const elapsedDays =
      (now.getTime() - new Date(alert.last_sent_at).getTime()) / 86_400_000;
    // small tolerance so an hour-aligned run on day 3 isn't pushed to day 4
    return elapsedDays >= ALERT_INTERVAL_DAYS - 0.5;
  } catch {
    return currentHourInTimezone(alert.timezone, now) === alert.local_hour;
  }
}

/**
 * Runs the saved search for one alert and emails the owner. `force` skips the
 * cadence guard so a freshly saved alert can get its first digest right
 * away instead of waiting for the next scheduled window.
 */

export async function sendDigestForAlert(
  alert: AlertRow,
  options: { now?: Date; minJobs?: number } = {},
): Promise<{ sent: boolean; reason?: string; count?: number }> {
  const now = options.now ?? new Date();
  const minJobs = options.minJobs ?? MIN_JOBS_PER_ALERT;

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
    .from("job_alert_sent")
    .select("job_url")
    .eq("alert_id", alert.id);
  const seenUrls = new Set((seen ?? []).map((s: { job_url: string }) => s.job_url));

  const fresh = jobs.filter((job) => !seenUrls.has(job.url));
  const topUp = jobs.filter((job) => seenUrls.has(job.url));
  const digest = [...fresh, ...topUp].slice(0, MAX_JOBS_PER_ALERT);
  if (digest.length < minJobs) return { sent: false, reason: "not_enough_jobs" };

  const { data: userRes, error: userError } = await supabaseAdmin.auth.admin.getUserById(
    alert.user_id,
  );
  if (userError) throw userError;
  const email = userRes?.user?.email;
  if (!email) throw new Error("Alert owner has no email address");

  const localDate = dateAndHourInTimezone(alert.timezone, now).date;
  const { alertUnsubscribeUrl } = await import("@/lib/alert-unsub.server");
  const unsubscribeUrl = await alertUnsubscribeUrl(alert.id);
  const result = await sendTemplateEmail("job-alert", email, {
    unsubscribeUrl,
    idempotencyKey: `job-alert-${alert.id}-${(alert.emails_sent ?? 0) + 1}`,
    templateData: {
      role: alert.role,
      location: alert.location,
      experience: alert.experience,
      salaryRange: alert.salary_range,
      jobs: digest,
      jobsUrl: "https://gotaofferr.com/jobs?alert=1",
      emailNumber: (alert.emails_sent ?? 0) + 1,
      unsubscribeUrl,
    },
  });
  if (!result.sent) return { sent: false, reason: result.reason };

  const { error: sentError } = await supabaseAdmin.from("job_alert_sent").upsert(
    digest.map((job) => ({ alert_id: alert.id, job_url: job.url })),
    { onConflict: "alert_id,job_url" },
  );
  if (sentError) throw sentError;

  const { error: updateError } = await supabaseAdmin
    .from("job_alerts")
    .update({
      last_sent_at: now.toISOString(),
      last_jobs: digest,
      last_job_count: digest.length,
      emails_sent: (alert.emails_sent ?? 0) + 1,
      // After the third email the alert is finished for good.
      ...((alert.emails_sent ?? 0) + 1 >= ALERT_TOTAL_EMAILS ? { enabled: false, completed_at: now.toISOString() } : {}),
    })
    .eq("id", alert.id);
  if (updateError) throw updateError;

  return { sent: true, count: digest.length };
}

export async function runDueDigests() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const now = new Date();
  const { data: alerts, error: alertsError } = await supabaseAdmin
    .from("job_alerts")
    .select(ALERT_COLUMNS)
    .eq("enabled", true);
  if (alertsError) throw alertsError;

  const rows = ((alerts ?? []) as AlertRow[]).filter((alert) => isAlertDue(alert, now));
  let emailed = 0;
  const reasons: string[] = [];

  for (const alert of rows) {
    try {
      const result = await sendDigestForAlert(alert, { now });
      if (result.sent) emailed += 1;
      else reasons.push(result.reason ?? "unknown");
      console.log(`Job alert ${alert.id}: sent=${result.sent} ${result.reason ?? ""}`);
    } catch (error) {
      console.error(`Job alert ${alert.id} failed:`, error);
      reasons.push("error: " + (error instanceof Error ? error.message : String(error)).slice(0, 160));
    }
  }

  return { checkedAt: now.toISOString(), alerts: rows.length, processed: emailed, emailed, reasons };
}

