/**
 * Server-side verification for Cloudflare Turnstile tokens.
 *
 * Used on the two fully public, cost-bearing endpoints: the logged-out resume
 * rewrite and the contact form. Tokens are single-use and short lived, so a
 * scripted client cannot replay one across many requests.
 */

import { getRequestHost } from "@tanstack/react-start/server";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * The Turnstile site key is registered for the production hostnames only, so
 * the widget never issues a token on localhost or preview builds. Enforcing
 * there would lock every logged-out visitor out of the tool, so the gate only
 * applies on the real domains.
 */
function isEnforcedHost(): boolean {
  let host = "";
  try {
    host = (getRequestHost() || "").toLowerCase().split(":")[0] ?? "";
  } catch {
    return false;
  }
  return host === "gotaofferr.com" || host.endsWith(".gotaofferr.com");
}

export async function verifyTurnstile(token: string | undefined, ip?: string): Promise<void> {
  const secret = process.env["TURNSTILE_SECRET_KEY"];
  // No secret configured (local/dev) → skip rather than lock everyone out.
  if (!secret) return;
  if (!isEnforcedHost()) return;

  if (!token) {
    throw new Error("Please complete the human verification check and try again.");
  }

  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);

  let ok = false;
  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    });
    const json = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    ok = json.success === true;
    if (!ok) console.warn("turnstile-verify-failed", json["error-codes"]);
  } catch {
    // Verification service unreachable: fail closed on the abuse-prone paths.
    throw new Error("Verification service is unavailable right now. Please try again in a moment.");
  }

  if (!ok) {
    throw new Error("Human verification failed. Please refresh the page and try again.");
  }
}
