import type { Evaluation } from "@/lib/types";

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

const TIERS = [
  { key: "tam", label: "TAM", mix: 40 },
  { key: "sam", label: "SAM", mix: 60 },
  { key: "som", label: "SOM", mix: 100 },
] as const;

export function MarketRings({
  market,
  demandTrend,
}: Pick<Evaluation, "market" | "demandTrend">) {
  const { line, area } = sparkPath(demandTrend.points);
  const up = demandTrend.changePct >= 0;

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-soft md:p-8">
      <div className="flex flex-wrap items-center gap-6">
        <svg
          width="150"
          height="150"
          viewBox="0 0 150 150"
          aria-label="Market size rings"
          className="shrink-0"
        >
          <circle
            cx="75"
            cy="75"
            r="68"
            style={{ fill: "color-mix(in srgb, var(--accent) 12%, var(--surface))" }}
          />
          <circle
            cx="75"
            cy="75"
            r="68"
            fill="none"
            strokeWidth="2"
            style={{ stroke: "color-mix(in srgb, var(--accent) 40%, transparent)" }}
          />
          <circle
            cx="75"
            cy="92"
            r="44"
            style={{ fill: "color-mix(in srgb, var(--accent) 26%, var(--surface))" }}
          />
          <circle
            cx="75"
            cy="92"
            r="44"
            fill="none"
            strokeWidth="2"
            style={{ stroke: "color-mix(in srgb, var(--accent) 60%, transparent)" }}
          />
          <circle cx="75" cy="112" r="20" style={{ fill: "var(--accent)" }} />
          <text
            x="75"
            y="26"
            textAnchor="middle"
            className="font-mono"
            fontSize="9"
            fontWeight="600"
            style={{ fill: "var(--accent)" }}
          >
            TAM
          </text>
          <text
            x="75"
            y="62"
            textAnchor="middle"
            className="font-mono"
            fontSize="9"
            fontWeight="600"
            style={{ fill: "var(--accent)" }}
          >
            SAM
          </text>
          <text
            x="75"
            y="116"
            textAnchor="middle"
            className="font-mono"
            fontSize="9"
            fontWeight="700"
            style={{ fill: "var(--accent-fg)" }}
          >
            SOM
          </text>
        </svg>
        <div className="flex min-w-[180px] flex-1 flex-col gap-3.5">
          {TIERS.map((t) => (
            <div key={t.key} className="flex items-start gap-3">
              <span
                className="mt-1 size-[11px] shrink-0 rounded"
                style={{
                  background: `color-mix(in srgb, var(--accent) ${t.mix}%, transparent)`,
                }}
              />
              <div>
                <div className="font-mono text-[11px] font-semibold tracking-wide text-fg-muted">
                  {t.label}
                </div>
                <div className="text-[20px] font-semibold tracking-tight text-fg">
                  {market[t.key].value}
                </div>
                <div className="text-xs text-fg-muted">{market[t.key].label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <div className="mb-2 flex items-baseline justify-between">
          <b className="text-[13px] text-fg">Search demand, last 24 months</b>
          <span
            className={`font-mono text-xs font-semibold ${up ? "text-success" : "text-danger"}`}
          >
            {up ? "▲" : "▼"} {Math.abs(demandTrend.changePct)}%
          </span>
        </div>
        <svg
          width="100%"
          height="56"
          viewBox="0 0 320 56"
          preserveAspectRatio="none"
          aria-label="Demand trend"
        >
          <defs>
            <linearGradient id="sparkfill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: "var(--accent)", stopOpacity: 0.22 }} />
              <stop offset="1" style={{ stopColor: "var(--accent)", stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#sparkfill)" />
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
    </section>
  );
}
