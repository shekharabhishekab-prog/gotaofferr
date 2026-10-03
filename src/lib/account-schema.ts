import { z } from "zod";

/**
 * Validation schemas for the account server functions.
 *
 * These live outside `account.functions.ts` on purpose: files that declare
 * server functions must stay thin wrappers, otherwise the server-function
 * splitter can fail to resolve module-scope dependencies at build time.
 */
export const profileUpdateSchema = z.object({
  fullName: z.string().trim().max(120),
});

export const runIdSchema = z.object({ id: z.string().uuid() });

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1).max(72),
  newPassword: z.string().min(8).max(72),
});
