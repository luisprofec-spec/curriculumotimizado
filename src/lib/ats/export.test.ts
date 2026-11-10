import { describe, expect, it } from "vitest";

import { A4, CM, FONT_SIZES, layoutResume, type Wrap } from "./export";

// Rough wrapper: ~0.5em per character.
const wrap: Wrap = (text, maxWidth, size) => {
  const perLine = Math.max(1, Math.floor(maxWidth / (size * 0.5)));
  const words = text.split(" ");
  const out: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > perLine && cur) {
      out.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) out.push(cur);
  return out;
};

const RESUME = [
  "Ana Lima",
  "ana@email.com",
  "",
  "EXPERIÊNCIA",
  ...Array.from({ length: 80 }, (_, i) => `- Item de experiência número ${i} com algum texto descritivo extra`),
].join("\n");

describe("PDF export layout", () => {
  const lines = layoutResume(RESUME, wrap);

  it("keeps 2 cm margins on every side", () => {
    const margin = 2 * CM;
    for (const l of lines) {
      expect(l.x).toBeGreaterThanOrEqual(margin - 0.01);
      expect(l.y - l.size).toBeGreaterThanOrEqual(margin - 0.01);
      expect(l.y).toBeLessThanOrEqual(A4.height - margin + 0.01);
    }
    expect(Math.round(margin * 100) / 100).toBe(56.69);
  });

  it("uses 1.15 line spacing between consecutive body lines", () => {
    const body = lines.filter((l) => l.size === FONT_SIZES.body && l.text !== "-" && l.page === 1);
    const [, first, second] = body;
    expect(first && second).toBeTruthy();
    const gap = second!.y - first!.y;
    expect(gap).toBeCloseTo(FONT_SIZES.body * 1.15, 5);
  });

  it("flows long résumés onto extra pages", () => {
    expect(Math.max(...lines.map((l) => l.page))).toBeGreaterThan(1);
  });
});
