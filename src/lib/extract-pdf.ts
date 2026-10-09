export function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

/** Hard ceiling on an uploaded resume. Real resumes are well under 1 MB. */
export const MAX_RESUME_FILE_BYTES = 8 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [".pdf", ".txt", ".md"] as const;
const ALLOWED_MIME = ["application/pdf", "text/plain", "text/markdown", ""] as const;

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
    throw new Error("Please upload a PDF, TXT or MD file.");
  }
  if (!ALLOWED_MIME.includes(file.type as (typeof ALLOWED_MIME)[number])) {
    throw new Error("Please upload a PDF, TXT or MD file.");
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

  // Text uploads must actually be text — reject anything with a binary
  // signature or NUL bytes hiding behind a .txt/.md name.
  if (isPdfSignature || head.includes(0x00)) {
    throw new Error("That file isn't plain text. Please upload a PDF or a text resume.");
  }
}


function installLegacyRuntimePolyfills() {
  if (typeof (Promise as any).withResolvers !== "function") {
    Object.defineProperty(Promise, "withResolvers", {
      configurable: true, writable: true,
      value(this: PromiseConstructor) {
        let resolve!: (value: unknown) => void;
        let reject!: (reason?: unknown) => void;
        const promise = new this((yes, no) => { resolve = yes; reject = no; });
        return { promise, resolve, reject };
      },
    });
  }

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
  // Use the legacy 6.x build and worker. Both include compatibility support;
  // withResolvers also needs a fallback in the page realm before loading.
  installLegacyRuntimePolyfills();
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const workerUrl = (await import("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url")).default;
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
      "This doesn't look like a resume. Please upload your CV/resume file (PDF, TXT or MD).",
    );
  }
}

