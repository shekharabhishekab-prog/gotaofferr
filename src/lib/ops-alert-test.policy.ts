export const OPS_TEST_HOST = "phase18-preview-gotaofferr-copy.shekhar-abhishekab.workers.dev";
export const OPS_TEST_RECIPIENT = "shekhar.abhishekab@gmail.com";
export const OPS_TEST_SUBJECT = "[gotaofferr alert] TEST delivery check";
export const OPS_TEST_BODY = "TEST ONLY. This is a delivery check for GotaOfferr alerts, not a real incident. No customer data or payment is involved.";

export function requireOpsTestHost(hostname: string): void {
  if (hostname !== OPS_TEST_HOST) throw new Error("Test control is preview-only.");
}

export async function sendOpsMessage(input: { key: string; domain: string; to: string[]; subject: string; text: string; idempotencyKey?: string }, fetcher: typeof fetch = fetch): Promise<{ accepted: boolean; id?: string }> {
  const response = await fetcher("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${input.key}`, "Content-Type": "application/json", ...(input.idempotencyKey ? { "Idempotency-Key": input.idempotencyKey } : {}) },
    body: JSON.stringify({ from: `GotaOfferr alerts <noreply@${input.domain}>`, to: input.to, subject: input.subject, text: input.text }),
  });
  if (!response.ok) {
    console.error("[ops-alert] provider rejected", response.status);
    return { accepted: false };
  }
  const data = await response.json().catch(() => ({})) as { id?: string };
  return { accepted: true, id: typeof data.id === "string" ? data.id : undefined };
}
