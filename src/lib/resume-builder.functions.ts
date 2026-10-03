import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

import { assistInputSchema } from "./resume-assist-schema";
import { resumeDraftSchema } from "./resume-builder-schema";

const polishInputSchema = resumeDraftSchema.extend({
  turnstileToken: z.string().trim().max(4000).optional(),
});

/**
 * Inline "improve this field" help used across the builder form. Same public
 * protections as the full polish, on its own wider budget because each call is
 * small.
 */
export const assistResumeField = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => assistInputSchema.parse(input))
  .handler(async ({ data }) => {
    const { clientIp, enforcePolicy } = await import("@/lib/rate-limit.server");
    const { verifyTurnstile } = await import("./turnstile.server");
    const { assistField } = await import("./resume-assist.server");

    const ip = clientIp(getRequest());
    await verifyTurnstile(data.turnstileToken, ip);
    await enforcePolicy("resume_assist_global", "site");
    await enforcePolicy("resume_assist", ip);

    const { turnstileToken: _token, ...input } = data;
    return { text: await assistField(input) };
  });


/**
 * Free for everyone, signed in or not — the download is what asks for an
 * account. Protected like the other public, cost-bearing endpoints: a
 * Turnstile bot gate, a site-wide daily cap that survives IP rotation, and a
 * per-IP rate limit.
 */
export const polishResumeDraft = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => polishInputSchema.parse(input))
  .handler(async ({ data }) => {
    const { clientIp, enforcePolicy } = await import("@/lib/rate-limit.server");
    const { verifyTurnstile } = await import("./turnstile.server");
    const { polishDraft } = await import("./resume-builder.server");

    const ip = clientIp(getRequest());

    // Bot gate first: rejects scripted traffic before any AI spend.
    await verifyTurnstile(data.turnstileToken, ip);

    await enforcePolicy("resume_builder_global", "site");
    await enforcePolicy("resume_builder", ip);

    const { turnstileToken: _token, ...draft } = data;
    return await polishDraft(draft);
  });
