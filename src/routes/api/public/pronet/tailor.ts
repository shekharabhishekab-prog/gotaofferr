import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { tailorInputSchema } from "@/lib/tailor-schema";

const inputSchema = tailorInputSchema.extend({
  deviceId: z.string().trim().min(6).max(200),
});

/**
 * ProNet resume tailor - the same AI chain as terbey.com's logged-out free
 * rewrite: one full run per device, shared counter with terbey.com.
 */
export const Route = createFileRoute("/api/public/pronet/tailor")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => (await import("@/lib/pronet-public.server")).pronetOptions(request),
      POST: async ({ request }) => {
        const { pronetJson } = await import("@/lib/pronet-public.server");
        try {
          const body = inputSchema.parse(await request.json());
          const { clientIp, enforcePolicy } = await import("@/lib/rate-limit.server");
          const { hashValue, hasUsedFreeRun, recordFreeRun, firstRunChoice, recordFirstRun } = await import("@/lib/anon-tailor.server");
          const ip = clientIp(request);
          await enforcePolicy("tailor_anon_global", "site");
          await enforcePolicy("tailor_anon", hashValue(ip));

          // Same identity shape as terbey.com's anon tailor: device fingerprint + IP.
          // ProNet's deviceId stands in for the cookie id (cross-site cookies don't stick).
          const identity = { deviceHash: hashValue(body.deviceId), ipHash: hashValue(ip), cookieId: body.deviceId };
          if (await hasUsedFreeRun(identity)) {
            return pronetJson(request, { error: "You've used your free rewrite. Create a free account on terbey.com for 5 rewrites every month.", used: true });
          }

          const { runTailor } = await import("@/lib/tailor.server");
          const { detectCountry } = await import("@/lib/resume-locale.server");
          const bigFirst = await firstRunChoice(identity, false);
          const { deviceId: _d, ...tailorInput } = body;
          const result = await runTailor(tailorInput, detectCountry(), bigFirst ? "career_pro" : "free");
          await recordFreeRun(identity);
          if (bigFirst) await recordFirstRun(identity);
          return pronetJson(request, { result });
        } catch (error) {
          const { safeErrorMessage } = await import("@/lib/safe-error.server");
          return pronetJson(request, { error: safeErrorMessage("pronet.tailor", error, "Could not tailor this resume. Please try again.") });
        }
      },
    },
  },
});
