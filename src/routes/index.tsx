import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowRight, FileText, Loader2, RotateCcw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { InputPanel } from "@/components/ats/InputPanel";
import { Results } from "@/components/ats/Results";
import { analyzeResume, type Analysis } from "@/lib/ats/analyze";
import { SAMPLE_JOB, SAMPLE_RESUME } from "@/lib/ats/samples";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ResumAI ATS · Otimizador de currículos para triagem automática" },
      {
        name: "description",
        content:
          "Compare seu currículo com a vaga, veja o Match Score, as palavras-chave ausentes e gere uma versão ATS-friendly sem inventar experiências.",
      },
      { property: "og:title", content: "ResumAI ATS · Otimizador de currículos" },
      {
        property: "og:description",
        content: "Match Score, auditoria de palavras-chave e currículo ATS-friendly pronto para exportar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [job, setJob] = useState("");
  const [resume, setResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const resultsRef = useRef<HTMLElement>(null);

  const hasContent = Boolean(job || resume || analysis);

  const reset = () => {
    setJob("");
    setResume("");
    setAnalysis(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const run = () => {
    if (job.trim().length < 40) {
      toast.error("Cole a descrição da vaga", { description: "Precisamos de pelo menos algumas linhas." });
      return;
    }
    if (resume.trim().length < 80) {
      toast.error("Cole o texto do seu currículo", { description: "Precisamos de pelo menos algumas linhas." });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = analyzeResume(job, resume);
      setAnalysis(result);
      setLoading(false);
      if (result.total === 0) {
        toast.warning("Poucos termos técnicos na vaga", {
          description: "Inclua requisitos e qualificações para uma análise mais precisa.",
        });
      }
      requestAnimationFrame(() =>
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    }, 1100);
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen">
        <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
            <a href="/" className="flex items-center gap-2.5" aria-label="ResumAI ATS, início">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-glow">
                <FileText className="size-5" />
              </span>
              <span className="text-lg font-bold tracking-tight text-foreground">
                ResumAI <span className="text-primary">ATS</span>
              </span>
            </a>
            <Badge variant="success" className="hidden sm:inline-flex">
              100% ATS Friendly
            </Badge>
            <div className="ml-auto">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" disabled={!hasContent}>
                    <RotateCcw />
                    Nova análise
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Começar uma nova análise?</DialogTitle>
                    <DialogDescription>
                      A vaga, o currículo e os resultados atuais serão apagados desta tela.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button onClick={reset}>Limpar campos</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        <main>
          <section className="relative overflow-hidden border-b border-border bg-hero">
            <div className="pointer-events-none absolute inset-0 bg-grid" aria-hidden />
            <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pt-16">
              <div className="max-w-3xl animate-rise">
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
                  Otimizador de currículos
                </p>
                <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
                  Seu currículo, lido do jeito que o ATS lê.
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                  Compare com a vaga, descubra o seu Match Score e gere uma versão estruturada para
                  passar pela triagem automática.
                </p>
              </div>
              <Alert variant="ethics" className="mt-8 max-w-3xl animate-rise shadow-card">
                <ShieldCheck />
                <AlertTitle className="font-semibold">Princípio Ético</AlertTitle>
                <AlertDescription>
                  Otimizamos seu currículo sem inventar nenhuma experiência. A transparência garante seu
                  sucesso na entrevista.
                </AlertDescription>
              </Alert>
            </div>
          </section>

          <section aria-label="Entrada de dados" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <InputPanel
                id="job"
                step={1}
                title="Descrição da Vaga"
                description="Requisitos, responsabilidades e diferenciais."
                placeholder="Cole aqui os requisitos, responsabilidades e qualificações da vaga..."
                value={job}
                onChange={setJob}
                onSample={() => setJob(SAMPLE_JOB)}
                sampleLabel="Vaga exemplo"
              />
              <InputPanel
                id="resume"
                step={2}
                title="Seu Currículo Atual"
                description="O texto completo, do jeito que está hoje."
                placeholder="Cole o texto completo do seu currículo atual..."
                value={resume}
                onChange={setResume}
                onSample={() => setResume(SAMPLE_RESUME)}
                sampleLabel="Currículo exemplo"
              />
            </div>

            <div className="mt-8 flex flex-col items-center gap-3">
              <Button variant="hero" size="xl" onClick={run} disabled={loading} className="w-full sm:w-auto">
                {loading ? <Loader2 className="animate-spin" /> : null}
                {loading ? "Analisando currículo..." : "Analisar e Otimizar Currículo"}
                {!loading && <ArrowRight />}
              </Button>
              <p className="text-xs text-muted-foreground">
                A análise acontece no seu navegador. Nada é enviado ou salvo.
              </p>
            </div>
          </section>

          {analysis && (
            <section
              ref={resultsRef}
              aria-label="Resultados da análise"
              className="scroll-mt-20 border-t border-border bg-card/40"
            >
              <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-2 animate-rise">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-widest text-primary">Resultado</p>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Sua análise ATS</h2>
                  </div>
                </div>
                <Results key={analysis.optimizedResume + analysis.score} analysis={analysis} />
              </div>
            </section>
          )}
        </main>

        <footer className="border-t border-border">
          <div className="mx-auto max-w-7xl px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
            ResumAI ATS · Reorganizamos e destacamos o que você já fez. Nunca inventamos.
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
