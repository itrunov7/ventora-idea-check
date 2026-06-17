"use client";

import { useEffect, useState } from "react";
import { BarChart3, Check, CreditCard, TrendingUp } from "lucide-react";

import { EXAMPLE_EVALUATION } from "@/lib/example-evaluation";

const R = 52;
const C = 2 * Math.PI * R;

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

function MiniRing({ score }: { score: number }) {
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
    <div className="relative h-[124px] w-[124px]">
      <svg width="124" height="124" viewBox="0 0 124 124">
        <circle
          cx="62"
          cy="62"
          r={R}
          fill="none"
          strokeWidth="10"
          style={{ stroke: "var(--muted)" }}
        />
        <circle
          cx="62"
          cy="62"
          r={R}
          fill="none"
          stroke="url(#teasergrad)"
          strokeWidth="10"
          strokeLinecap="round"
          transform="rotate(-90 62 62)"
          strokeDasharray={C}
          strokeDashoffset={offset}
          style={{
            transition: reduce
              ? undefined
              : "stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1)",
          }}
        />
        <defs>
          <linearGradient id="teasergrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: "var(--accent)", stopOpacity: 0.65 }} />
            <stop offset="1" style={{ stopColor: "var(--accent)" }} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <b className="text-[34px] font-semibold leading-none tracking-tight text-fg">
          {display}
        </b>
        <small className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-fg-muted">
          Viability
        </small>
      </div>
    </div>
  );
}

function Stat({
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
      <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-fg-muted [&_svg]:size-3.5 [&_svg]:text-accent">
        {icon}
        {k}
      </div>
      <div className="mt-1 text-[17px] font-semibold tracking-tight text-fg">
        {v}
      </div>
    </div>
  );
}

export function VerdictTeaser() {
  const { viabilityScore, verdict, quickStats } = EXAMPLE_EVALUATION;
  return (
    <div className="flex w-full flex-col items-center gap-5 rounded-2xl border border-border bg-surface p-7 shadow-soft sm:p-8">
      <MiniRing score={viabilityScore} />
      <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success-soft px-3 py-1.5 text-[13px] font-semibold text-success">
        <Check className="size-3.5" />
        {verdict.label}
      </span>
      <div className="grid w-full grid-cols-3 gap-3.5 border-t border-border pt-5">
        <Stat icon={<TrendingUp />} k="Demand" v={quickStats.demand} />
        <Stat icon={<BarChart3 />} k="Market" v={quickStats.market} />
        <Stat icon={<CreditCard />} k="Will pay?" v={quickStats.willingToPay} />
      </div>
    </div>
  );
}
