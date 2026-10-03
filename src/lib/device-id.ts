/**
 * Lightweight, privacy-safe browser fingerprint used only to allow exactly one
 * logged-out resume rewrite per device. Combines stable device traits with a
 * random id persisted in localStorage.
 */

const KEY = "gao_device_id";

/** Canvas rendering differs subtly per GPU/driver/OS — survives incognito. */
function canvasSignal(): string {
  try {
    const c = document.createElement("canvas");
    c.width = 200;
    c.height = 40;
    const ctx = c.getContext("2d");
    if (!ctx) return "nocanvas";
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.fillStyle = "#f60";
    ctx.fillRect(0, 0, 100, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("GotaOfferr:fp@1", 2, 4);
    ctx.fillStyle = "rgba(102,204,0,0.7)";
    ctx.fillText("GotaOfferr:fp@1", 4, 12);
    return c.toDataURL().slice(-96);
  } catch {
    return "canvaserr";
  }
}

/** Which fonts are installed is a stable, per-machine signal. */
function fontSignal(): string {
  try {
    const base = ["monospace", "sans-serif", "serif"];
    const probe = [
      "Arial",
      "Courier New",
      "Georgia",
      "Helvetica Neue",
      "Times New Roman",
      "Trebuchet MS",
      "Verdana",
      "Segoe UI",
      "Roboto",
      "Menlo",
      "Tahoma",
      "Calibri",
    ];
    const span = document.createElement("span");
    span.style.cssText =
      "position:absolute;left:-9999px;top:-9999px;font-size:72px;line-height:normal;visibility:hidden";
    span.textContent = "mmmmmmmmmmlli";
    document.body.appendChild(span);

    const baseline: Record<string, [number, number]> = {};
    for (const b of base) {
      span.style.fontFamily = b;
      baseline[b] = [span.offsetWidth, span.offsetHeight];
    }
    const bits = probe.map((f) => {
      let detected = 0;
      for (const b of base) {
        span.style.fontFamily = `'${f}',${b}`;
        const ref = baseline[b]!;
        if (span.offsetWidth !== ref[0] || span.offsetHeight !== ref[1]) detected = 1;
      }
      return detected;
    });
    span.remove();
    return bits.join("");
  } catch {
    return "fonterr";
  }
}

/** WebGL vendor/renderer strings identify the GPU. */
function webglSignal(): string {
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    if (!gl) return "nogl";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (!ext) return String(gl.getParameter(gl.VERSION));
    return `${gl.getParameter(ext.UNMASKED_VENDOR_WEBGL)}~${gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)}`;
  } catch {
    return "glerr";
  }
}

function traits(): string {
  if (typeof window === "undefined") return "ssr";
  const n = window.navigator;
  const s = window.screen;
  return [
    n.userAgent,
    n.language,
    (n.languages || []).join(","),
    n.hardwareConcurrency ?? 0,
    (n as unknown as { deviceMemory?: number }).deviceMemory ?? 0,
    n.maxTouchPoints ?? 0,
    s?.width,
    s?.height,
    s?.colorDepth,
    (s as unknown as { availWidth?: number }).availWidth ?? 0,
    new Date().getTimezoneOffset(),
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvasSignal(),
    fontSignal(),
    webglSignal(),
  ].join("|");
}

function hash(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
    h2 = Math.imul(h2 + c, 2246822519) >>> 0;
  }
  return `${h1.toString(36)}${h2.toString(36)}`;
}

export function getDeviceId(): string {
  const fingerprint = hash(traits());
  if (typeof window === "undefined") return fingerprint;
  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(KEY);
    if (!stored) {
      stored = Math.random().toString(36).slice(2) + Date.now().toString(36);
      window.localStorage.setItem(KEY, stored);
    }
  } catch {
    stored = "nostorage";
  }
  return `${fingerprint}.${stored}`;
}
