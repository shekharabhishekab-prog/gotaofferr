import { createFileRoute } from "@tanstack/react-router";

import { assistInputSchema } from "@/lib/resume-assist-schema";

/** ProNet builder inline "Improve with AI" - same assistField chain and IP budgets as gotaofferr.com. */
export const Route = createFileRoute("/api/public/pronet/builder-assist")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => (await import("@/lib/pronet-public.server")).pronetOptions(request),
      POST: async ({ request }) => {
        const { pronetJson } = await import("@/lib/pronet-public.server");
        try {
          const input = assistInputSchema.parse(await request.json());
          const { clientIp, enforcePolicy } = await import("@/lib/rate-limit.server");
          const ip = clientIp(request);
          await enforcePolicy("resume_assist_global", "site");
          await enforcePolicy("resume_assist", ip);
          const { assistField } = await import("@/lib/resume-assist.server");
          return pronetJson(request, { text: await assistField(input) });
        } catch (error) {
          const { safeErrorMessage } = await import("@/lib/safe-error.server");
          return pronetJson(request, { error: safeErrorMessage("pronet.builderAssist", error, "AI help failed. Please try again.") });
        }
      },
    },
  },
});
