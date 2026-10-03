import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

/**
 * Reads the per-request CSP nonce placed on globalThis by the server
 * middleware. Kept inline (no server-only import) so this module stays safe in
 * the client bundle; returns undefined in the browser and whenever no nonce is
 * in flight, in which case the CSP falls back to allowing inline scripts.
 */
function ssrNonce(): string | undefined {
  if (typeof window !== "undefined") return undefined;
  const als = (globalThis as Record<string, unknown>)["__gotaofferr_csp_nonce_als__"] as
    | { getStore?: () => { nonce: string; used: boolean } | undefined }
    | undefined;
  const store = als?.getStore?.();
  if (!store) return undefined;
  store.used = true;
  return store.nonce;
}

export const getRouter = () => {
  const queryClient = new QueryClient();
  const nonce = ssrNonce();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Prefetch a route's code + data as soon as its link scrolls into view, so
    // taps on mobile (where there is no hover "intent") feel instant.
    defaultPreload: "viewport",
    defaultPreloadDelay: 0,

    // Reuse preloaded route data briefly so hovering links doesn't refetch every time.
    defaultPreloadStaleTime: 30_000,
    defaultPreloadGcTime: 300_000,
    ...(nonce ? { ssr: { nonce } } : {}),
  });

  return router;
};
