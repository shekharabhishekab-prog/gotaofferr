import { assertValidResumeFile, extractPdfText } from "@/lib/extract-pdf";

// Reads the resume file inside the browser. The file is never uploaded.
async function docxText(f: File): Promise<string> {
  const buf = new Uint8Array(await f.arrayBuffer());
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let e = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 70000); i--) if (dv.getUint32(i, true) === 0x06054b50) { e = i; break; }
  if (e < 0) throw new Error("That DOCX looks damaged. Save it again or use a PDF.");
  const count = dv.getUint16(e + 10, true);
  let p = dv.getUint32(e + 16, true);
  for (let k = 0; k < count; k++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const method = dv.getUint16(p + 10, true);
    const csize = dv.getUint32(p + 20, true);
    const nlen = dv.getUint16(p + 28, true), xlen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true);
    const lho = dv.getUint32(p + 42, true);
    const name = new TextDecoder().decode(buf.subarray(p + 46, p + 46 + nlen));
    if (name === "word/document.xml") {
      const start = lho + 30 + dv.getUint16(lho + 26, true) + dv.getUint16(lho + 28, true);
      const data = buf.slice(start, start + csize);
      let xml = "";
      if (method === 0) xml = new TextDecoder().decode(data);
      else if (method === 8) {
        const DS = (globalThis as unknown as { DecompressionStream?: new (f: string) => unknown }).DecompressionStream;
        if (!DS) throw new Error("This browser can't open DOCX. Please upload a PDF.");
        const stream = new Blob([data]).stream().pipeThrough(new DS("deflate-raw") as unknown as ReadableWritablePair<Uint8Array, Uint8Array>);
        xml = await new Response(stream).text();
      } else throw new Error("That DOCX can't be read. Please upload a PDF.");
      xml = xml
        .replace(/<w:tab\/>/g, " ")
        .replace(/<w:br\/>/g, "\n")
        .replace(/<\/w:tc>/g, " | ")
        .replace(/<w:p[ >][\s\S]*?<\/w:p>/g, (para) => (/<w:numPr>/.test(para) ? "\u2022 " : "") + para + "\n");
      return xml.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
    }
    p += 46 + nlen + xlen + clen;
  }
  throw new Error("Couldn't find any text in that DOCX.");
}

export async function readResumeFile(f: File): Promise<string> {
  const n = f.name.toLowerCase();
  if (f.size === 0) throw new Error("That file is empty.");
  if (f.size > 8 * 1024 * 1024) throw new Error("That file is too big. Use one under 8 MB.");
  if (n.endsWith(".pdf") || f.type === "application/pdf") { await assertValidResumeFile(f); return extractPdfText(f); }
  if (n.endsWith(".docx")) return docxText(f);
  if (n.endsWith(".txt") || n.endsWith(".md")) return f.text();
  if (n.endsWith(".doc")) throw new Error("Old .doc files can't be read. Save it as PDF or DOCX and try again.");
  throw new Error("Please upload a PDF, DOCX or TXT file.");
}
