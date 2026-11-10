import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { countWords } from "@/lib/ats/analyze";

interface InputPanelProps {
  id: string;
  step: number;
  title: string;
  description: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onSample: () => void;
  sampleLabel: string;
}

export function InputPanel({
  id,
  step,
  title,
  description,
  placeholder,
  value,
  onChange,
  onSample,
  sampleLabel,
}: InputPanelProps) {
  const chars = value.length;
  const words = countWords(value);

  return (
    <Card className="flex flex-col border-border shadow-card">
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2.5 text-lg">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-accent-foreground">
              {step}
            </span>
            <label htmlFor={id}>{title}</label>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button variant="soft" size="sm" onClick={onSample} type="button">
          <Sparkles />
          {sampleLabel}
        </Button>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2">
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[320px] max-h-[640px] flex-1 resize-y rounded-lg bg-background/60 p-4 text-sm leading-relaxed [field-sizing:content] focus-visible:ring-2"
        />
        <p className="text-right text-xs tabular-nums text-muted-foreground" aria-live="polite">
          {chars.toLocaleString("pt-BR")} caracteres · {words.toLocaleString("pt-BR")} palavras
        </p>
      </CardContent>
    </Card>
  );
}
