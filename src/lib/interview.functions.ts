import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// AI Interview. Login required. The server keeps nothing: no resume, no job
// description, no questions, no answers, no feedback. The only thing written to
// the database is one row (user id + time) per interview, so plans can count attempts.

const setupSchema = z.object({
  company: z.string().trim().max(120).default(""),
  role: z.string().trim().min(2, "Add the job role.").max(120),
  jd: z.string().trim().min(40, "Paste the job description (at least a few lines).").max(8000),
  resume: z.string().trim().min(80, "We could not read enough text from your resume.").max(12000),
});

const finishSchema = setupSchema.extend({
  qa: z
    .array(z.object({ q: z.string().trim().max(200), a: z.string().trim().max(3000).default("") }))
    .min(1)
    .max(10),
});

export const startInterview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => setupSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { enforcePolicy } = await import("@/lib/rate-limit.server");
    const { makeQuestions } = await import("./interview.server");
    const ctx = context as { userId: string };
    await enforcePolicy("interview_global", "site");
    await enforcePolicy("interview", ctx.userId);
    const questions = await makeQuestions(data);
    try {
      const admin = (await import("@/integrations/supabase/client.server")).supabaseAdmin as any;
      await admin.from("interview_log").insert({ user_id: ctx.userId });
    } catch {
      // Counting is best effort.
    }
    return { questions };
  });

export const finishInterview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => finishSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { enforcePolicy } = await import("@/lib/rate-limit.server");
    const { makeFeedback } = await import("./interview.server");
    const ctx = context as { userId: string };
    await enforcePolicy("interview", ctx.userId);
    const { qa, ...setup } = data;
    return { feedback: await makeFeedback(setup, qa) };
  });

// Coco's voice. Turns one interview question into speech with Google Gemini text-to-speech
// (same free-tier key the site already uses). Login required. Nothing is stored.
const speakSchema = z.object({ text: z.string().trim().min(2).max(300) });

const TTS_MODELS = ["gemini-3.1-flash-tts-preview", "gemini-3.8-flash-lite-tts", "gemini-2.5-flash-preview-tts"];

function pcmToWavBase64(pcm: Uint8Array, rate = 24000): string {
  const h = new ArrayBuffer(44);
  const v = new DataView(h);
  const w = (o: number, t: string) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
  w(0, "RIFF"); v.setUint32(4, 36 + pcm.length, true); w(8, "WAVE"); w(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  w(36, "data"); v.setUint32(40, pcm.length, true);
  const out = new Uint8Array(44 + pcm.length);
  out.set(new Uint8Array(h), 0); out.set(pcm, 44);
  let bin = "";
  for (let i = 0; i < out.length; i += 0x8000) bin += String.fromCharCode(...out.subarray(i, i + 0x8000));
  return btoa(bin);
}

export const cocoSpeak = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => speakSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { enforcePolicy } = await import("@/lib/rate-limit.server");
    const ctx = context as { userId: string };
    const key = process.env.GEMINI_API_KEY;
    if (!key) return { ok: false as const, reason: "no-key" };
    await enforcePolicy("interview_tts_global", "site");
    await enforcePolicy("interview_tts", ctx.userId);
    let lastStatus = 0;
    for (const model of TTS_MODELS) {
      try {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
          method: "POST",
          headers: { "content-type": "application/json", "x-goog-api-key": key },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Speak as a cute, warm, slightly playful young woman who is interviewing someone she likes. Sound like a real person talking, not a newsreader: natural, expressive, with pitch and speed that rise and fall, a gentle smile in the voice, a small thinking pause (a short beat) before the main part of the question, and a little emphasis on the key words. Not flat, not robotic, not rushed. Say exactly this text and nothing else: " + data.text }] }],
            generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Leda" } } } },
          }),
        });
        lastStatus = r.status;
        if (!r.ok) { console.warn("[coco-tts]", model, r.status); continue; }
        const j: any = await r.json();
        const b64: string | undefined = j?.candidates?.[0]?.content?.parts?.find((p: any) => p?.inlineData?.data)?.inlineData?.data;
        if (!b64) continue;
        const bin = atob(b64);
        const pcm = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) pcm[i] = bin.charCodeAt(i);
        return { ok: true as const, wav: pcmToWavBase64(pcm), model };
      } catch (e) {
        console.warn("[coco-tts] error", model, e);
      }
    }
    return { ok: false as const, reason: "status-" + lastStatus };
  });
