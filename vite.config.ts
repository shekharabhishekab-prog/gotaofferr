// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import path from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv } from "vite";

// Server-side code (email routes, server functions) needs non-VITE_ env vars
// in process.env. These are NOT exposed to the client bundle.
const serverEnv = loadEnv(process.env.NODE_ENV || "development", process.cwd(), "");
Object.assign(process.env, serverEnv);

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Workers AI binding for the interview voice (preview test). Plan not yet verified, so the app enforces its own hard daily cap (490).
  nitro: { cloudflare: { wrangler: { ai: { binding: "AI" } } } },
  vite: {
    plugins: [],
    resolve: {
      alias: {
        // React Email's htmlparser2 path needs entities v4.5.0; pin every import
        // to the hoisted copy so a nested v5+ copy can't break SSR.
        "entities/lib/decode.js": path.resolve(process.cwd(), "node_modules/entities/lib/decode.js"),
        "entities/lib/encode.js": path.resolve(process.cwd(), "node_modules/entities/lib/encode.js"),
        entities: path.resolve(process.cwd(), "node_modules/entities"),
        // pdfjs-dist legacy build optionally imports this browser-only package,
        // whose exports map has no default/worker condition -> breaks SSR build.
        "path2d-polyfill": path.resolve(process.cwd(), "src/lib/path2d-polyfill-stub.ts"),
        canvas: path.resolve(process.cwd(), "src/lib/canvas-stub.ts"),
      },
    },
  },
});
