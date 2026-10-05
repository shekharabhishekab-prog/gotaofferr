import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { packById, toMinorUnits, topupAmount, type TopupKind } from "@/lib/topups";
import { pricingForCurrency } from "@/lib/pricing-currency";
import { getPaymentsErrorMessage, rzp } from "@/lib/razorpay.server";

const orderSchema = z.object({
  packId: z.string().min(1).max(40),
  currency: z.string().min(3).max(3),
});

type OrderResult =
  | {
      orderId: string;
      keyId: string;
      amount: number;
      currency: string;
      name: string;
      prefill: { email?: string; name?: string };
    }
  | { error: string };

/**
 * Creates a one-off Razorpay order for a top-up pack. The price is always
 * computed on the server from the catalogue, so the browser cannot ask to be
 * charged less than the pack costs.
 */
export const createTopupOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => orderSchema.parse(input))
  .handler(async ({ data, context }): Promise<OrderResult> => {
    const pack = packById(data.packId);
    if (!pack) return { error: "Unknown top-up pack" };

    try {
      const { enforcePolicy } = await import("@/lib/rate-limit.server");
      await enforcePolicy("payments-checkout", context.userId);
      const pricing = pricingForCurrency(data.currency);
      const amount = topupAmount(pricing, pack);
      const minor = toMinorUnits(amount, pricing.code);

      const {
        data: { user },
      } = await context.supabase.auth.getUser();
      const email = user?.email ?? undefined;
      const name = (user?.user_metadata as any)?.full_name ?? undefined;

      const order = await rzp<any>("/orders", {
        method: "POST",
        body: {
          amount: minor,
          currency: pricing.code,
          notes: { userId: context.userId, packId: pack.id, kind: pack.kind },
        },
      });

      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.from("credit_topups").insert({
        user_id: context.userId,
        kind: pack.kind,
        pack_id: pack.id,
        credits: pack.credits,
        remaining: 0,
        status: "pending",
        currency: pricing.code,
        amount,
        razorpay_order_id: order.id,
      } as any);
      if (error) {
        const { safeErrorMessage } = await import("@/lib/safe-error.server");
        return { error: safeErrorMessage("createTopupOrder", error, "Could not start this top-up. Please try again.") };
      }

      return {
        orderId: order.id,
        keyId: (await import("@/lib/razorpay.server")).razorpayKeys().id!,
        amount: minor,
        currency: pricing.code,
        name: pack.name,
        prefill: { ...(email && { email }), ...(name && { name }) },
      };
    } catch (error) {
      return { error: getPaymentsErrorMessage(error) };
    }
  });

const verifySchema = z.object({
  orderId: z.string().min(4).max(64),
  paymentId: z.string().min(4).max(64),
  signature: z.string().min(8).max(256),
});

/**
 * Confirms a top-up payment and releases the credits. The checkout signature
 * is verified first, then the payment is re-read from Razorpay so a forged
 * client call can never unlock credits.
 */
export const verifyTopupPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => verifySchema.parse(input))
  .handler(async ({ data, context }): Promise<{ ok: boolean; credits?: number; error?: string }> => {
    try {
      const { enforcePolicy } = await import("@/lib/rate-limit.server");
      await enforcePolicy("payments-verify", context.userId);

      const { createHmac, timingSafeEqual } = await import("node:crypto");
      const secret = (await import("@/lib/razorpay.server")).razorpayKeys().secret;
      if (!secret) return { ok: false, error: "Payments are not configured." };

      const expected = createHmac("sha256", secret)
        .update(`${data.orderId}|${data.paymentId}`)
        .digest("hex");
      const a = Buffer.from(expected);
      const b = Buffer.from(data.signature);
      if (a.length !== b.length || !timingSafeEqual(a, b)) {
        return { ok: false, error: "Payment could not be verified." };
      }

      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: row } = await supabaseAdmin
        .from("credit_topups")
        .select("id, user_id, kind, pack_id, credits, status")
        .eq("razorpay_order_id", data.orderId)
        .maybeSingle();

      if (!row) return { ok: false, error: "Top-up order not found." };
      if ((row as any).user_id !== context.userId) {
        return { ok: false, error: "This order belongs to another account." };
      }
      if ((row as any).status === "paid") return { ok: true, credits: (row as any).credits };

      // Source of truth: Razorpay itself.
      const payment = await rzp<any>(`/payments/${data.paymentId}`);
      if (payment?.order_id !== data.orderId) {
        return { ok: false, error: "Payment does not match this order." };
      }
      if (payment?.status !== "captured" && payment?.status !== "authorized") {
        return { ok: false, error: "Payment has not completed yet." };
      }

      const pack = packById((row as any).pack_id);
      const validDays = pack?.validDays ?? 90;
      const expiresAt = new Date(Date.now() + validDays * 86_400_000).toISOString();

      const { error } = await supabaseAdmin
        .from("credit_topups")
        .update({
          status: "paid",
          remaining: (row as any).credits,
          razorpay_payment_id: data.paymentId,
          expires_at: expiresAt,
        } as any)
        .eq("id", (row as any).id);
      if (error) {
        const { safeErrorMessage } = await import("@/lib/safe-error.server");
        return { ok: false, error: safeErrorMessage("verifyTopupPayment", error, "Could not confirm this payment. Please contact support.") };
      }

      return { ok: true, credits: (row as any).credits };
    } catch (error) {
      return { ok: false, error: getPaymentsErrorMessage(error) };
    }
  });

export type TopupBalances = Record<TopupKind, number>;

/** Credits still available on this account, for the usage meters. */
export const getTopupBalances = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<TopupBalances> => {
    const { data } = await context.supabase
      .from("credit_topups")
      .select("kind, remaining, expires_at, status")
      .eq("user_id", context.userId)
      .eq("status", "paid")
      .gt("remaining", 0);

    const balances: TopupBalances = { tailor: 0, job_search: 0, job_alert: 0 };
    const now = Date.now();
    for (const row of (data ?? []) as any[]) {
      if (row.expires_at && new Date(row.expires_at).getTime() <= now) continue;
      balances[row.kind as TopupKind] += row.remaining as number;
    }
    return balances;
  });

