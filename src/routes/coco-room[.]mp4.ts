import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

import { PART as P0 } from "@/lib/coco-vid-0";
import { PART as P1 } from "@/lib/coco-vid-1";
import { PART as P2 } from "@/lib/coco-vid-2";
import { PART as P3 } from "@/lib/coco-vid-3";
import { PART as P4 } from "@/lib/coco-vid-4";
import { PART as P5 } from "@/lib/coco-vid-5";

// Coco's room animation (H.264, no audio), served at /coco-room.mp4 with byte-range support (Safari needs it).
let cache: Uint8Array | null = null;
const bytesOf = () => (cache ??= Uint8Array.from(atob(P0 + P1 + P2 + P3 + P4 + P5), (c) => c.charCodeAt(0)));

export const Route = createFileRoute("/coco-room.mp4")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const all = bytesOf();
        const base = { "Content-Type": "video/mp4", "Accept-Ranges": "bytes", "Cache-Control": "public, max-age=604800" };
        const m = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("range") || "");
        if (m && (m[1] || m[2])) {
          let start = m[1] ? parseInt(m[1], 10) : Math.max(0, all.length - parseInt(m[2], 10));
          let end = m[1] && m[2] ? parseInt(m[2], 10) : all.length - 1;
          end = Math.min(end, all.length - 1);
          if (start > end || start >= all.length) return new Response(null, { status: 416, headers: { ...base, "Content-Range": `bytes */${all.length}` } });
          const part = all.slice(start, end + 1);
          return new Response(part, { status: 206, headers: { ...base, "Content-Length": String(part.length), "Content-Range": `bytes ${start}-${end}/${all.length}` } });
        }
        return new Response(all, { headers: { ...base, "Content-Length": String(all.length) } });
      },
    },
  },
});
