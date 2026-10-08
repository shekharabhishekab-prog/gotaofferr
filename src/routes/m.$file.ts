import { createFileRoute } from "@tanstack/react-router";

import { mediaBytes } from "@/media-data/v4";
import type {} from "@tanstack/react-start";

export const Route = createFileRoute("/m/$file")({
  server: {
    handlers: {
      GET: async ({ params }: { params: { file: string } }) => {
        const name = params.file;
        const bytes = mediaBytes(name);
        if (!bytes) return new Response("Not found", { status: 404 });
        const type = name.endsWith(".mp4") ? "video/mp4" : "image/webp";
        return new Response(bytes, {
          headers: {
            "Content-Type": type,
            "Cache-Control": "public, max-age=31536000, immutable",
            "Content-Length": String(bytes.length),
          },
        });
      },
    },
  },
});
