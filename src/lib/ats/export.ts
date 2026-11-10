/** Export helpers. Layout is pure (testable); drawing/downloading needs the browser. */

export function downloadTxt(text: string, filename = "curriculo-ats.txt") {
  const blob = new Blob(["\ufeff" + text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const isHeading = (line: string) =>
  line.length <= 40 && /[A-ZÀ-Ý]{4,}/.test(line) && line === line.toUpperCase() && !/[@\d]/.test(line);

/** 1 cm in PDF points. */
export const CM = 72 / 2.54;
/** Margins on every side: 2 cm. */
export const PDF_MARGIN = 2 * CM;
/** Line spacing applied to every text line. */
export const LINE_SPACING = 1.15;
export const A4 = { width: 595.28, height: 841.89 };
export const FONT_SIZES = { name: 16, heading: 11.5, body: 10.5 };
const BULLET_INDENT = 12;

export type PdfLine = {
  page: number;
  x: number;
  /** Baseline position. */
  y: number;
  text: string;
  size: number;
  bold: boolean;
};

export type Wrap = (text: string, maxWidth: number, size: number, bold: boolean) => string[];

/** Places every résumé line on A4 pages with 2 cm margins and 1.15 line spacing. */
export function layoutResume(text: string, wrap: Wrap, page = A4): PdfLine[] {
  const width = page.width - PDF_MARGIN * 2;
  const bottom = page.height - PDF_MARGIN;
  const out: PdfLine[] = [];
  let pageNo = 1;
  let y = PDF_MARGIN; // top of the next line box

  const place = (t: string, x: number, size: number, bold: boolean) => {
    const lh = size * LINE_SPACING;
    if (y + lh > bottom) {
      pageNo += 1;
      y = PDF_MARGIN;
    }
    out.push({ page: pageNo, x, y: y + size, text: t, size, bold });
    y += lh;
  };

  text.split("\n").forEach((raw, i) => {
    const line = raw.trim();
    if (!line) {
      y += FONT_SIZES.body * 0.5;
      return;
    }

    if (i === 0) {
      wrap(line, width, FONT_SIZES.name, true).forEach((w) => place(w, PDF_MARGIN, FONT_SIZES.name, true));
      y += 4;
      return;
    }

    if (isHeading(line)) {
      y += 8;
      // keep a heading together with at least one body line
      if (y + FONT_SIZES.heading * LINE_SPACING + FONT_SIZES.body * LINE_SPACING > bottom) {
        pageNo += 1;
        y = PDF_MARGIN;
      }
      place(line, PDF_MARGIN, FONT_SIZES.heading, true);
      y += 3;
      return;
    }

    const bullet = line.startsWith("- ");
    const indent = bullet ? BULLET_INDENT : 0;
    wrap(bullet ? line.slice(2) : line, width - indent, FONT_SIZES.body, false).forEach((w, j) => {
      if (bullet && j === 0) {
        const before = out.length;
        place(w, PDF_MARGIN + indent, FONT_SIZES.body, false);
        const placed = out[before];
        out.splice(before, 0, { ...placed, x: PDF_MARGIN, text: "-" });
        return;
      }
      place(w, PDF_MARGIN + indent, FONT_SIZES.body, false);
    });
  });

  return out;
}

/** Single-column, real-text PDF (Helvetica, black) that ATS parsers can read. */
export async function downloadPdf(text: string, filename = "curriculo-ats.pdf") {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.setTextColor(0, 0, 0);

  const wrap: Wrap = (t, maxWidth, size, bold) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    return doc.splitTextToSize(t, maxWidth);
  };

  const lines = layoutResume(text, wrap, {
    width: doc.internal.pageSize.getWidth(),
    height: doc.internal.pageSize.getHeight(),
  });

  let current = 1;
  for (const l of lines) {
    while (l.page > current) {
      doc.addPage();
      current += 1;
    }
    doc.setFont("helvetica", l.bold ? "bold" : "normal");
    doc.setFontSize(l.size);
    doc.setTextColor(0, 0, 0);
    doc.text(l.text, l.x, l.y);
  }

  doc.setProperties({ title: text.split("\n")[0]?.trim() || "Currículo" });
  doc.save(filename);
}

/** Opens the browser's print dialog; print CSS shows only the résumé text. */
export function printResume() {
  window.print();
}
