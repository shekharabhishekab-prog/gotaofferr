import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

import { PART as C1_0 } from "@/lib/cv1_0";
import { PART as C1_1 } from "@/lib/cv1_1";
import { PART as C2_0 } from "@/lib/cv2_0";
import { PART as C2_1 } from "@/lib/cv2_1";
import { PART as C3_0 } from "@/lib/cv3_0";
import { PART as C3_1 } from "@/lib/cv3_1";
import { PART as C4_0 } from "@/lib/cv4_0";
import { PART as C4_1 } from "@/lib/cv4_1";
import { PART as C5_0 } from "@/lib/cv5_0";
import { PART as C5_1 } from "@/lib/cv5_1";
import { PART as C5_2 } from "@/lib/cv5_2";
import { PART as C6_0 } from "@/lib/cv6_0";
import { PART as C6_1 } from "@/lib/cv6_1";
import { PART as C7_0 } from "@/lib/cv7_0";
import { PART as C7_1 } from "@/lib/cv7_1";

// Coco's room clips (H.264, no audio) at /coco-clip/1 .. /coco-clip/7, byte-range support (Safari needs it).
const PARTS: Record<number, string[]> = {
  1: [C1_0, C1_1],
  2: [C2_0, C2_1],
  3: [C3_0, C3_1],
  4: [C4_0, C4_1],
  5: [C5_0, C5_1, C5_2],
  6: [C6_0, C6_1],
  7: [C7_0, C7_1],
};
const cache: Record<number, Uint8Array> = {};
const bytesOf = (n: number) => (cache[n] ??= Uint8Array.from(atob(PARTS[n].join("")), (c) => c.charCodeAt(0)));

export const Route = createFileRoute("/coco-clip/$n")({
  server: {
    handlers: {
      GET: async ({ request, params }: { request: Request; params: { n: string } }) => {
        const n = parseInt(params.n, 10);
        if (!PARTS[n]) return new Response("Not found", { status: 404 });
        const all = bytesOf(n);
        const base = { "Content-Type": "video/mp4", "Accept-Ranges": "bytes", "Cache-Control": "public, max-age=604800" };
        const m = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("range") || "");
        if (m && (m[1] || m[2])) {
          const start = m[1] ? parseInt(m[1], 10) : Math.max(0, all.length - parseInt(m[2], 10));
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
