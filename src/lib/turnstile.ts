/**
 * Cloudflare Turnstile site key. This is a public value by design — it is
 * rendered into the widget in the browser. The matching secret key lives in
 * server-side secrets and is never exposed.
 */
export const TURNSTILE_SITE_KEY = "0x4AAAAAAFb95RQFKZMz6Xxk";

export const TURNSTILE_SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
