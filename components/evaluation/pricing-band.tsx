import type { Evaluation } from "@/lib/types";

function Pin({ pct }: { pct: number }) {
  return (
    <span
      className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-accent bg-surface shadow-soft-sm"
      style={{ left: `${pct}%` }}
    />
  );
}

export function PricingBand({ pricing }: { pricing: Evaluation["pricing"] }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-soft md:p-8">
      <div className="grid items-center gap-6 md:grid-cols-2">
        <div>
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
            Suggested entry price
          </div>
          <div className="mt-1.5 flex items-end gap-1.5">
            <span className="text-[38px] font-semibold leading-none tracking-tight text-fg">
              {pricing.suggested}
            </span>
            <span className="mb-1.5 text-sm text-fg-muted">{pricing.unit}</span>
          </div>
          <p className="mt-3.5 max-w-[40ch] text-sm text-fg-muted">
            {pricing.rationale}
          </p>
        </div>
        <div>
          <div
            className="relative my-5 h-2 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, var(--muted), color-mix(in srgb, var(--accent) 45%, var(--muted)), var(--accent))",
            }}
          >
            <Pin pct={pricing.rangeLowPct} />
            <Pin pct={pricing.rangeHighPct} />
          </div>
          <div className="flex justify-between font-mono text-[11px] text-fg-muted">
            <span>$0 free</span>
            <span>$20</span>
            <span>$40</span>
            <span>$60+</span>
          </div>
          <p className="mt-3.5 font-mono text-xs text-fg-muted">
            Two pins = the price range the market already accepts.
          </p>
        </div>
      </div>
    </section>
  );
}
