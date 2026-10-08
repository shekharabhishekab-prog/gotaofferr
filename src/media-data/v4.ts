import d0 from "./d0";
import d1 from "./d1";
import d2 from "./d2";
import d3 from "./d3";
import d4 from "./d4";
import d5 from "./d5";
import d6 from "./d6";
import d7 from "./d7";
import d8 from "./d8";

const B64: Record<string, string> = {
  "hero.mp4": d0[0],
  "i3760072.webp": d0[1],
  "cta.mp4": d1[0],
  "i5439438.webp": d1[1],
  "s3.mp4": d2[0],
  "hero.webp": d2[1],
  "i7606041.webp": d2[2],
  "about.mp4": d3[0],
  "i8093001.webp": d3[1],
  "shake2.webp": d3[2],
  "i5439153.webp": d3[3],
  "core.mp4": d4[0],
  "i30677714.webp": d4[1],
  "i5989927.webp": d4[2],
  "i5668863.webp": d4[3],
  "cta.webp": d4[4],
  "s2.mp4": d5[0],
  "s1.mp4": d5[1],
  "i5668859.webp": d6[0],
  "core.webp": d6[1],
  "s2.webp": d6[2],
  "s1.webp": d6[3],
  "i19451448.webp": d6[4],
  "i8730781.webp": d6[5],
  "s3.webp": d6[6],
  "about.webp": d6[7],
  "i5668858.webp": d6[8],
  "i36766896.webp": d7[0],
  "i5439455.webp": d7[1],
  "i5439449.webp": d7[2],
  "i3760069.webp": d7[3],
  "t1.mp4": d8[0],
  "t2.mp4": d8[1],
  "t3.mp4": d8[2],
  "ab2.mp4": d8[3],
  "t1.webp": d8[4],
  "t2.webp": d8[5],
  "t3.webp": d8[6],
  "ab2.webp": d8[7],
  "i7859070.webp": d8[8],
};

export function mediaBytes(name: string): Uint8Array | null {
  const b = B64[name];
  if (!b) return null;
  const bin = atob(b);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
