// Free backup voice (Azure Speech F0). Used only when the Cloudflare voice is unavailable or capped.
// F0 has a hard monthly stop (no charge). Our own cap below stays well under it.
import { countCall } from "@/lib/model-router.server";

export async function azureFallback(text: string): Promise<{ ok: true; wav: string; model: string; mime: string } | null> {
  let cfe: any = null;
  try { cfe = ((await import(/* @vite-ignore */ "cloudflare:workers" as string)) as any).env; } catch { cfe = null; }
  const key = process.env.AZURE_SPEECH_KEY || cfe?.AZURE_SPEECH_KEY;
  if (!key) return null;
  const region = String(process.env.AZURE_SPEECH_REGION || cfe?.AZURE_SPEECH_REGION || "centralindia").replace(/[^a-z0-9]/gi, "");
  const t = text.replace(/[<>&]/g, " ").slice(0, 300);
  try {
    if (!(await countCall("azure-speech"))) return null;
    const ssml = `<speak version='1.0' xml:lang='en-US'><voice xml:lang='en-US' name='en-US-AnaNeural'>${t}</voice></speak>`;
    const r = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: "POST",
      headers: { "Ocp-Apim-Subscription-Key": key, "Content-Type": "application/ssml+xml", "X-Microsoft-OutputFormat": "riff-24khz-16bit-mono-pcm" },
      body: ssml,
    });
    if (!r.ok) { console.warn("[coco-tts] azure", r.status); return null; }
    const bytes = new Uint8Array(await r.arrayBuffer());
    if (bytes.length < 2000 || bytes.length > 900000) return null;
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return { ok: true, wav: btoa(bin), model: "azure-f0", mime: "audio/wav" };
  } catch (e) {
    console.warn("[coco-tts] azure error", e);
    return null;
  }
}
