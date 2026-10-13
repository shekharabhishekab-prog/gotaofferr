/**
 * Free AI chain for the job finder listing cleanup ONLY.
 * Order: Groq gpt-oss-20b -> Groq gpt-oss-120b -> Groq qwen3.8-27b -> Gemini 3.5 Flash Lite (separate Google project/key)
 * -> null (the caller then shows the plain search results).
 *
 * Rules:
 * - Zero spend. Only free-tier keys. No Cloudflare Workers AI here (it stays for interview voice).
 * - Never used by ATS, resume builder, tailor, interview or any other feature.
 * - Fail closed: if a daily counter cannot be read or is over its cap, that layer is skipped. If every layer is skipped or fails, return null.
 * - Caps sit near 70% of the verified free limits (Groq: 200K tokens/day and 8K tokens/min per model; Gemini 3.5 Flash Lite: 500 requests/day).
 */
import { jobListingsSchema, type JobListing } from "./jobs-schema";

type Layer = {
  id: string;
  kind: "groq" | "gemini";
  model: string;
  /** Calls per day. Groq: about 3.5K tokens per call => 40 calls stays under 140K tokens (70% of 200K). Gemini: 350 of 500. */
  dailyCap: number;
  keyEnv: string;
};

const LAYERS: Layer[] = [
  { id: "jobs-groq-gpt-oss-20b", kind: "groq", model: "openai/gpt-oss-20b", dailyCap: 40, keyEnv: "GROQ_API_KEY" },
  { id: "jobs-groq-gpt-oss-120b", kind: "groq", model: "openai/gpt-oss-120b", dailyCap: 40, keyEnv: "GROQ_API_KEY" },
  { id: "jobs-groq-qwen3.8-27b", kind: "groq", model: "qwen/qwen3.8-27b", dailyCap: 40, keyEnv: "GROQ_API_KEY" },
  { id: "jobs-gemini-3.5-flash-lite", kind: "gemini", model: "gemini-3.5-flash-lite", dailyCap: 350, keyEnv: "GEMINI_JOBS_API_KEY" },
];

const MAX_OUT = 2200;
const EST_TOKENS_PER_CALL = 4200; // worst case for one chunk of 10 results
const GROQ_TPM_BUDGET = 5600; // 70% of 8K tokens per minute
const CALL_TIMEOUT_MS = 30_000;

// Per-instance minute guard for Groq tokens (the daily counter is shared through the database).
const minuteUse = new Map<string, { t: number; tokens: number }[]>();
const cooldownUntil = new Map<string, number>();

function utcDay() {
  return new Date().toISOString().slice(0, 10);
}
function pacificDay() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
}

function reserveMinute(layer: Layer): boolean {
  if (layer.kind !== "groq") return true;
  const now = Date.now();
  const list = (minuteUse.get(layer.id) ?? []).filter((x) => now - x.t < 60_000);
  const used = list.reduce((s, x) => s + x.tokens, 0);
  if (used + EST_TOKENS_PER_CALL > GROQ_TPM_BUDGET) {
    minuteUse.set(layer.id, list);
    return false;
  }
  list.push({ t: now, tokens: EST_TOKENS_PER_CALL });
  minuteUse.set(layer.id, list);
  return true;
}
function settleMinute(layer: Layer, actual: number | undefined) {
  if (layer.kind !== "groq" || typeof actual !== "number") return;
  const list = minuteUse.get(layer.id);
  const last = list?.[list.length - 1];
  if (last) last.tokens = actual;
}

/** Counts one call in the shared daily counter. Fail closed: any error means "do not call". */
async function bumpDaily(layer: Layer): Promise<boolean> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await (supabaseAdmin as any).rpc("bump_ai_model_usage", {
      p_day: layer.kind === "gemini" ? pacificDay() : utcDay(),
      p_model: layer.id,
      p_cap: layer.dailyCap,
      p_warn: Math.max(1, Math.ceil(layer.dailyCap * 0.2)),
    });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return false;
    return !row.over_cap;
  } catch (e) {
    console.error("[job-ai] counter failed, layer skipped", layer.id, String((e as any)?.message ?? e));
    return false;
  }
}

const STRICT_SCHEMA = {
  name: "job_listings",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["jobs"],
    properties: {
      jobs: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["title", "company", "location", "workMode", "experience", "salary", "source", "url", "summary", "match"],
          properties: {
            title: { type: "string" },
            company: { type: "string" },
            location: { type: "string" },
            workMode: { type: "string" },
            experience: { type: "string" },
            salary: { type: "string" },
            source: { type: "string" },
            url: { type: "string" },
            summary: { type: "string" },
            match: { type: "string", enum: ["exact", "related"] },
          },
        },
      },
    },
  },
};

const FORMAT_NOTE = `

OUTPUT FORMAT: return ONLY a JSON object {"jobs":[{"title","company","location","workMode","experience","salary","source","url","summary","match"}]} with all ten fields as strings.
- salary: copy the pay only when the text states it (salary, stipend, LPA, per hour, per year all count as pay). If not stated write "Not specified". Never put a link, a place or a work mode in salary.
- Never invent a company, place, pay or link. If a field is not in the text write "Not specified" (company: use the source site name).`;

async function callLayer(layer: Layer, prompt: string): Promise<{ jobs: JobListing[] } | null> {
  const key = process.env[layer.keyEnv];
  if (!key) return null;
  const body = prompt + FORMAT_NOTE;
  let text: string | undefined;
  let tokens: number | undefined;
  if (layer.kind === "groq") {
    const payload: Record<string, unknown> = {
      model: layer.model,
      messages: [{ role: "user", content: body }],
      temperature: 0,
      max_tokens: MAX_OUT,
      response_format: { type: "json_schema", json_schema: STRICT_SCHEMA },
    };
    if (layer.model.includes("gpt-oss")) payload.reasoning_effort = "low";
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(CALL_TIMEOUT_MS),
    });
    if (res.status === 429) cooldownUntil.set(layer.id, Date.now() + 60_000);
    if (!res.ok) throw new Error(`groq-${res.status}`);
    const j: any = await res.json();
    text = j?.choices?.[0]?.message?.content;
    tokens = j?.usage?.total_tokens;
    settleMinute(layer, tokens);
  } else {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${layer.model}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: body }] }],
        generationConfig: { temperature: 0, maxOutputTokens: MAX_OUT, responseMimeType: "application/json" },
      }),
      signal: AbortSignal.timeout(CALL_TIMEOUT_MS),
    });
    if (res.status === 429) cooldownUntil.set(layer.id, Date.now() + 60_000);
    if (!res.ok) throw new Error(`gemini-${res.status}`);
    const j: any = await res.json();
    text = j?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text ?? "").join("");
    tokens = j?.usageMetadata?.totalTokenCount;
  }
  if (!text) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  const checked = jobListingsSchema.safeParse(parsed);
  if (!checked.success) return null;
  console.info(`[job-ai] ${layer.id} ok jobs=${checked.data.jobs.length} tokens=${tokens ?? "?"}`);
  return checked.data;
}

/** Cleans one chunk of search results. Returns null when every layer is skipped or fails (caller shows plain results). */
export async function cleanJobListings(prompt: string): Promise<{ jobs: JobListing[] } | null> {
  for (const layer of LAYERS) {
    if ((cooldownUntil.get(layer.id) ?? 0) > Date.now()) continue;
    if (!process.env[layer.keyEnv]) continue;
    if (!reserveMinute(layer)) continue;
    if (!(await bumpDaily(layer))) continue;
    try {
      const out = await callLayer(layer, prompt);
      if (out) return out;
      console.warn(`[job-ai] ${layer.id} gave no valid answer, trying next`);
    } catch (e) {
      console.warn(`[job-ai] ${layer.id} failed: ${String((e as any)?.message ?? e)}`);
    }
  }
  console.warn("[job-ai] all layers skipped or failed, plain results used");
  return null;
}
