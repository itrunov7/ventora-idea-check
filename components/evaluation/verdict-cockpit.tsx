"use client";

import { useEffect, useState } from "react";
import { BarChart3, Check, CreditCard, TrendingUp } from "lucide-react";

import type { Evaluation, VerdictTone } from "@/lib/types";
import { cn } from "@/lib/utils";

const R = 80;
const C = 2 * Math.PI * R;

const TONE: Record<VerdictTone, string> = {
  go: "border-success/30 bg-success-soft text-success",
  caution: "border-accent/30 bg-accent-soft text-accent",
  no: "border-danger/30 bg-danger-soft text-danger",
};

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduce;
}

function ScoreRing({ score }: { score: number }) {
  const reduce = usePrefersReducedMotion();
  const target = C * (1 - score / 100);
  const [display, setDisplay] = useState(0);
  const [offset, setOffset] = useState(C);

  useEffect(() => {
    if (reduce) {
      const raf = requestAnimationFrame(() => {
        setDisplay(score);
        setOffset(target);
      });
      return () => cancelAnimationFrame(raf);
    }

    const raf = requestAnimationFrame(() => setOffset(target));
    const dur = 1100;
    let start: number | null = null;
    let frame = requestAnimationFrame(function step(t) {
      if (start === null) start = t;
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(score * eased));
      if (p < 1) frame = requestAnimationFrame(step);
    });

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(frame);
    };
  }, [score, target, reduce]);

  return (
    <div className="relative h-[188px] w-[188px]">
      <svg width="188" height="188" viewBox="0 0 188 188">
        <circle
          cx="94"
          cy="94"
          r={R}
          fill="none"
          strokeWidth="14"
          style={{ stroke: "var(--muted)" }}
        />
        <circle
          cx="94"
          cy="94"
          r={R}
          fill="none"
          stroke="url(#ringgrad)"
          strokeWidth="14"
          strokeLinecap="round"
          transform="rotate(-90 94 94)"
          strokeDasharray={C}
          strokeDashoffset={offset}
          style={{
            transition: reduce
              ? undefined
              : "stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1)",
          }}
        />
        <defs>
          <linearGradient id="ringgrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: "var(--accent)", stopOpacity: 0.65 }} />
            <stop offset="1" style={{ stopColor: "var(--accent)" }} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <b className="text-[52px] font-semibold leading-none tracking-tight text-fg">
          {display}
        </b>
        <small className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-fg-muted">
          Viability
        </small>
      </div>
    </div>
  );
}

function QuickStat({
  icon,
  k,
  v,
}: {
  icon: React.ReactNode;
  k: string;
  v: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-fg-muted [&_svg]:size-3.5 [&_svg]:text-accent">
        {icon}
        {k}
      </div>
      <div className="mt-1.5 text-[19px] font-semibold tracking-tight text-fg">
        {v}
      </div>
    </div>
  );
}

export function VerdictCockpit({ data }: { data: Evaluation }) {
  const { verdict, quickStats } = data;
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
      <div className="grid md:grid-cols-[1.45fr_1fr]">
        <div className="p-8 md:p-10">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-muted">
            Your idea
          </div>
          <h1 className="mt-2.5 text-[clamp(26px,4.4vw,40px)] font-semibold leading-[1.05] tracking-tight text-fg">
            {data.idea}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-semibold",
                TONE[verdict.tone],
              )}
            >
              <Check className="size-3.5" />
              {verdict.label}
            </span>
            <span className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1.5 font-mono text-xs text-fg-muted">
              Confidence: {verdict.confidence}
            </span>
          </div>
          <p className="mt-4 max-w-[46ch] text-base text-fg-muted">
            {data.synthesis}
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3.5 border-t border-border pt-5">
            <QuickStat
              icon={<TrendingUp />}
              k="Demand"
              v={quickStats.demand}
            />
            <QuickStat icon={<BarChart3 />} k="Market" v={quickStats.market} />
            <QuickStat
              icon={<CreditCard />}
              k="Will pay?"
              v={quickStats.willingToPay}
            />
          </div>
        </div>

        <div className="relative flex flex-col items-center justify-center border-t border-border bg-accent-soft/50 p-8 md:border-l md:border-t-0">
          <ScoreRing score={data.viabilityScore} />
        </div>
      </div>
    </section>
  );
}
