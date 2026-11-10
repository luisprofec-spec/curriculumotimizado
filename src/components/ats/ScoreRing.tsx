import { cn } from "@/lib/utils";
import type { Level } from "@/lib/ats/analyze";

const STROKE: Record<Level, string> = {
  low: "stroke-warning",
  good: "stroke-primary",
  excellent: "stroke-success",
};

export function ScoreRing({ score, level, size = 176 }: { score: number; level: Level; size?: number }) {
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;

  return (
    <div className="relative" style={{ width: size, height: size }} role="img" aria-label={`Match score de ${score}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-muted" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={cn(STROKE[level], "transition-[stroke-dashoffset] duration-1000 ease-out")}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold tracking-tight text-foreground tabular-nums">
          {score}
          <span className="text-2xl text-muted-foreground">%</span>
        </span>
        <span className="mt-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Match
        </span>
      </div>
    </div>
  );
}
