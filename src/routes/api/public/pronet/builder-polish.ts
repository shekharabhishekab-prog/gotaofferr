import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { resumeDraftSchema } from "@/lib/resume-builder-schema";

const inputSchema = resumeDraftSchema.extend({
  deviceId: z.string().trim().min(6).max(200),
});

/** ProNet builder final polish - same polishDraft chain, region rules and budgets as terbey.com. */
export const Route = createFileRoute("/api/public/pronet/builder-polish")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => (await import("@/lib/pronet-public.server")).pronetOptions(request),
      POST: async ({ request }) => {
        const { pronetJson, pronetIdentity } = await import("@/lib/pronet-public.server");
        try {
          const body = inputSchema.parse(await request.json());
          const { clientIp, enforcePolicy } = await import("@/lib/rate-limit.server");
          const ip = clientIp(request);
          await enforcePolicy("resume_builder_global", "site");
          await enforcePolicy("resume_builder", ip);

          // Same first-run upgrade as terbey.com's builder: strong models once per person.
          const id = await pronetIdentity(request, body.deviceId);
          let tier: "free" | "career_pro" = "free";
          let firstRunIdentity: { cookieId: string; ipHash: string } | null = null;
          try {
            const { hasUsedFreeRun, firstRunChoice } = await import("@/lib/anon-tailor.server");
            const guestUsed = await hasUsedFreeRun({ deviceHash: id.deviceHash, ipHash: id.ipHash, cookieId: body.deviceId });
            if (await firstRunChoice({ cookieId: body.deviceId, ipHash: id.ipHash }, guestUsed)) {
              tier = "career_pro";
              firstRunIdentity = { cookieId: body.deviceId, ipHash: id.ipHash };
            }
          } catch (e) {
            console.error("[first-run] pronet builder check failed, using lower models", e);
          }

          const { polishDraft } = await import("@/lib/resume-builder.server");
          const { deviceId: _d, ...draft } = body;
          const polished = await polishDraft(draft, tier);
          if (firstRunIdentity) {
            const { recordFirstRun } = await import("@/lib/anon-tailor.server");
            await recordFirstRun(firstRunIdentity);
          }
          return pronetJson(request, polished);
        } catch (error) {
          const { safeErrorMessage } = await import("@/lib/safe-error.server");
          return pronetJson(request, { error: safeErrorMessage("pronet.builderPolish", error, "Could not polish the resume. Please try again.") });
        }
      },
    },
  },
});
