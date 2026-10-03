/**
 * Server-only helpers for spending top-up credits.
 *
 * The decrement runs through a security-definer database function so two
 * concurrent requests can never spend the same credit twice.
 */
import type { TopupKind } from "@/lib/topups";

export async function consumeTopupCredit(userId: string, kind: TopupKind): Promise<boolean> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("consume_topup_credit" as any, {
    _user_id: userId,
    _kind: kind,
  } as any);
  if (error) return false;
  return data === true;
}

export async function topupBalance(userId: string, kind: TopupKind): Promise<number> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("topup_balance" as any, {
    _user_id: userId,
    _kind: kind,
  } as any);
  if (error) return 0;
  return Number(data ?? 0);
}
