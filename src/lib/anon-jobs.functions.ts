import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCookie, getRequest, setCookie } from "@tanstack/react-start/server";

import { jobSearchInputSchema } from "./jobs-schema";
import type { JobListing } from "./jobs-schema";

const anonJobInput = jobSearchInputSchema.extend({
  deviceId: z.string().trim().min(6).max(200),
  turnstileToken: z.string().trim().max(4000).optional(),
});

/** One free job search for a logged-out visitor, once per device (like the one free rewrite). */
export const searchJobsAnonymous = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => anonJobInput.parse(input))
  .handler(async ({ data }): Promise<{ jobs: JobListing[] } | { error: string; used?: boolean }> => {
    try {
      const { ANON_COOKIE, hashValue } = await import("./anon-tailor.server");
      const { clientIp, enforcePolicy } = await import("@/lib/rate-limit.server");
      const { verifyTurnstile } = await import("./turnstile.server");
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      const request = getRequest();
      const ip = clientIp(request);
      const ipHash = "jobs:" + hashValue(ip);
      await verifyTurnstile(data.turnstileToken, ip);

      let cookieId = getCookie(ANON_COOKIE);
      if (!cookieId) {
        cookieId = crypto.randomUUID();
        setCookie(ANON_COOKIE, cookieId, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
      }
      const deviceHashes = ["jobs:" + hashValue(data.deviceId), "jobs:" + hashValue(cookieId)];

      await enforcePolicy("job_anon_global", "site");
      await enforcePolicy("job_anon", ipHash);

      const { data: byDevice } = await supabaseAdmin.from("anonymous_tailor_uses").select("id").in("device_hash", deviceHashes).limit(1);
      const { data: byIp } = await supabaseAdmin.from("anonymous_tailor_uses").select("id").eq("ip_hash", ipHash).limit(1);
      if ((byDevice && byDevice.length) || (byIp && byIp.length)) {
        return { error: "You've used your free job search. Create a free account to keep searching.", used: true };
      }

      let country: string | null = null;
      const c = request.headers.get("cf-ipcountry");
      country = c && /^[A-Za-z]{2}$/.test(c) ? c : null;

      const { searchJobListings } = await import("./jobs.server");
      const { role, location, remoteOnly, experience, salaryRange, extraFilters } = data as any;
      const jobs = await searchJobListings({ role, location, remoteOnly, experience, salaryRange, extraFilters } as any, { tier: "free" as any, country });

      await supabaseAdmin
        .from("anonymous_tailor_uses")
        .upsert(deviceHashes.map((device_hash) => ({ device_hash, ip_hash: ipHash })), { onConflict: "device_hash" });
      return { jobs };
    } catch (error) {
      const { safeErrorMessage } = await import("@/lib/safe-error.server");
      return { error: safeErrorMessage("searchJobsAnonymous", error, "Job search failed. Please try again.") };
    }
  });
