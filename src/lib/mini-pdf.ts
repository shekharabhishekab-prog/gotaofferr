/**
 * Tiny text-only PDF writer (no library). A4, built-in fonts, automatic pages.
 * Enough for report text and plain tables. Characters outside Latin-1 become "?".
 */
type Font = "F1" | "F2" | "F3"; // Helvetica, Helvetica-Bold, Courier

const W = 595, H = 842, MARGIN = 48;

function clean(s: string): string {
  return String(s ?? "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[^\x20-\x7e\u00a0-\u00ff]/g, "?")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

export class MiniPdf {
  private pages: string[] = [];
  private cur: string[] = [];
  private y = H - MARGIN;
  constructor(private footer = "") {}

  private newPage() {
    if (this.cur.length) this.pages.push(this.cur.join("\n"));
    this.cur = [];
    this.y = H - MARGIN;
  }
  private put(text: string, font: Font, size: number, lead: number) {
    if (this.y - lead < MARGIN) this.newPage();
    this.y -= lead;
    this.cur.push(`BT /${font} ${size} Tf ${MARGIN} ${this.y.toFixed(1)} Td (${clean(text)}) Tj ET`);
  }
  title(t: string) { this.put(t, "F2", 20, 28); this.gap(4); }
  h(t: string) { this.gap(8); this.put(t, "F2", 13, 18); }
  gap(n = 6) { this.y -= n; }
  p(t: string, size = 10) {
    const max = Math.floor(495 / (size * 0.5));
    for (const para of String(t).split("\n")) {
      let line = "";
      for (const word of para.split(/\s+/)) {
        if ((line + " " + word).trim().length > max) { this.put(line, "F1", size, size + 4); line = word; }
        else line = (line + " " + word).trim();
      }
      this.put(line, "F1", size, size + 4);
    }
  }
  /** Plain monospace table. widths are in characters; longer cells are cut with "..". */
  table(headers: string[], rows: (string | number | null | undefined)[][], widths: number[]) {
    const fmt = (cells: (string | number | null | undefined)[]) =>
      cells.map((c, i) => {
        const s = String(c ?? "-");
        const w = widths[i];
        return (s.length > w ? s.slice(0, w - 2) + ".." : s).padEnd(w);
      }).join(" ");
    this.put(fmt(headers), "F3", 8, 12);
    this.put("-".repeat(widths.reduce((a, b) => a + b, 0) + widths.length - 1), "F3", 8, 9);
    for (const r of rows) this.put(fmt(r), "F3", 8, 11);
  }

  build(): Uint8Array {
    if (this.cur.length || !this.pages.length) this.pages.push(this.cur.join("\n"));
    const total = this.pages.length;
    const objs: string[] = [];
    // 1 catalog, 2 pages, 3-5 fonts, then page/content pairs
    const kids: string[] = [];
    this.pages.forEach((_, i) => kids.push(`${6 + i * 2} 0 R`));
    objs.push("<< /Type /Catalog /Pages 2 0 R >>");
    objs.push(`<< /Type /Pages /Kids [${kids.join(" ")}] /Count ${total} >>`);
    objs.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
    objs.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
    objs.push("<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>");
    this.pages.forEach((content, i) => {
      const foot = `BT /F1 8 Tf ${MARGIN} 28 Td (${clean(this.footer)}  Page ${i + 1} of ${total}) Tj ET`;
      const stream = content + "\n" + foot;
      objs.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${7 + i * 2} 0 R >>`);
      objs.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    });
    let out = "%PDF-1.4\n";
    const offsets: number[] = [];
    objs.forEach((o, i) => { offsets.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
    const xref = out.length;
    out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offsets.map((o) => String(o).padStart(10, "0") + " 00000 n \n").join("");
    out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    const bytes = new Uint8Array(out.length);
    for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 0xff;
    return bytes;
  }
}
