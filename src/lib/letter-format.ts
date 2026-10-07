/**
 * Makes sure a cover letter reads as paragraphs, not one wall of text.
 * Only changes line breaks. Words are never added, removed or reordered.
 */
const ABBREV = /\b(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|Inc|Ltd|Co|Corp|vs|etc|e\.g|i\.e|No|approx)\.$/i;

function splitSentences(text: string): string[] {
  const parts = text.split(/(?<=[.!?])\s+(?=["'(]?[A-Z0-9])/);
  const out: string[] = [];
  for (const p of parts) {
    if (out.length && ABBREV.test(out[out.length - 1])) out[out.length - 1] += " " + p;
    else out.push(p);
  }
  return out.map((s) => s.trim()).filter(Boolean);
}

const CLOSING = /^(sincerely|best regards|kind regards|warm regards|regards|best|thanks|thank you|yours sincerely|yours faithfully)[,.]?$/i;
const CLOSING_TAIL = /\s+((?:sincerely|best regards|kind regards|warm regards|yours sincerely|yours faithfully|regards)[,.]?)\s*$/i;

const CLOSING_NAME_TAIL = /\s+((?:sincerely|best regards|kind regards|warm regards|yours sincerely|yours faithfully|regards)[,.]?)\s+([A-Z][\w.'’-]+(?:\s+[A-Z][\w.'’-]+){0,3})\s*$/i;

export function formatLetterParagraphs(letter: string): string {
  const paras = letter
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
  if (!paras.length) return "";

  const head: string[] = [];
  const tail: string[] = [];
  let body = paras.slice();

  // Salutation on its own line.
  if (body.length) {
    const m = /^((?:dear|hello|hi|to)\b[^,\n]{0,70},)\s+(.+)$/is.exec(body[0]);
    if (m) {
      head.push(m[1]);
      body[0] = m[2];
    } else if (/^(?:dear|hello|hi)\b[^,\n]{0,70},$/i.test(body[0])) {
      head.push(body.shift()!);
    }
  }

  // Closing word (and name) on their own lines.
  const last = body.length - 1;
  if (last >= 0) {
    const tn = CLOSING_NAME_TAIL.exec(body[last]);
    if (tn) {
      body[last] = body[last].slice(0, tn.index).trim();
      tail.unshift(`${tn[1]} ${tn[2]}`);
    }
    const t = tn ? null : CLOSING_TAIL.exec(body[last]);
    if (t) {
      body[last] = body[last].slice(0, t.index).trim();
      tail.unshift(t[1]);
    }
  }
  while (body.length && (CLOSING.test(body[body.length - 1]) || body[body.length - 1].split(/\s+/).length <= 4)) {
    tail.unshift(body.pop()!);
  }
  body = body.filter(Boolean);

  // Split a single big block into paragraphs by sentence.
  if (body.length < 3) {
    const sentences = splitSentences(body.join(" "));
    if (sentences.length >= 4) {
      const groups = sentences.length >= 7 ? 4 : 3;
      const size = Math.ceil(sentences.length / groups);
      body = [];
      for (let i = 0; i < sentences.length; i += size) body.push(sentences.slice(i, i + size).join(" "));
    }
  }

  return [...head, ...body, ...tail].join("\n\n");
}
