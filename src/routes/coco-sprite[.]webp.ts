import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

import { PART as A } from "@/lib/coco-sprite-a";
import { PART as B } from "@/lib/coco-sprite-b";
import { PART as C } from "@/lib/coco-sprite-c";

// Coco's animation sprite sheet (WebP, transparent), served at /coco-sprite.webp.
export const Route = createFileRoute("/coco-sprite.webp")({
  server: {
    handlers: {
      GET: async () => {
        const bytes = Uint8Array.from(atob(A + B + C), (c) => c.charCodeAt(0));
        return new Response(bytes, {
          headers: {
            "Content-Type": "image/webp",
            "Cache-Control": "public, max-age=604800",
          },
        });
      },
    },
  },
});
