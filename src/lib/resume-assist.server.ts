import { PROMPT_GUARD } from "./prompt-guard";
import { generateText } from "ai";

import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

import type { AssistInput } from "./resume-assist-schema";

const BASE_RULES = `Rules you must follow:
- Never invent an employer, job title, date, degree, tool, client, metric or number that is not in the user's text. If a number is missing, write the outcome without one.
- Keep every fact the user gave, including exact names, tools and figures.
- Plain professional English. No "Responsible for", "Spearheaded", "Leveraged", "Utilized", "Passionate", "Dynamic", "Seasoned", no em dashes, no buzzwords, no emojis.
- It must read like an experienced professional wrote it by hand, not like AI output.
- Return only the rewritten content. No headings, no preamble, no quotes, no markdown.`;

function instruction(data: AssistInput): string {
  return `${PROMPT_GUARD}\n\n${instructionBody(data)}`;
}

function instructionBody(data: AssistInput): string {
  const region =
    data.template === "india"
      ? "Audience: Indian recruiters and Indian ATS portals. Indian English spelling."
      : "Audience: US, UK, EU, Canada, Australia and Gulf employers on Greenhouse or Workday. No personal details such as age, date of birth, marital status or parents' names.";

  const target = data.targetRole ? `The candidate is targeting: ${data.targetRole}.` : "";

  switch (data.kind) {
    case "summary":
      return `${region} ${target}
Rewrite the candidate's rough "about me" into a professional resume summary of 2 to 3 sentences. No "I". Name the real domain and years of experience only if the text supports it.
${BASE_RULES}`;
    case "skills":
      return `${region} ${target}
Clean up this skills list into 8 to 14 concrete skills or tools, written the way a job posting writes them. Remove duplicates and vague traits like "hard working". Return them as a single comma separated line.
${BASE_RULES}`;
    case "experience":
      return `${region} ${target}
Rewrite these rough notes into 3 to 5 resume bullet points for the role "${data.role || "this role"}"${data.company ? ` at ${data.company}` : ""}. Each bullet starts with a strong past-tense verb (present tense if the role is current) and leads with the outcome, not the responsibility. One bullet per line, no bullet characters, no numbering.
${BASE_RULES}`;
    case "project":
      return `${region} ${target}
Rewrite these project notes into 2 to 4 resume bullet points covering what was built, the tools used and the result. One bullet per line, no bullet characters, no numbering.
${BASE_RULES}`;
    case "certifications":
      return `${region}
Clean up this list of certifications into their correct, formal names with the issuing body and year where the user gave one. One per line, no bullet characters.
${BASE_RULES}`;
  }
}

/** Cleans model output back into plain text the form field can hold. */
function tidy(raw: string, kind: AssistInput["kind"]): string {
  const lines = raw
    .replace(/```[a-z]*\n?|```/g, "")
    .split("\n")
    .map((line) => line.replace(/^\s*(?:[-•*]|\d+[.)])\s*/, "").trim())
    .filter(Boolean);

  if (kind === "summary") return lines.join(" ").trim();
  if (kind === "skills") {
    const items = lines
      .join(", ")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    return Array.from(new Set(items)).join(", ");
  }
  return lines.join("\n");
}

/** Rewrites a single builder field so users get help as they type, not only at the end. */
export async function assistField(data: AssistInput): Promise<string> {
  const key = (process.env.LOVABLE_API_KEY || (process.env.GEMINI_API_KEY ? "gemini-direct" : undefined));
  if (!key) throw new Error("AI is not available right now. Please try again later.");
  const gateway = createLovableAiGatewayProvider(key);

  try {
    const { text } = await (await import("./model-router.server")).runWithModelChain("free", (modelId) => generateText({
      model: createLovableAiGatewayProvider(key, modelId)(modelId),
      system: instruction(data),
      prompt: data.text,
      maxOutputTokens: 1200,
    }));
    const cleaned = tidy(text ?? "", data.kind);
    if (!cleaned) throw new Error("The rewrite came back empty. Please try again.");
    return cleaned;
  } catch (error) {
    const { aiGatewayErrorMessage } = await import("./ai-errors.server");
    throw new Error(aiGatewayErrorMessage(error));
  }
}

