/** Browser-only export helpers. */

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

const isHeading = (line: string) =>
  line.length <= 40 && /[A-ZÀ-Ý]{4,}/.test(line) && line === line.toUpperCase() && !/[@\d]/.test(line);

/** Single-column, real-text PDF (Helvetica) that ATS parsers can read. */
export async function downloadPdf(text: string, filename = "curriculo-ats.pdf") {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 54;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  const pageBottom = doc.internal.pageSize.getHeight() - margin;
  let y = margin;

  const ensure = (h: number) => {
    if (y + h > pageBottom) {
      doc.addPage();
      y = margin;
    }
  };

  text.split("\n").forEach((raw, i) => {
    const line = raw.trimEnd();
    if (!line) {
      y += 6;
      return;
    }

    if (i === 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(17);
      ensure(24);
      doc.text(line, margin, y + 17);
      y += 26;
      return;
    }

    if (isHeading(line)) {
      y += 8;
      ensure(28);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11.5);
      doc.text(line, margin, y + 11.5);
      y += 16;
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.6);
      doc.line(margin, y, margin + width, y);
      y += 8;
      return;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    const lh = 14.5;
    const bullet = line.startsWith("- ");
    const indent = bullet ? 12 : 0;
    const wrapped: string[] = doc.splitTextToSize(bullet ? line.slice(2) : line, width - indent);
    wrapped.forEach((w, j) => {
      ensure(lh);
      if (bullet && j === 0) doc.text("-", margin, y + 10.5);
      doc.text(w, margin + indent, y + 10.5);
      y += lh;
    });
  });

  doc.save(filename);
}
