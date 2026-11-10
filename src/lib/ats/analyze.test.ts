import { describe, expect, it } from "vitest";

import { analyzeResume, computeScore, getLevel, normalize } from "./analyze";
import { SAMPLE_JOB, SAMPLE_RESUME } from "./samples";

const JOB = "Buscamos pessoa com React, TypeScript, Docker e Scrum.";
const RESUME = `Ana Lima
ana@email.com

Experiência
- Responsável pelo front-end em React
- Participei de rituais de Scrum`;

describe("ATS analysis rules", () => {
  it("scores as found terms divided by relevant job terms, times 100", () => {
    const result = analyzeResume(JOB, RESUME);
    expect(result.total).toBe(4);
    expect(result.found.map((f) => f.term).sort()).toEqual(["React", "Scrum"]);
    expect(result.score).toBe(50);
    expect(computeScore(3, 8)).toBe(38);
    expect(computeScore(0, 0)).toBe(0);
  });

  it("classifies the score into the three compatibility levels", () => {
    expect(getLevel(39).label).toBe("Baixa compatibilidade");
    expect(getLevel(40).label).toBe("Boa aderência");
    expect(getLevel(69).label).toBe("Boa aderência");
    expect(getLevel(70).label).toBe("Excelente aderência");
  });

  it("never adds missing keywords to the generated resume", () => {
    const result = analyzeResume(JOB, RESUME);
    const output = normalize(result.optimizedResume);
    expect(result.missing.map((m) => m.term)).toEqual(["TypeScript", "Docker"]);
    expect(output).not.toContain("typescript");
    expect(output).not.toContain("docker");
  });

  it("never adds missing keywords for the bundled sample either", () => {
    const result = analyzeResume(SAMPLE_JOB, SAMPLE_RESUME);
    const output = normalize(result.optimizedResume);
    expect(result.missing.length).toBeGreaterThan(0);
    for (const m of result.missing) {
      expect(output).not.toMatch(new RegExp(`(^|[^a-z0-9])${normalize(m.term).replace(/[.+#/]/g, "\\$&")}([^a-z0-9]|$)`));
    }
  });

  it("counts a synonym as a match and records the resume wording", () => {
    const result = analyzeResume("Requisito: JavaScript", "Habilidades\nJS, HTML");
    expect(result.found).toEqual([{ term: "JavaScript", category: "tecnica", resumeAlias: "js" }]);
    expect(result.optimizedResume).toContain("JavaScript");
  });

  it("rewrites weak openings into action verbs without changing the facts", () => {
    const result = analyzeResume(JOB, RESUME);
    expect(result.optimizedResume).toContain("- Conduzi o front-end em React");
    expect(result.optimizedResume).toContain("- Colaborei em rituais de Scrum");
  });
});
