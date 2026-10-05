import { toast as base } from "sonner";
import { friendlyMessage } from "@/lib/friendly-error";

/**
 * Drop-in replacement for sonner's toast. Error toasts always go through the
 * friendly-error layer, so no raw text can reach a customer.
 * Short validation hints (no technical wording) pass through unchanged.
 */
const TECHNICAL =
  /error|exception|failed|invalid|forbidden|null|undefined|fetch|network|timeout|supabase|razorpay|gemini|json|token|jwt|status|\b[45]\d\d\b|could not|couldn't|unable|went wrong|not found|denied|refused|unexpected/i;

function clean(msg: unknown, always: boolean): unknown {
  if (typeof msg !== "string") return msg;
  if (always || TECHNICAL.test(msg) || msg.length > 140) return friendlyMessage(msg);
  return msg;
}

export const toast = Object.assign(
  ((msg: any, opts?: any) => base(msg, opts)) as typeof base,
  base,
  {
    error: (msg: any, opts?: any) => base.error(clean(msg, false) as any, opts),
    info: (msg: any, opts?: any) => base.info(clean(msg, false) as any, opts),
    warning: (msg: any, opts?: any) => base.warning(clean(msg, false) as any, opts),
  },
);
