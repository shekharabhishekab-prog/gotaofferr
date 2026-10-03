/**
 * Per-request CSP nonce.
 *
 * The SSR HTML contains inline scripts (TanStack hydration payload, JSON-LD,
 * the analytics bootstrap). Instead of allowing every inline script through
 * `'unsafe-inline'`, each request gets a random nonce that is stamped on the
 * scripts we emit and echoed in the Content-Security-Policy header.
 *
 * The nonce lives in an AsyncLocalStorage so the router (created per request
 * during SSR) and the header middleware see the same value. If the runtime
 * cannot provide AsyncLocalStorage, we simply return no nonce and the header
 * middleware keeps the previous, more permissive policy — never a broken page.
 */

export type NonceStore = { nonce: string; used: boolean };

type Als = {
  run: <T>(store: NonceStore, fn: () => T) => T;
  getStore: () => NonceStore | undefined;
};

const KEY = "__gotaofferr_csp_nonce_als__";

let initialised = false;

async function storage(): Promise<Als | undefined> {
  const g = globalThis as unknown as Record<string, unknown>;
  if (!initialised) {
    initialised = true;
    try {
      const { AsyncLocalStorage } = await import("node:async_hooks");
      g[KEY] = new AsyncLocalStorage();
    } catch {
      /* runtime without async_hooks — nonces disabled */
    }
  }
  return g[KEY] as Als | undefined;
}

function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/[^A-Za-z0-9]/g, "");
}

/**
 * Runs `fn` with a fresh nonce in scope. Returns the store so the caller can
 * check whether the render actually stamped the nonce onto its scripts.
 */
export async function withNonce<T>(
  fn: () => T | Promise<T>,
): Promise<{ result: T; store?: NonceStore }> {
  const als = await storage();
  if (!als) return { result: await fn() };
  const store: NonceStore = { nonce: createNonce(), used: false };
  const result = await als.run(store, () => fn());
  return { result: await result, store };
}
