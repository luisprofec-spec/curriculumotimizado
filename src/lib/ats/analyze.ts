import { ACRONYM_BLACKLIST, KEYWORDS, type Category, type KeywordEntry } from "./keywords";

export type Level = "low" | "good" | "excellent";

export interface KeywordResult {
  term: string;
  category: Category;
  /** Resume wording when it differs from the job's wording (synonym match). */
  resumeAlias?: string | undefined;
}

export interface Analysis {
  score: number;
  level: Level;
  label: string;
  total: number;
  found: KeywordResult[];
  missing: KeywordResult[];
  strengths: string[];
  bottlenecks: string[];
  optimizedResume: string;
  changes: string[];
  stats: {
    wordCount: number;
    metrics: number;
    weakVerbs: number;
    sections: string[];
  };
}

/* ------------------------------------------------------------------ */
/* Text helpers                                                        */
/* ------------------------------------------------------------------ */

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_]+/g, " ")
    .replace(/[ \t]+/g, " ");
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const reCache = new Map<string, RegExp>();
function aliasRe(alias: string) {
  let re = reCache.get(alias);
  if (!re) {
    re = new RegExp(`(^|[^a-z0-9])${escapeRe(alias)}(?=$|[^a-z0-9])`);
    reCache.set(alias, re);
  }
  return re;
}

function findAlias(normText: string, aliases: string[]): { alias: string; index: number } | null {
  let best: { alias: string; index: number } | null = null;
  for (const alias of aliases) {
    const m = aliasRe(alias).exec(normText);
    if (m && (best === null || m.index < best.index)) best = { alias, index: m.index };
  }
  return best;
}

const compact = (s: string) => s.replace(/[\s.]/g, "");

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/* ------------------------------------------------------------------ */
/* Score                                                               */
/* ------------------------------------------------------------------ */

export function computeScore(found: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((found / total) * 100);
}

export function getLevel(score: number): { level: Level; label: string } {
  if (score >= 70) return { level: "excellent", label: "Excelente aderência" };
  if (score >= 40) return { level: "good", label: "Boa aderência" };
  return { level: "low", label: "Baixa compatibilidade" };
}

/* ------------------------------------------------------------------ */
/* Keyword extraction                                                  */
/* ------------------------------------------------------------------ */

interface JobTerm {
  entry: KeywordEntry;
  index: number;
}

export function extractJobTerms(job: string): KeywordEntry[] {
  const normJob = normalize(job);
  const terms: JobTerm[] = [];

  for (const entry of KEYWORDS) {
    const hit = findAlias(normJob, entry.aliases);
    if (hit) terms.push({ entry, index: hit.index });
  }

  // Technical-looking tokens outside the dictionary: acronyms, camelCase, Vue.js / C++ style.
  const known = new Set(terms.flatMap((t) => t.entry.aliases.flatMap((a) => [a, ...a.split(/[\s/]/)])));
  const allAliases = new Set(KEYWORDS.flatMap((k) => k.aliases));
  const seen = new Set<string>();
  const tokenRe = /[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9.+#]*[A-Za-zÀ-ÿ0-9+#]/g;
  for (const m of job.matchAll(tokenRe)) {
    const token = m[0].replace(/\.+$/, "");
    const n = normalize(token);
    if (seen.has(n) || known.has(n) || allAliases.has(n) || ACRONYM_BLACKLIST.has(n)) continue;
    const isAcronym = /^[A-Z]{2,6}\d?$/.test(token);
    const isCamel = /^[A-Z]?[a-z]+[A-Z][A-Za-z]*$/.test(token);
    const isTechy = /[a-z][.+#]|[+#]$/i.test(token) && !/^\w+\.\w+\.\w+/.test(token);
    if (!isAcronym && !isCamel && !isTechy) continue;
    seen.add(n);
    terms.push({
      entry: { label: token, category: "tecnica", aliases: [n] },
      index: normalize(job.slice(0, m.index ?? 0)).length,
    });
  }

  return terms.sort((a, b) => a.index - b.index).map((t) => t.entry);
}

/* ------------------------------------------------------------------ */
/* Resume parsing                                                      */
/* ------------------------------------------------------------------ */

export type SectionKey =
  | "resumo"
  | "experiencia"
  | "projetos"
  | "habilidades"
  | "formacao"
  | "cursos"
  | "idiomas"
  | "outros";

export const SECTION_TITLES: Record<Exclude<SectionKey, "outros">, string> = {
  resumo: "RESUMO PROFISSIONAL",
  experiencia: "EXPERIÊNCIA PROFISSIONAL",
  projetos: "PROJETOS",
  habilidades: "HABILIDADES",
  formacao: "FORMAÇÃO ACADÊMICA",
  cursos: "CURSOS E CERTIFICAÇÕES",
  idiomas: "IDIOMAS",
};

const SECTION_ORDER: SectionKey[] = [
  "resumo",
  "experiencia",
  "projetos",
  "habilidades",
  "formacao",
  "cursos",
  "idiomas",
  "outros",
];

const HEADINGS: Record<Exclude<SectionKey, "outros">, string[]> = {
  resumo: [
    "resumo", "resumo profissional", "perfil", "perfil profissional", "sobre", "sobre mim",
    "objetivo", "objetivo profissional", "objetivos", "apresentacao", "summary", "profile",
    "sumario", "sumario profissional", "quem sou",
  ],
  experiencia: [
    "experiencia", "experiencias", "experiencia profissional", "experiencias profissionais",
    "historico profissional", "experiencia de trabalho", "trajetoria profissional", "carreira",
    "experience", "work experience",
  ],
  habilidades: [
    "habilidades", "competencias", "skills", "conhecimentos", "habilidades tecnicas",
    "competencias tecnicas", "conhecimentos tecnicos", "ferramentas", "tecnologias",
    "hard skills", "soft skills", "habilidades e competencias", "competencias e habilidades",
    "stack", "principais competencias",
  ],
  formacao: [
    "formacao", "formacao academica", "educacao", "escolaridade", "education", "graduacao",
    "formacao educacional",
  ],
  cursos: [
    "cursos", "certificacoes", "certificados", "cursos e certificacoes", "cursos complementares",
    "certificacoes e cursos", "formacao complementar", "qualificacoes", "certifications",
  ],
  idiomas: ["idiomas", "linguas", "languages", "idioma"],
  projetos: ["projetos", "projetos relevantes", "portfolio", "projetos pessoais", "projects"],
};

interface Section {
  key: SectionKey;
  title: string;
  lines: string[];
}

const DECOR_RE = /[\p{Extended_Pictographic}★☆✓✔✗✘➤►▶◀●○◆◇■□▪▫✦✧❖→⇒☛│┃┆─━┌┐└┘├┤]/gu;
const BULLET_RE = /^\s*(?:[-*•·–—▪●◦►➤>]|\d{1,2}[.)])\s+/;

function detectHeading(line: string, afterFirst: boolean): { key: SectionKey; title: string } | null {
  const cleaned = line
    .replace(DECOR_RE, "")
    .replace(/^[^A-Za-zÀ-ÿ]+/, "")
    .replace(/[:\-–—\s]+$/, "")
    .trim();
  if (!cleaned || cleaned.length > 40) return null;
  const n = normalize(cleaned).replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
  for (const [key, list] of Object.entries(HEADINGS)) {
    if (list.includes(n)) return { key: key as SectionKey, title: SECTION_TITLES[key as Exclude<SectionKey, "outros">] };
  }
  const words = cleaned.split(/\s+/);
  if (
    afterFirst &&
    words.length <= 4 &&
    /[A-ZÀ-Ý]{3,}/.test(cleaned) &&
    cleaned === cleaned.toUpperCase() &&
    !BULLET_RE.test(line) &&
    !/\d/.test(cleaned)
  ) {
    return { key: "outros", title: cleaned.toUpperCase() };
  }
  return null;
}

function parseResume(text: string): { header: string[]; sections: Section[]; decorRemoved: boolean } {
  const rawLines = text.replace(/\r/g, "").split("\n");
  const decorRemoved = DECOR_RE.test(text) || /\t/.test(text);
  DECOR_RE.lastIndex = 0;

  const header: string[] = [];
  const sections: Section[] = [];
  let current: Section | null = null;

  for (const raw of rawLines) {
    const heading = detectHeading(raw, sections.length > 0);
    if (heading) {
      const existing = sections.find((s) => s.key === heading.key && s.title === heading.title);
      current = existing ?? { ...heading, lines: [] };
      if (!existing) sections.push(current);
      continue;
    }
    if (current) current.lines.push(raw);
    else header.push(raw);
  }

  // No headings at all: first paragraph is the header, the rest becomes experience or summary.
  if (sections.length === 0) {
    const blank = header.findIndex((l, i) => i > 0 && !l.trim());
    const head = blank === -1 ? header.slice(0, 3) : header.slice(0, blank);
    const rest = header.slice(head.length);
    const hasDates = rest.some((l) => /\b(19|20)\d{2}\b/.test(l));
    sections.push({
      key: hasDates ? "experiencia" : "resumo",
      title: hasDates ? SECTION_TITLES.experiencia : SECTION_TITLES.resumo,
      lines: rest,
    });
    return { header: head, sections, decorRemoved };
  }

  return { header, sections, decorRemoved };
}

/* ------------------------------------------------------------------ */
/* Action verbs (only rewrites wording, never adds facts)              */
/* ------------------------------------------------------------------ */

const ART_POR: Record<string, string> = { por: "", pela: "a ", pelo: "o ", pelas: "as ", pelos: "os " };
const ART_DE: Record<string, string> = { de: "", do: "o ", da: "a ", dos: "os ", das: "as " };
const EM_FROM_DE: Record<string, string> = { de: "em ", do: "no ", da: "na ", dos: "nos ", das: "nas " };
const NOUN_TO_VERB: Record<string, string> = {
  desenvolvimento: "Desenvolvi",
  criacao: "Criei",
  implementacao: "Implementei",
  elaboracao: "Elaborei",
  analise: "Analisei",
  gestao: "Gerenciei",
  manutencao: "Mantive",
  conducao: "Conduzi",
  coordenacao: "Coordenei",
  planejamento: "Planejei",
  otimizacao: "Otimizei",
  automacao: "Automatizei",
  organizacao: "Organizei",
};
const IMPERFECT: Record<string, string> = {
  fazia: "Realizei", realizava: "Realizei", auxiliava: "Apoiei", auxiliei: "Apoiei",
  acompanhava: "Acompanhei", criava: "Criei", elaborava: "Elaborei", gerenciava: "Gerenciei",
  liderava: "Liderei", implementava: "Implementei", analisava: "Analisei",
  desenvolvia: "Desenvolvi", mantinha: "Mantive", apoiava: "Apoiei", organizava: "Organizei",
  coordenava: "Coordenei", atendia: "Atendi", atuava: "Atuei", executava: "Executei",
  planejava: "Planejei", monitorava: "Monitorei", controlava: "Controlei", conduzia: "Conduzi",
  otimizava: "Otimizei", automatizava: "Automatizei", testava: "Testei",
  documentava: "Documentei", treinava: "Treinei", negociava: "Negociei",
  prospectava: "Prospectei", vendia: "Vendi",
};

type Rule = [RegExp, (m: RegExpMatchArray) => string];
const low = (s?: string) => (s ?? "").toLowerCase();

const RULES: Rule[] = [
  [/^(?:fui |era )?respons[aá]vel (por|pela|pelo|pelas|pelos)\s+/i, (m) => "Conduzi " + ART_POR[low(m[1])]],
  [/^trabalh(?:ei|ava) (com|em|no|na|nos|nas)\s+/i, (m) => `Atuei ${low(m[1])} `],
  [
    /^ajud(?:ei|ava) (a|na|no|nas|nos|em|com)\s+/i,
    (m) => (low(m[1]) === "a" ? "Contribuí para " : `Contribuí ${low(m[1])} `),
  ],
  [/^particip(?:ei|ava) (de|do|da|dos|das)\s+/i, (m) => "Colaborei " + EM_FROM_DE[low(m[1])]],
  [/^cuid(?:ei|ava) (de|do|da|dos|das)\s+/i, (m) => "Conduzi " + ART_DE[low(m[1])]],
  [/^mexia com\s+/i, () => "Operei "],
  [
    /^(desenvolvimento|cria[cç][aã]o|implementa[cç][aã]o|elabora[cç][aã]o|an[aá]lise|gest[aã]o|manuten[cç][aã]o|condu[cç][aã]o|coordena[cç][aã]o|planejamento|otimiza[cç][aã]o|automa[cç][aã]o|organiza[cç][aã]o) (de|do|da|dos|das)\s+/i,
    (m) => `${NOUN_TO_VERB[normalize(m[1] ?? "")]} ${ART_DE[low(m[2])]}`,
  ],
  [/^fiz\s+/i, () => "Executei "],
  [new RegExp(`^(${Object.keys(IMPERFECT).join("|")})\\s+`, "i"), (m) => IMPERFECT[low(m[1])] + " "],
];

export function strengthen(sentence: string): { text: string; changed: boolean } {
  const trimmed = sentence.trim();
  for (const [re, to] of RULES) {
    const m = trimmed.match(re);
    if (m) {
      const text = (to(m) + trimmed.slice(m[0].length)).replace(/\s{2,}/g, " ");
      return { text, changed: true };
    }
  }
  return { text: trimmed.charAt(0).toUpperCase() + trimmed.slice(1), changed: false };
}

/* ------------------------------------------------------------------ */
/* Analysis                                                            */
/* ------------------------------------------------------------------ */

const METRIC_RE =
  /\d+([.,]\d+)?\s?%|R\$\s?\d|\b\d+(\.\d{3})*\s?(mil|k|mi|milh[oõ]es|clientes|usu[aá]rios|projetos|pessoas|vendas|leads|horas|dias|meses|lojas|squads?)\b|\b\d+x\b/gi;
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.]+/;
const PHONE_RE = /(\+?\d{2}\s?)?\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}/;

function cleanLine(line: string) {
  return line.replace(DECOR_RE, "").replace(/\t+/g, " - ").replace(/[ ]{2,}/g, " ").trim();
}

function listJoin(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} e ${items[items.length - 1]}`;
}

export function analyzeResume(job: string, resume: string): Analysis {
  const normResume = normalize(resume);
  const jobTerms = extractJobTerms(job);
  const normJob = normalize(job);

  const found: KeywordResult[] = [];
  const missing: KeywordResult[] = [];
  for (const entry of jobTerms) {
    const resumeHit = findAlias(normResume, entry.aliases);
    if (!resumeHit) {
      missing.push({ term: entry.label, category: entry.category });
      continue;
    }
    const jobHit = findAlias(normJob, entry.aliases);
    const differs = jobHit && compact(jobHit.alias) !== compact(resumeHit.alias);
    found.push({
      term: entry.label,
      category: entry.category,
      resumeAlias: differs ? resumeHit.alias : undefined,
    });
  }

  const total = jobTerms.length;
  const score = computeScore(found.length, total);
  const { level, label } = getLevel(score);

  /* ---------- Build ATS resume ---------- */
  const { header, sections, decorRemoved } = parseResume(resume);
  let weakVerbs = 0;
  const out: string[] = [];

  const headerLines = header
    .map((l) => l.replace(DECOR_RE, "").replace(/\t+/g, " | ").replace(/[ ]{2,}/g, " ").trim())
    .filter(Boolean);
  if (headerLines.length) out.push(...headerLines, "");

  const byKey = (k: SectionKey) => sections.filter((s) => s.key === k);
  const foundTechnical = found.filter((f) => f.category === "tecnica" || f.category === "metodologia");
  const foundSoft = found.filter((f) => f.category === "comportamental");

  const renderLines = (lines: string[], strengthenAll: boolean) => {
    const result: string[] = [];
    for (const raw of lines) {
      const line = cleanLine(raw);
      if (!line) {
        if (result.length && result[result.length - 1] !== "") result.push("");
        continue;
      }
      const isBullet = BULLET_RE.test(line);
      const content = line.replace(BULLET_RE, "");
      if (isBullet || strengthenAll) {
        const s = strengthen(content);
        if (s.changed) weakVerbs++;
        if (isBullet || s.changed) {
          result.push(`- ${s.text}`);
          continue;
        }
      }
      result.push(content.replace(/\s*\|\s*/g, " | "));
    }
    while (result[result.length - 1] === "") result.pop();
    while (result[0] === "") result.shift();
    return result;
  };

  for (const key of SECTION_ORDER) {
    if (key === "habilidades") {
      const original = byKey("habilidades").flatMap((s) => s.lines);
      const items = original
        .map(cleanLine)
        .flatMap((l) => l.replace(BULLET_RE, "").replace(/^[^:]{1,30}:\s*/, "").split(/\s*[,;•·|]\s*|\s+-\s+/))
        .map((i) => i.replace(/\.$/, "").trim())
        .filter((i) => i.length > 0 && i.length <= 50);

      const tech = foundTechnical.map((f) => f.term);
      const soft = foundSoft.map((f) => f.term);
      const seen = new Set([...tech, ...soft].map((t) => normalize(t)));
      for (const f of found) {
        if (f.resumeAlias) seen.add(f.resumeAlias);
        const entry = KEYWORDS.find((k) => k.label === f.term);
        entry?.aliases.forEach((a) => seen.add(a));
      }
      for (const item of items) {
        const n = normalize(item);
        if (seen.has(n)) continue;
        seen.add(n);
        const entry = KEYWORDS.find((k) => k.aliases.includes(n));
        if (entry?.category === "comportamental") soft.push(entry.label);
        else tech.push(entry?.label ?? item);
      }
      if (tech.length || soft.length) {
        out.push(SECTION_TITLES.habilidades);
        if (tech.length) out.push(`Competências técnicas: ${tech.join(", ")}`);
        if (soft.length) out.push(`Competências comportamentais: ${soft.join(", ")}`);
        out.push("");
      }
      continue;
    }

    if (key === "resumo") {
      const lines = byKey("resumo").flatMap((s) => s.lines).map(cleanLine).filter(Boolean);
      const paragraph = lines.map((l) => l.replace(BULLET_RE, "")).join(" ").trim();
      const highlights = foundTechnical.slice(0, 8).map((f) => f.term);
      if (paragraph || highlights.length) {
        out.push(SECTION_TITLES.resumo);
        if (paragraph) out.push(paragraph);
        if (highlights.length) out.push(`Competências alinhadas à vaga: ${highlights.join(", ")}.`);
        out.push("");
      }
      continue;
    }

    for (const section of byKey(key)) {
      const lines = renderLines(section.lines, key === "experiencia" || key === "projetos");
      if (!lines.length) continue;
      out.push(section.title, ...lines, "");
    }
  }
  while (out[out.length - 1] === "") out.pop();
  const optimizedResume = out.join("\n");

  /* ---------- Diagnostics ---------- */
  const wordCount = countWords(resume);
  const metrics = (resume.match(METRIC_RE) ?? []).length;
  const sectionKeys = Array.from(new Set(sections.map((s) => s.key)));
  const sectionNames = sectionKeys.map((k) =>
    k === "outros" ? "Outros" : SECTION_TITLES[k].charAt(0) + SECTION_TITLES[k].slice(1).toLowerCase(),
  );
  const hasEmail = EMAIL_RE.test(resume);
  const hasPhone = PHONE_RE.test(resume);
  const hasTable = /\t|\|.*\|/.test(resume) || /[│┃┆─━┌┐└┘├┤]/.test(resume);
  const technicalJob = jobTerms.filter((t) => t.category === "tecnica" || t.category === "metodologia");
  const missingTech = missing.filter((m) => m.category === "tecnica" || m.category === "metodologia");
  const missingSoft = missing.filter((m) => m.category === "comportamental");
  const missingSections = (["experiencia", "habilidades", "formacao"] as const).filter(
    (k) => !sectionKeys.includes(k),
  );

  const strengths: string[] = [];
  if (technicalJob.length && foundTechnical.length / technicalJob.length >= 0.6)
    strengths.push(
      `Cobre ${foundTechnical.length} de ${technicalJob.length} competências técnicas exigidas pela vaga.`,
    );
  if (found.length)
    strengths.push(
      `Já menciona termos-chave da vaga, como ${listJoin(found.slice(0, 3).map((f) => f.term))}.`,
    );
  if (metrics > 0)
    strengths.push(
      `Apresenta ${metrics} resultado${metrics > 1 ? "s" : ""} quantificado${metrics > 1 ? "s" : ""}, muito valorizado${metrics > 1 ? "s" : ""} por recrutadores.`,
    );
  if (foundSoft.length)
    strengths.push(`Evidencia competências comportamentais pedidas: ${listJoin(foundSoft.slice(0, 3).map((f) => f.term))}.`);
  if (sectionKeys.length >= 3) strengths.push("Estrutura com seções bem identificáveis pelo parser.");
  if (hasEmail || hasPhone) strengths.push("Dados de contato fáceis de localizar.");
  if (wordCount >= 250 && wordCount <= 900) strengths.push("Extensão adequada para leitura por ATS e recrutadores.");
  strengths.push("Conteúdo em texto simples, fácil de processar por sistemas ATS.");

  const bottlenecks: string[] = [];
  if (missingTech.length)
    bottlenecks.push(
      `Faltam ${missingTech.length} competência${missingTech.length > 1 ? "s" : ""} técnica${missingTech.length > 1 ? "s" : ""} da vaga, como ${listJoin(missingTech.slice(0, 3).map((m) => m.term))}.`,
    );
  if (weakVerbs > 0)
    bottlenecks.push(
      `${weakVerbs} frase${weakVerbs > 1 ? "s" : ""} começava${weakVerbs > 1 ? "m" : ""} com verbos fracos (ex.: “Responsável por”).`,
    );
  if (metrics === 0)
    bottlenecks.push("Nenhum resultado quantificado. Inclua números reais (%, prazos, volumes), se houver.");
  if (missingSoft.length)
    bottlenecks.push(`Não evidencia: ${listJoin(missingSoft.slice(0, 3).map((m) => m.term))}.`);
  if (missingSections.length)
    bottlenecks.push(
      `Seções não identificadas: ${listJoin(missingSections.map((k) => SECTION_TITLES[k].charAt(0) + SECTION_TITLES[k].slice(1).toLowerCase()))}.`,
    );
  if (hasTable) bottlenecks.push("Tabulações ou separadores de tabela podem quebrar a leitura do ATS.");
  if (!hasEmail) bottlenecks.push("E-mail de contato não encontrado.");
  if (wordCount < 150) bottlenecks.push("Currículo curto: detalhe melhor suas experiências reais.");
  if (wordCount > 1000) bottlenecks.push("Currículo extenso: priorize o que se relaciona com a vaga.");
  bottlenecks.push("Revise se algum termo ausente reflete experiência real que você omitiu.");

  /* ---------- Transparency log ---------- */
  const synonyms = found.filter((f) => f.resumeAlias);
  const changes: string[] = [
    "Conteúdo reorganizado em seções padrão ATS, com títulos em caixa alta e coluna única.",
  ];
  if (weakVerbs) changes.push(`${weakVerbs} frase${weakVerbs > 1 ? "s" : ""} reescrita${weakVerbs > 1 ? "s" : ""} com verbos de ação no passado.`);
  if (found.length) changes.push(`${found.length} palavra${found.length > 1 ? "s" : ""}-chave já presente${found.length > 1 ? "s" : ""} no seu texto destacada${found.length > 1 ? "s" : ""} no Resumo e em Habilidades.`);
  const firstSynonym = synonyms[0];
  if (firstSynonym)
    changes.push(
      `${synonyms.length} termo${synonyms.length > 1 ? "s" : ""} padronizado${synonyms.length > 1 ? "s" : ""} com a nomenclatura da vaga (ex.: ${firstSynonym.resumeAlias} → ${firstSynonym.term}).`,
    );
  if (decorRemoved) changes.push("Ícones, símbolos e tabulações removidos para não confundir o parser.");
  changes.push("Nenhuma experiência, cargo, métrica ou curso foi adicionado. Termos ausentes ficam apenas como recomendação.");

  return {
    score,
    level,
    label,
    total,
    found,
    missing,
    strengths: strengths.slice(0, 3),
    bottlenecks: bottlenecks.slice(0, 3),
    optimizedResume,
    changes,
    stats: { wordCount, metrics, weakVerbs, sections: sectionNames },
  };
}
