import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCookie, getRequest, setCookie } from "@tanstack/react-start/server";

import { tailorInputSchema } from "./tailor-schema";

const anonInputSchema = tailorInputSchema.extend({
  deviceId: z.string().trim().min(6).max(200),
  turnstileToken: z.string().trim().max(4000).optional(),
});

const emailInputSchema = z
  .object({
    email: z.string().trim().email().max(255),
    deviceId: z.string().trim().max(200).optional(),
    source: z.literal("anonymous_tailor").default("anonymous_tailor"),
  })
  .strict();

/** One full tailoring run for a logged-out visitor, once per device. */
export const tailorResumeAnonymous = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => anonInputSchema.parse(input))
  .handler(async ({ data }) => {
    const { ANON_COOKIE, hashValue, hasUsedFreeRun, recordFreeRun } = await import("./anon-tailor.server");
    const { clientIp, enforcePolicy } = await import("@/lib/rate-limit.server");
    const { runTailor } = await import("./tailor.server");
    const { detectCountry } = await import("./resume-locale.server");
    const { verifyTurnstile } = await import("./turnstile.server");

    const request = getRequest();
    const ip = clientIp(request);
    const ipHash = hashValue(ip);

    // Bot gate first: rejects scripted traffic before any AI spend.
    await verifyTurnstile(data.turnstileToken, ip);

    let cookieId = getCookie(ANON_COOKIE);
    if (!cookieId) {
      cookieId = crypto.randomUUID();
      setCookie(ANON_COOKIE, cookieId, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    const identity = { deviceHash: hashValue(data.deviceId), ipHash, cookieId };

    await enforcePolicy("tailor_anon_global", "site");
    await enforcePolicy("tailor_anon", ipHash);

    if (await hasUsedFreeRun(identity)) {
      throw new Error(
        "You've used your free rewrite. Create a free account to keep tailoring — 5 rewrites every month.",
      );
    }

    const { deviceId: _deviceId, turnstileToken: _token, ...tailorInput } = data;
    const result = await runTailor(tailorInput, detectCountry());
    await recordFreeRun(identity);

    return { result };
  });

/** Stores an email captured in exchange for unlocking the anonymous downloads. */
export const captureLeadEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => emailInputSchema.parse(input))
  .handler(async ({ data }) => {
    const { hashValue, saveCapturedEmail } = await import("./anon-tailor.server");
    const { clientIp, enforcePolicy } = await import("@/lib/rate-limit.server");

    await enforcePolicy("capture_email", hashValue(clientIp(getRequest())));

    await saveCapturedEmail(data.email, data.source, data.deviceId ? hashValue(data.deviceId) : null);
    return { ok: true };
  });
