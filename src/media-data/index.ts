import cafe_mp4_0 from "./cafe_mp4_0";
import cafe_webp_0 from "./cafe_webp_0";
import commute_mp4_0 from "./commute_mp4_0";
import commute_mp4_1 from "./commute_mp4_1";
import commute_webp_0 from "./commute_webp_0";
import docs_mp4_0 from "./docs_mp4_0";
import docs_webp_0 from "./docs_webp_0";
import interview_mp4_0 from "./interview_mp4_0";
import interview_webp_0 from "./interview_webp_0";
import night_mp4_0 from "./night_mp4_0";
import night_mp4_1 from "./night_mp4_1";
import night_webp_0 from "./night_webp_0";

const B64: Record<string, string> = {
  "cafe.mp4": cafe_mp4_0,
  "cafe.webp": cafe_webp_0,
  "commute.mp4": commute_mp4_0 + commute_mp4_1,
  "commute.webp": commute_webp_0,
  "docs.mp4": docs_mp4_0,
  "docs.webp": docs_webp_0,
  "interview.mp4": interview_mp4_0,
  "interview.webp": interview_webp_0,
  "night.mp4": night_mp4_0 + night_mp4_1,
  "night.webp": night_webp_0,
};

export function mediaBytes(name: string): Uint8Array | null {
  const b = B64[name];
  if (!b) return null;
  const bin = atob(b);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
