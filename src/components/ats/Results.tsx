import { useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle,
  Copy,
  Download,
  FileText,
  Gauge,
  Info,
  ListChecks,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScoreRing } from "@/components/ats/ScoreRing";
import type { Analysis, KeywordResult } from "@/lib/ats/analyze";
import { CATEGORY_LABELS, type Category } from "@/lib/ats/keywords";
import { downloadPdf, downloadTxt } from "@/lib/ats/export";

const LEVEL_COPY: Record<Analysis["level"], string> = {
  low: "Seu currículo ainda conversa pouco com esta vaga. Veja os termos ausentes e revise se algum reflete experiência real.",
  good: "Boa base. Ajustar termos e estrutura pode subir sua posição na triagem.",
  excellent: "Seu perfil está muito alinhado. A versão otimizada deixa isso claro para o ATS.",
};

const CATEGORY_ORDER: Category[] = ["tecnica", "metodologia", "comportamental", "idioma", "cargo"];

function groupByCategory(items: KeywordResult[]) {
  return CATEGORY_ORDER.map((c) => ({ category: c, items: items.filter((i) => i.category === c) })).filter(
    (g) => g.items.length,
  );
}

export function Results({ analysis }: { analysis: Analysis }) {
  return (
    <Tabs defaultValue="score" className="w-full">
      <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl border border-border bg-card p-1.5 shadow-card">
        <TabsTrigger value="score" className="gap-2 rounded-lg py-2.5 data-[state=active]:bg-primary-soft data-[state=active]:text-accent-foreground data-[state=active]:shadow-none">
          <Gauge className="size-4" />
          <span className="hidden sm:inline">Compatibilidade</span>
          <span className="sm:hidden">Score</span>
        </TabsTrigger>
        <TabsTrigger value="keywords" className="gap-2 rounded-lg py-2.5 data-[state=active]:bg-primary-soft data-[state=active]:text-accent-foreground data-[state=active]:shadow-none">
          <ListChecks className="size-4" />
          <span className="hidden sm:inline">Palavras-chave</span>
          <span className="sm:hidden">Termos</span>
        </TabsTrigger>
        <TabsTrigger value="resume" className="gap-2 rounded-lg py-2.5 data-[state=active]:bg-primary-soft data-[state=active]:text-accent-foreground data-[state=active]:shadow-none">
          <FileText className="size-4" />
          <span className="hidden sm:inline">Currículo ATS</span>
          <span className="sm:hidden">Currículo</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="score" className="mt-6 animate-rise">
        <ScoreTab analysis={analysis} />
      </TabsContent>
      <TabsContent value="keywords" className="mt-6 animate-rise">
        <KeywordsTab analysis={analysis} />
      </TabsContent>
      <TabsContent value="resume" className="mt-6 animate-rise">
        <ResumeTab analysis={analysis} />
      </TabsContent>
    </Tabs>
  );
}

function ScoreTab({ analysis }: { analysis: Analysis }) {
  const badgeVariant = analysis.level === "excellent" ? "success" : analysis.level === "low" ? "warning" : "soft";
  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <Card className="shadow-card">
        <CardContent className="flex flex-col items-center gap-5 p-8 text-center">
          <ScoreRing score={analysis.score} level={analysis.level} />
          <Badge variant={badgeVariant} className="px-3 py-1 text-sm">
            {analysis.label}
          </Badge>
          <p className="text-sm leading-relaxed text-muted-foreground">{LEVEL_COPY[analysis.level]}</p>
          <Separator />
          <dl className="grid w-full grid-cols-3 gap-2 text-center">
            <Stat label="Encontradas" value={analysis.found.length} tone="text-success" />
            <Stat label="Ausentes" value={analysis.missing.length} tone="text-warning" />
            <Stat label="Total" value={analysis.total} tone="text-foreground" />
          </dl>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <DiagnosisCard
          title="Pontos fortes"
          description="O que o ATS já consegue reconhecer"
          icon={<CheckCircle className="size-5 text-success" />}
          items={analysis.strengths}
          dot="bg-success"
        />
        <DiagnosisCard
          title="Gargalos para o ATS"
          description="O que pode derrubar sua pontuação"
          icon={<AlertTriangle className="size-5 text-warning" />}
          items={analysis.bottlenecks}
          dot="bg-warning"
        />
        <Card className="shadow-card md:col-span-2">
          <CardContent className="space-y-3 p-6">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium text-foreground">
                <TrendingUp className="size-4 text-primary" />
                Cobertura de palavras-chave
              </span>
              <span className="tabular-nums text-muted-foreground">
                {analysis.found.length} de {analysis.total}
              </span>
            </div>
            <Progress value={analysis.score} className="h-2.5 bg-muted" aria-label="Cobertura de palavras-chave" />
            <p className="text-xs text-muted-foreground">
              Cálculo: termos encontrados ÷ termos relevantes da vaga × 100.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div>
      <dd className={`text-2xl font-bold tabular-nums ${tone}`}>{value}</dd>
      <dt className="text-xs text-muted-foreground">{label}</dt>
    </div>
  );
}

function DiagnosisCard({
  title,
  description,
  icon,
  items,
  dot,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  items: string[];
  dot: string;
}) {
  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-relaxed text-foreground">
              <span className={`mt-2 size-1.5 shrink-0 rounded-full ${dot}`} aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function KeywordsTab({ analysis }: { analysis: Analysis }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle className="size-5 text-success" />
            Palavras-chave encontradas
            <span className="ml-auto text-sm font-normal tabular-nums text-muted-foreground">
              {analysis.found.length}
            </span>
          </CardTitle>
          <CardDescription>Termos da vaga que já aparecem no seu currículo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {analysis.found.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum termo da vaga foi encontrado no seu texto.</p>
          )}
          {groupByCategory(analysis.found).map((g) => (
            <KeywordGroup key={g.category} label={CATEGORY_LABELS[g.category]}>
              {g.items.map((k) =>
                k.resumeAlias ? (
                  <Tooltip key={k.term}>
                    <TooltipTrigger asChild>
                      <Badge variant="success" className="cursor-help">
                        <CheckCircle className="size-3.5" />
                        {k.term}
                        <Info className="size-3 opacity-60" />
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>Encontrado no seu texto como “{k.resumeAlias}”</TooltipContent>
                  </Tooltip>
                ) : (
                  <Badge key={k.term} variant="success">
                    <CheckCircle className="size-3.5" />
                    {k.term}
                  </Badge>
                ),
              )}
            </KeywordGroup>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="size-5 text-warning" />
            Ausentes / recomendadas
            <span className="ml-auto text-sm font-normal tabular-nums text-muted-foreground">
              {analysis.missing.length}
            </span>
          </CardTitle>
          <CardDescription>
            Pedidas pela vaga, mas não estão no seu texto. Inclua apenas se você realmente tiver essa experiência.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {analysis.missing.length === 0 && (
            <p className="text-sm text-muted-foreground">Você já cobre todos os termos identificados na vaga.</p>
          )}
          {groupByCategory(analysis.missing).map((g) => (
            <KeywordGroup key={g.category} label={CATEGORY_LABELS[g.category]}>
              {g.items.map((k) => (
                <Badge key={k.term} variant="warning">
                  <AlertTriangle className="size-3.5" />
                  {k.term}
                </Badge>
              ))}
            </KeywordGroup>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function KeywordGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function ResumeTab({ analysis }: { analysis: Analysis }) {
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const text = analysis.optimizedResume;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Texto copiado para a área de transferência");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar. Selecione o texto manualmente.");
    }
  };

  const pdf = async () => {
    setExporting(true);
    try {
      await downloadPdf(text);
      toast.success("PDF gerado em formato ATS");
    } catch {
      toast.error("Não foi possível gerar o PDF.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="overflow-hidden shadow-card">
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
          <p className="mr-auto text-sm font-medium text-foreground">Currículo ATS-Friendly</p>
          <Button variant="outline" size="sm" onClick={copy}>
            {copied ? <Check className="text-success" /> : <Copy />}
            {copied ? "Copiado" : "Copiar Texto"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => downloadTxt(text)}>
            <Download />
            Baixar TXT
          </Button>
          <Button size="sm" onClick={pdf} disabled={exporting}>
            <FileText />
            Exportar PDF Formatado para ATS
          </Button>
        </div>
        <div className="bg-muted/30 p-4 sm:p-8">
          <article
            aria-label="Prévia do currículo otimizado"
            className="mx-auto max-w-[720px] rounded-md border border-border bg-paper px-6 py-8 shadow-elevated sm:px-12 sm:py-12"
          >
            <ResumePreview text={text} />
          </article>
        </div>
      </Card>

      <Card className="h-fit shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">O que mudou</CardTitle>
          <CardDescription>Transparência total sobre cada ajuste.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {analysis.changes.map((c, i) => (
              <li key={c} className="flex gap-3 text-sm leading-relaxed text-foreground">
                <CheckCircle
                  className={`mt-0.5 size-4 shrink-0 ${i === analysis.changes.length - 1 ? "text-success" : "text-primary"}`}
                />
                {c}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

const isHeading = (line: string) =>
  line.length <= 40 && /[A-ZÀ-Ý]{4,}/.test(line) && line === line.toUpperCase() && !/[@\d]/.test(line);

function ResumePreview({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="text-[13.5px] leading-relaxed text-foreground">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-3" />;
        if (i === 0) return <h3 key={i} className="text-2xl font-bold tracking-tight">{line}</h3>;
        if (isHeading(line))
          return (
            <h4 key={i} className="mb-2 mt-3 border-b border-border pb-1 text-xs font-bold tracking-[0.14em] text-foreground">
              {line}
            </h4>
          );
        if (line.startsWith("- "))
          return (
            <p key={i} className="relative pl-4 before:absolute before:left-0 before:content-['–'] before:text-muted-foreground">
              {line.slice(2)}
            </p>
          );
        return (
          <p key={i} className={i <= 2 ? "text-muted-foreground" : ""}>
            {line}
          </p>
        );
      })}
    </div>
  );
}
