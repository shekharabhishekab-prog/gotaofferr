import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { jobSearchInputSchema } from "@/lib/jobs-schema";

const inputSchema = jobSearchInputSchema.extend({
  deviceId: z.string().trim().min(6).max(200),
});

/**
 * ProNet live job search - the same firecrawl + AI pipeline a logged-out
 * gotaofferr.com visitor gets. ProNet has its own generous counter (50/day,
 * owner-approved 2026-10-15) so testing never hits a wall; gotaofferr.com's
 * one-free-search counter is untouched.
 */
export const Route = createFileRoute("/api/public/pronet/search")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => (await import("@/lib/pronet-public.server")).pronetOptions(request),
      POST: async ({ request }) => {
        const { pronetJson, pronetIdentity, pronetUsedRolling, pronetRecordUse } = await import("@/lib/pronet-public.server");
        try {
          const body = inputSchema.parse(await request.json());
          const { clientIp, enforcePolicy } = await import("@/lib/rate-limit.server");
          const ip = clientIp(request);
          await enforcePolicy("pronet_search_global", "site");
          await enforcePolicy("pronet_search", (await import("@/lib/anon-tailor.server")).hashValue(ip));

          const id = await pronetIdentity(request, body.deviceId);
          if (await pronetUsedRolling("pronet:jobs:", id, 50)) {
            return pronetJson(request, { error: "You've used your free job search. Create a free account on gotaofferr.com to keep searching.", used: true });
          }

          const c = request.headers.get("cf-ipcountry");
          const country = c && /^[A-Za-z]{2}$/.test(c) ? c : null;
          const { searchJobListings } = await import("@/lib/jobs.server");
          const { deviceId: _d, ...searchInput } = body;
          const jobs = await searchJobListings(searchInput, { tier: "free", country });
          await pronetRecordUse("pronet:jobs:", id);
          return pronetJson(request, { jobs });
        } catch (error) {
          const { safeErrorMessage } = await import("@/lib/safe-error.server");
          return pronetJson(request, { error: safeErrorMessage("pronet.search", error, "Job search failed. Please try again.") });
        }
      },
    },
  },
});
