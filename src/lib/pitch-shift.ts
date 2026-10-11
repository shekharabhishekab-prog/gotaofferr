// Browser-side pitch shift that keeps (or sets) the speaking speed.
// Step 1: resample by `pitch` (voice gets higher, speech gets faster).
// Step 2: WSOLA time-stretch to the wanted speed, so only pitch changes.
// Runs on the visitor's device: no server cost, no data leaves the browser.

function stretch(x: Float32Array, factor: number): Float32Array {
  // factor > 1 makes the audio longer (slower), same pitch.
  const N = 1536;
  const Hs = N >> 1;
  const Ha = Hs / factor;
  const tol = 400;
  const outLen = Math.floor(x.length * factor);
  const out = new Float32Array(outLen + N * 2);
  const norm = new Float32Array(outLen + N * 2);
  const win = new Float32Array(N);
  for (let i = 0; i < N; i++) win[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / N);
  let prev = 0;
  for (let k = 0, o = 0; o < outLen; k++, o += Hs) {
    let a = Math.round(k * Ha);
    if (k > 0) {
      const target = prev + Hs;
      let best = a, bestC = -Infinity;
      for (let d = -tol; d <= tol; d += 2) {
        const c0 = a + d;
        if (c0 < 0 || c0 + N > x.length || target + N > x.length) continue;
        let c = 0;
        for (let i = 0; i < Hs; i += 4) c += x[target + i] * x[c0 + i];
        if (c > bestC) { bestC = c; best = c0; }
      }
      a = best;
    }
    if (a + N > x.length) break;
    for (let i = 0; i < N; i++) { out[o + i] += x[a + i] * win[i]; norm[o + i] += win[i]; }
    prev = a;
  }
  for (let i = 0; i < out.length; i++) if (norm[i] > 1e-3) out[i] /= norm[i];
  return out.subarray(0, outLen);
}

export function shiftVoice(ctx: BaseAudioContext, buf: AudioBuffer, pitch: number, rate: number): AudioBuffer {
  const src = buf.getChannelData(0);
  // 1) resample by `pitch`
  const n1 = Math.floor(src.length / pitch);
  const rs = new Float32Array(n1);
  for (let i = 0; i < n1; i++) {
    const p = i * pitch, j = p | 0, f = p - j;
    rs[i] = src[j] * (1 - f) + (src[j + 1] ?? src[j]) * f;
  }
  // 2) stretch so total speed = `rate` (pitch/rate longer than the resampled clip)
  const st = stretch(rs, pitch / rate);
  const out = ctx.createBuffer(1, st.length, buf.sampleRate);
  out.getChannelData(0).set(st);
  return out;
}
