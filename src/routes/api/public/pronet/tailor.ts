import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { tailorInputSchema } from "@/lib/tailor-schema";

const inputSchema = tailorInputSchema.extend({
  deviceId: z.string().trim().min(6).max(200),
});

/**
 * ProNet resume tailor - the same AI chain as gotaofferr.com's logged-out free
 * rewrite. ProNet has its own generous counter (25/day, owner-approved
 * 2026-10-15); gotaofferr.com's one-free-rewrite counter is untouched.
 */
export const Route = createFileRoute("/api/public/pronet/tailor")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => (await import("@/lib/pronet-public.server")).pronetOptions(request),
      POST: async ({ request }) => {
        const { pronetJson, pronetUsedRolling, pronetRecordUse } = await import("@/lib/pronet-public.server");
        // Read the body once up front so the catch below can still see deviceId.
        const rawBody = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        try {
          const body = inputSchema.parse(rawBody);
          const { clientIp, enforcePolicy } = await import("@/lib/rate-limit.server");
          const { hashValue, firstRunChoice, recordFirstRun } = await import("@/lib/anon-tailor.server");
          const ip = clientIp(request);
          await enforcePolicy("pronet_tailor_global", "site");
          await enforcePolicy("pronet_tailor", hashValue(ip));

          // Same identity shape as gotaofferr.com's anon tailor: device fingerprint + IP.
          // ProNet's deviceId stands in for the cookie id (cross-site cookies don't stick).
          const identity = { deviceHash: hashValue(body.deviceId), ipHash: hashValue(ip), cookieId: body.deviceId };
          const pid = { ip, ipHash: identity.ipHash, deviceHash: identity.deviceHash };
          if (await pronetUsedRolling("pronet:tailor:", pid, 25)) {
            return pronetJson(request, { error: "You've used your free rewrite. Create a free account on gotaofferr.com for 5 rewrites every month.", used: true });
          }

          const { runTailor } = await import("@/lib/tailor.server");
          const { detectCountry } = await import("@/lib/resume-locale.server");
          const bigFirst = await firstRunChoice(identity, false);
          const { deviceId: _d, ...tailorInput } = body;
          const result = await runTailor(tailorInput, detectCountry(), bigFirst ? "career_pro" : "free");
          await pronetRecordUse("pronet:tailor:", pid);
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
