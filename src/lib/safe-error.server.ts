/**
 * Server-side error boundary helpers.
 *
 * Rule: users get a short, generic, actionable sentence. Stack traces, file
 * paths, SQL text, provider payloads and Postgres error codes are logged
 * server-side only and never cross the RPC boundary.
 */

/** Errors we intentionally show verbatim (quota, plan gating, validation copy). */
export class UserFacingError extends Error {
  readonly userFacing = true;
}

export function userError(message: string): UserFacingError {
  return new UserFacingError(message);
}

function isUserFacing(error: unknown): boolean {
  return error instanceof UserFacingError || (error as { userFacing?: boolean })?.userFacing === true;
}

/**
 * Logs the full failure with context and returns an Error carrying only a
 * generic message. Always `throw safeError(...)` rather than a raw DB error.
 */
export function safeError(
  scope: string,
  error: unknown,
  publicMessage = 'Something went wrong on our end. Please try again.',
): Error {
  if (isUserFacing(error)) return error as Error;
  console.error(`[${scope}]`, error);
  void import('./ops-alert.server').then((m) => m.opsAlert(`server error: ${scope}`, error)).catch(() => {});
  return new Error(publicMessage);
}

/** Same contract for handlers that return `{ error }` instead of throwing. */
export function safeErrorMessage(
  scope: string,
  error: unknown,
  publicMessage = 'Something went wrong on our end. Please try again.',
): string {
  if (isUserFacing(error)) return (error as Error).message;
  console.error(`[${scope}]`, error);
  return publicMessage;
}

