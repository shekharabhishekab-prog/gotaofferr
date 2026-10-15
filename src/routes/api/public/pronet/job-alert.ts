import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { jobAlertInputSchema } from "@/lib/jobs-schema";

const inputSchema = jobAlertInputSchema.extend({
  email: z.string().trim().email().max(255),
  enabled: z.boolean().default(true),
});

/**
 * ProNet "Alert me" bell - LinkedIn-style email alerts on the current search.
 * Anonymous (ProNet has no login): keyed by email, free-tier limit of 1 alert
 * per month (exactly terbey's ALERT_ATTEMPT_LIMIT.free), same 3-email cycle
 * powered by the same digest engine and Adzuna source as terbey.com alerts.
 */
export const Route = createFileRoute("/api/public/pronet/job-alert")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => (await import("@/lib/pronet-public.server")).pronetOptions(request),
      POST: async ({ request }) => {
        const { pronetJson } = await import("@/lib/pronet-public.server");
        try {
          const body = inputSchema.parse(await request.json());
          const { clientIp, enforcePolicy } = await import("@/lib/rate-limit.server");
          const ip = clientIp(request);
          await enforcePolicy("pronet_alert", (await import("@/lib/anon-tailor.server")).hashValue(ip));

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { encryptText } = await import("@/lib/field-crypto.server");
          const { pronetAlertsReady, sendDigestForPronetAlert } = await import("@/lib/pronet-alerts.server");

          if (!(await pronetAlertsReady())) {
            return pronetJson(request, { error: "alert-backend-pending" }, 503);
          }

          const emailEnc = await encryptText(body.email.toLowerCase());

          // Turning off: stop every running alert for this email.
          if (!body.enabled) {
            await supabaseAdmin.from("pronet_job_alerts").update({ enabled: false }).eq("email", emailEnc).eq("enabled", true);
            return pronetJson(request, { ok: true, stopped: true });
          }

          // Free-tier monthly limit, exactly as terbey (ALERT_ATTEMPT_LIMIT.free = 1).
          const { ALERT_ATTEMPT_LIMIT } = await import("@/lib/plans");
          const since = new Date();
          since.setUTCDate(1);
          since.setUTCHours(0, 0, 0, 0);
          const { count } = await supabaseAdmin
            .from("pronet_job_alerts")
            .select("id", { count: "exact", head: true })
            .eq("email", emailEnc)
            .gte("created_at", since.toISOString());
          if ((count ?? 0) >= ALERT_ATTEMPT_LIMIT.free) {
            return pronetJson(request, {
              error: `You have used your free job alert for this month. Your count resets next month - terbey.com plans give up to ${ALERT_ATTEMPT_LIMIT.career_pro}.`,
              used: true,
            });
          }

          // One running alert per email: a new one replaces the old (same as terbey's one-cycle rule).
          await supabaseAdmin.from("pronet_job_alerts").update({ enabled: false }).eq("email", emailEnc).eq("enabled", true);

          const row = {
            email: emailEnc,
            role: await encryptText(body.role),
            location: await encryptText(body.location ?? null),
            remote_only: body.remoteOnly ?? false,
            experience: await encryptText(body.experience ?? null),
            salary_range: await encryptText(body.salaryRange ?? null),
            extra_filters: await encryptText(body.extraFilters ?? null),
            local_hour: body.localHour,
            timezone: body.timezone,
            enabled: true,
            emails_sent: 0,
          };
          const { data: saved, error } = await supabaseAdmin.from("pronet_job_alerts").insert(row).select("id").maybeSingle();
          if (error || !saved) {
            return pronetJson(request, { error: "Could not save this alert. Please try again." }, 500);
          }

          // Email 1 goes out right away; emails 2 and 3 follow every 3 days (same as terbey).
          let firstEmailSent = false;
          try {
            const result = await sendDigestForPronetAlert({ ...body, id: saved.id as string, email: body.email.toLowerCase(), location: body.location ?? null, remote_only: body.remoteOnly ?? false, experience: body.experience ?? null, salary_range: body.salaryRange ?? null, extra_filters: body.extraFilters ?? null, local_hour: body.localHour, timezone: body.timezone, last_sent_at: null, emails_sent: 0, created_at: new Date().toISOString() } as any);
            firstEmailSent = result.sent;
          } catch (sendError) {
            console.error("First ProNet alert digest failed:", sendError);
          }
          return pronetJson(request, { ok: true, firstEmailSent });
        } catch (error) {
          const { safeErrorMessage } = await import("@/lib/safe-error.server");
          return pronetJson(request, { error: safeErrorMessage("pronet.jobAlert", error, "Could not set this alert. Please try again.") });
        }
      },
    },
  },
});
