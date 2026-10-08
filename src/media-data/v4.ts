import d0 from "./d0";
import d1 from "./d1";
import d2 from "./d2";
import d3 from "./d3";
import d4 from "./d4";
import d5 from "./d5";
import d6 from "./d6";
import d7 from "./d7";
import d8 from "./d8";
import d9 from "./d9";
import d10 from "./d10";
import d11 from "./d11";

const B64: Record<string, string> = {
  "h1.mp4": d10[0],
  "h2.mp4": d10[1],
  "h3.mp4": d10[4],
  "h3.webp": d10[5],
  "bric.ttf": d11[0],
  "inst.ttf": d11[1],
  "h1.webp": d10[2],
  "h2.webp": d10[3],
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
  "c1.mp4": d9[0],
  "c2.mp4": d9[1],
  "c3.mp4": d9[2],
  "c1.webp": d9[3],
  "c2.webp": d9[4],
  "c3.webp": d9[5],
  "i4226261.webp": d9[6],
  "i5716008.webp": d9[7],
  "i5411999.webp": d9[8],
  "i5749153.webp": d9[9],
  "i6814521.webp": d9[10],
  "i6830879.webp": d9[11],
  "i7641842.webp": d9[12],
  "i7652126.webp": d9[13],
  "i7654396.webp": d9[14],
  "i7674645.webp": d9[15],
  "i7875949.webp": d9[16],
  "i8154580.webp": d9[17],
  "i8297441.webp": d9[18],
  "i8301225.webp": d9[19],
  "i8441808.webp": d9[20],
  "i8837769.webp": d9[21],
};

export function mediaBytes(name: string): Uint8Array | null {
  const b = B64[name];
  if (!b) return null;
  const bin = atob(b);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
