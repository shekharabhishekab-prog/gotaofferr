// Signed one-click unsubscribe links for job alert emails.
async function hmac(id: string): Promise<string> {
  const secret = process.env.JOB_ALERTS_CRON_SECRET || "";
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`alert-unsub:${id}`));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function alertUnsubscribeUrl(alertId: string): Promise<string> {
  return `https://terbey.com/api/public/jobs/unsubscribe?a=${alertId}&t=${await hmac(alertId)}`;
}

export async function verifyAlertUnsubscribe(alertId: string, token: string): Promise<boolean> {
  if (!process.env.JOB_ALERTS_CRON_SECRET) return false;
  return (await hmac(alertId)) === token;
}
