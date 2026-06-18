import { Sparkles, TrendingUp } from "lucide-react";

import type { Earnings } from "@/lib/types";
import { cn } from "@/lib/utils";

function sparkPath(points: number[]): { line: string; area: string } {
  const n = points.length;
  const x = (i: number) => (i / (n - 1)) * 320;
  const y = (p: number) => 54 - (p / 100) * 46;
  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p).toFixed(1)}`)
    .join(" ");
  const area = `${line} L320,56 L0,56 Z`;
  return { line, area };
}

function ScenarioCard({
  scenario,
  highlight,
}: {
  scenario: Earnings["scenarios"][number];
  highlight: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        highlight
          ? "border-accent bg-accent-soft shadow-soft"
          : "border-border bg-muted/30",
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "font-mono text-[11px] font-semibold uppercase tracking-[0.1em]",
            highlight ? "text-accent" : "text-fg-muted",
          )}
        >
          {scenario.label}
        </span>
        {highlight ? (
          <span className="rounded-md bg-accent px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-accent-fg">
            Target
          </span>
        ) : null}
      </div>
      <div className="mt-2 flex items-end gap-1.5">
        <span className="text-[30px] font-semibold leading-none tracking-tight text-fg">
          {scenario.arr}
        </span>
        <span className="mb-1 text-xs text-fg-muted">/ year</span>
      </div>
      <div className="mt-1 text-[13px] font-medium text-fg-muted">
        {scenario.mrr} / month
      </div>
      <div className="mt-2.5 border-t border-border pt-2.5 font-mono text-[11px] text-fg-muted">
        {scenario.basis}
      </div>
    </div>
  );
}

export function EarningsPotential({ earnings }: { earnings: Earnings }) {
  const { line, area } = sparkPath(earnings.rampPoints);

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-soft md:p-8">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-accent-soft text-accent">
          <Sparkles className="size-[18px]" />
        </span>
        <div>
          <h3 className="text-[19px] font-semibold leading-snug tracking-tight text-fg">
            {earnings.headline}
          </h3>
          <p className="mt-1.5 max-w-[60ch] text-sm text-fg-muted">
            {earnings.summary}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {earnings.scenarios.map((s, i) => (
          <ScenarioCard key={s.label} scenario={s} highlight={i === 1} />
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-muted/30 p-5">
        <div className="mb-2 flex items-center gap-2">
          <TrendingUp className="size-4 text-accent" />
          <b className="text-[13px] text-fg">{earnings.rampCaption}</b>
        </div>
        <svg
          width="100%"
          height="56"
          viewBox="0 0 320 56"
          preserveAspectRatio="none"
          aria-label="Revenue ramp"
        >
          <defs>
            <linearGradient id="earnfill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: "var(--accent)", stopOpacity: 0.22 }} />
              <stop offset="1" style={{ stopColor: "var(--accent)", stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#earnfill)" />
          <path
            d={line}
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ stroke: "var(--accent)" }}
          />
        </svg>
      </div>

      <div className="mt-5">
        <div className="mb-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-fg-muted">
          How others are already winning
        </div>
        <div className="flex flex-col gap-3">
          {earnings.proof.map((p) => (
            <div
              key={p.name}
              className="grid grid-cols-[1fr_auto] items-start gap-3.5 rounded-2xl border border-border bg-muted/30 px-4 py-3.5"
            >
              <div className="min-w-0">
                <div className="text-[15px] font-semibold text-fg">{p.name}</div>
                <div className="mt-0.5 text-[13px] text-fg-muted">{p.text}</div>
              </div>
              <span className="shrink-0 whitespace-nowrap rounded-md border border-accent/30 bg-accent-soft px-2 py-1 font-mono text-[11px] font-semibold text-accent">
                {p.figure}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-fg-muted">
          What this means for you
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {earnings.benefits.map((b) => (
            <div
              key={b.title}
              className="rounded-2xl border border-success/30 bg-success-soft p-4"
            >
              <div className="text-[14px] font-semibold text-fg">{b.title}</div>
              <p className="mt-1 text-[13px] leading-snug text-fg-muted">
                {b.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
