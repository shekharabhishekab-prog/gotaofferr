export function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

/** Hard ceiling on an uploaded resume. Real resumes are well under 1 MB. */
export const MAX_RESUME_FILE_BYTES = 8 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".doc"] as const;
const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const ALLOWED_MIME = ["application/pdf", DOCX_MIME, "application/msword", ""] as const;
const BAD_TYPE_MSG = "Please upload a PDF or Word (DOCX) file.";
const OLD_DOC_MSG = "Old .doc files can't be read safely. Please save your resume as PDF or DOCX and upload again.";
/** A DOCX is a zip. Stop reading if it would unpack to more than this (zip-bomb guard). */
const MAX_DOCX_XML_BYTES = 20 * 1024 * 1024;

export function isDocxFile(file: File): boolean {
  return file.type === DOCX_MIME || /\.docx?$/i.test(file.name);
}

async function firstBytes(file: File, length: number): Promise<Uint8Array> {
  const slice = file.slice(0, length);
  const buffer =
    typeof slice.arrayBuffer === "function"
      ? await slice.arrayBuffer()
      : await new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () =>
            reader.result instanceof ArrayBuffer
              ? resolve(reader.result)
              : reject(new Error("Could not read that file."));
          reader.onerror = () => reject(reader.error ?? new Error("Could not read that file."));
          reader.readAsArrayBuffer(slice);
        });
  return new Uint8Array(buffer);
}

/**
 * Validates an uploaded resume by extension, declared MIME type, size and
 * actual file content (magic bytes) — never by extension alone. Throws a
 * short, user-safe message when the file is not acceptable.
 */
export async function assertValidResumeFile(file: File): Promise<void> {
  const name = file.name.toLowerCase();
  if (!ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext))) {
    throw new Error(BAD_TYPE_MSG);
  }
  if (!ALLOWED_MIME.includes(file.type as (typeof ALLOWED_MIME)[number])) {
    throw new Error(BAD_TYPE_MSG);
  }
  if (file.size === 0) throw new Error("That file is empty.");
  if (file.size > MAX_RESUME_FILE_BYTES) {
    throw new Error("That file is too large — please upload a resume under 8 MB.");
  }

  const head = await firstBytes(file, 8);
  const isPdfSignature = head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46; // %PDF

  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    if (!isPdfSignature) throw new Error("That file isn't a real PDF. Please upload a valid PDF.");
    return;
  }

  // Word files: a real DOCX is a zip (starts with PK). The old binary .doc
  // format (starts with D0 CF 11 E0) is refused with a clear message.
  const isZip = head[0] === 0x50 && head[1] === 0x4b && head[2] === 0x03 && head[3] === 0x04;
  const isOle = head[0] === 0xd0 && head[1] === 0xcf && head[2] === 0x11 && head[3] === 0xe0;
  if (isOle) throw new Error(OLD_DOC_MSG);
  if (!isZip) throw new Error("That file isn't a real Word document. Please upload a valid DOCX or a PDF.");
}

function u16(b: Uint8Array, o: number) {
  return b[o] | (b[o + 1] << 8);
}
function u32(b: Uint8Array, o: number) {
  return (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;
}

async function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream !== "function") {
    throw new Error("This browser can't read Word files. Please upload a PDF instead.");
  }
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > MAX_DOCX_XML_BYTES) {
      await reader.cancel();
      throw new Error("That Word file is too large to read safely. Please upload a PDF instead.");
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let p = 0;
  for (const c of chunks) {
    out.set(c, p);
    p += c.length;
  }
  return out;
}

const XML_ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

export function docxXmlToText(xml: string): string {
  return xml
    .replace(/<w:tab\b[^>]*\/>/g, "\t")
    .replace(/<w:(br|cr)\b[^>]*\/>/g, "\n")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (m, e: string) => {
      if (e[0] === "#") {
        const code = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : "";
      }
      return XML_ENTITIES[e.toLowerCase()] ?? m;
    })
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Reads text from a DOCX with no extra library: finds word/document.xml in the zip and unpacks only that. */
export async function extractDocxText(file: File): Promise<string> {
  const bytes = new Uint8Array(await readFileAsArrayBuffer(file));
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 22 - 65535); i--) {
    if (u32(bytes, i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("That file isn't a valid Word document.");
  const count = u16(bytes, eocd + 10);
  let p = u32(bytes, eocd + 16);
  for (let n = 0; n < count && p + 46 <= bytes.length; n++) {
    if (u32(bytes, p) !== 0x02014b50) break;
    const method = u16(bytes, p + 10);
    const csize = u32(bytes, p + 20);
    const nameLen = u16(bytes, p + 28);
    const extraLen = u16(bytes, p + 30);
    const commentLen = u16(bytes, p + 32);
    const lho = u32(bytes, p + 42);
    const name = new TextDecoder().decode(bytes.slice(p + 46, p + 46 + nameLen));
    if (name === "word/document.xml") {
      if (u32(bytes, lho) !== 0x04034b50) break;
      const start = lho + 30 + u16(bytes, lho + 26) + u16(bytes, lho + 28);
      const raw = bytes.slice(start, start + csize);
      let xml: Uint8Array;
      if (method === 0) xml = raw;
      else if (method === 8) xml = await inflateRaw(raw);
      else throw new Error("That Word file can't be read. Please upload a PDF instead.");
      return docxXmlToText(new TextDecoder().decode(xml));
    }
    p += 46 + nameLen + extraLen + commentLen;
  }
  throw new Error("That file isn't a valid Word document.");
}


function installLegacyRuntimePolyfills() {
  if (typeof String.prototype.replaceAll !== "function") {
    Object.defineProperty(String.prototype, "replaceAll", {
      configurable: true,
      writable: true,
      value(search: string | RegExp, replacement: string | ((...args: unknown[]) => string)) {
        if (search instanceof RegExp) {
          if (!search.global) throw new TypeError("replaceAll requires a global regular expression");
          return this.replace(search, replacement as string);
        }
        return this.split(search).join(replacement as string);
      },
    });
  }

  if (typeof Array.prototype.at !== "function") {
    Object.defineProperty(Array.prototype, "at", {
      configurable: true,
      writable: true,
      value(index: number) {
        const normalized = Math.trunc(index) || 0;
        return this[normalized < 0 ? this.length + normalized : normalized];
      },
    });
  }

  if (typeof Promise.allSettled !== "function") {
    Promise.allSettled = ((values: Iterable<unknown>) =>
      Promise.all(
        Array.from(values, (value) =>
          Promise.resolve(value).then(
            (result) => ({ status: "fulfilled" as const, value: result }),
            (reason) => ({ status: "rejected" as const, reason }),
          ),
        ),
      )) as typeof Promise.allSettled;
  }
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  if (typeof file.arrayBuffer === "function") return file.arrayBuffer();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) resolve(reader.result);
      else reject(new Error("This phone could not read the selected file."));
    };
    reader.onerror = () => reject(reader.error ?? new Error("This phone could not read the selected file."));
    reader.readAsArrayBuffer(file);
  });
}

async function loadPdfjs() {
  // PDF.js 3.x's legacy build supports older iOS Safari directly. Newer PDF.js
  // builds require Promise.withResolvers in both the page and worker realms,
  // so patching only window.Promise still fails on real older iPhones.
  installLegacyRuntimePolyfills();
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.js");
  const workerUrl = (await import("pdfjs-dist/legacy/build/pdf.worker.min.js?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  return pdfjs;
}

export async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await loadPdfjs();

  const buffer = await readFileAsArrayBuffer(file);
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer), isEvalSupported: false });
  const doc = await loadingTask.promise;

  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const items = Array.from(content.items as Array<{ str?: string; transform?: number[] }>);
    let lastY: number | null = null;
    for (const item of items) {
      if (typeof item?.str !== "string") continue;
      const y = item.transform?.[5];
      if (lastY !== null && typeof y === "number" && Math.abs(y - lastY) > 2) text += "\n";
      text += item.str + " ";
      if (typeof y === "number") lastY = y;
    }
    text += "\n\n";
  }
  await loadingTask.destroy();
  return text.replace(/[ \t]+/g, " ").trim();
}

/**
 * Cheap heuristic that tells a resume apart from any other PDF (invoice,
 * report, ticket). We look for the signals almost every resume has: section
 * headings, contact details, dates and career vocabulary. Deliberately
 * permissive — it only rejects documents with almost no resume signal at all.
 */
export function resumeSignalScore(text: string): number {
  const value = text.toLowerCase();
  let score = 0;

  const sections = [
    "experience", "work history", "employment", "education", "skills",
    "projects", "summary", "objective", "certification", "achievements",
    "profile", "internship", "languages", "references", "curriculum vitae", "resume",
  ];
  score += Math.min(4, sections.filter((word) => value.includes(word)).length);

  if (/[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(text)) score += 1; // email
  if (/(\+?\d[\d\s().-]{7,}\d)/.test(text)) score += 1; // phone
  if (/linkedin\.com|github\.com/i.test(text)) score += 1;
  if (/(19|20)\d{2}\s*[–—\-to]{1,3}\s*((19|20)\d{2}|present|current)/i.test(text)) score += 1; // date range
  if (/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(19|20)\d{2}\b/i.test(value)) score += 1;
  if (/\b(manager|engineer|developer|designer|analyst|intern|executive|consultant|specialist|assistant|officer|lead|director)\b/i.test(value)) score += 1;

  // Signals this is clearly something else.
  if (/\b(invoice|tax invoice|purchase order|boarding pass|policy number|gst ?in|amount due|subtotal|bank statement|receipt no)\b/i.test(value)) {
    score -= 4;
  }

  return score;
}

/** Throws a friendly error when the uploaded text does not look like a resume. */
export function assertLooksLikeResume(text: string): void {
  if (resumeSignalScore(text) < 3) {
    throw new Error(
      "This doesn't look like a resume. Please upload your CV/resume file (PDF or DOCX).",
    );
  }
}


