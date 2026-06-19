"use client";

import { useEffect, useState } from "react";
import { CreditCard, ShieldQuestion, TrendingUp, BarChart3 } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { Verdict } from "@/lib/types";

const R = 52;
const C = 2 * Math.PI * R;

const VERDICT_META: Record<
  Verdict["verdict"],
  { label: string; pill: string }
> = {
  promising: {
    label: "Promising",
    pill: "border-success/30 bg-success-soft text-success",
  },
  mixed: {
    label: "Mixed",
    pill: "border-accent/30 bg-accent-soft text-accent",
  },
  risky: {
    label: "Risky",
    pill: "border-danger/30 bg-danger-soft text-danger",
  },
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
    <div className="relative h-[124px] w-[124px] shrink-0">
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
          stroke="url(#verdictgrad)"
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
          <linearGradient id="verdictgrad" x1="0" y1="0" x2="1" y2="1">
            <stop
              offset="0"
              style={{ stopColor: "var(--accent)", stopOpacity: 0.65 }}
            />
            <stop offset="1" style={{ stopColor: "var(--accent)" }} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <b className="text-[36px] font-semibold leading-none tracking-tight text-fg">
          {display}
        </b>
        <small className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-fg-muted">
          Viability
        </small>
      </div>
    </div>
  );
}

function Signal({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-2.5 sm:px-6 sm:first:pl-0 sm:last:pr-0">
      <div className="flex size-8 items-center justify-center rounded-xl bg-muted text-accent [&_svg]:size-4">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-fg-muted">
          {label}
        </span>
        <span className="text-[15px] font-medium leading-snug text-fg">
          {value}
        </span>
      </div>
    </div>
  );
}

export function VerdictCard({ verdict }: { verdict: Verdict }) {
  const meta = VERDICT_META[verdict.verdict];

  return (
    <Card className="w-full rounded-3xl p-8 sm:p-10">
      <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:gap-8 sm:text-left">
        <ScoreRing score={Math.round(verdict.score)} />
        <div className="flex flex-col items-center gap-3 sm:items-start">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-muted">
            The verdict
          </span>
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[13px] font-semibold ${meta.pill}`}
          >
            {meta.label}
          </span>
        </div>
      </div>

      <p className="mt-7 text-[17px] leading-relaxed text-fg">
        {verdict.summary}
      </p>

      <div className="mt-8 grid gap-7 border-t border-border pt-7 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-border">
        <Signal
          icon={<TrendingUp />}
          label="Demand"
          value={verdict.demand}
        />
        <Signal
          icon={<BarChart3 />}
          label="Market size"
          value={verdict.marketSize}
        />
        <Signal
          icon={<CreditCard />}
          label="Willingness to pay"
          value={verdict.willingnessToPay}
        />
      </div>
    </Card>
  );
}

export function VerdictSkeleton() {
  return (
    <Card className="w-full rounded-3xl p-8 sm:p-10">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
        <div className="size-[124px] shrink-0 animate-pulse rounded-full bg-muted" />
        <div className="flex flex-col items-center gap-3 sm:items-start">
          <div className="h-3 w-24 animate-pulse rounded-md bg-muted" />
          <div className="h-7 w-28 animate-pulse rounded-full bg-muted" />
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-2.5">
        <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted" />
      </div>

      <div className="mt-8 grid gap-7 border-t border-border pt-7 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-border">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex flex-col gap-2.5 sm:px-6 sm:first:pl-0 sm:last:pr-0"
          >
            <div className="size-8 animate-pulse rounded-xl bg-muted" />
            <div className="h-3 w-16 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
          </div>
        ))}
      </div>

      <span className="sr-only">
        <ShieldQuestion /> Scoring your idea…
      </span>
    </Card>
  );
}
