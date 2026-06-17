import type { EvaluationScores } from "@/lib/types";

const MAXR = 110;

const AXES: { key: keyof EvaluationScores; label: string }[] = [
  { key: "marketTiming", label: "TIMING" },
  { key: "problemFit", label: "FIT" },
  { key: "demand", label: "DEMAND" },
  { key: "monetization", label: "MONETIZE" },
  { key: "differentiation", label: "DIFF." },
  { key: "competition", label: "COMPETE" },
];

const LEGEND: { key: keyof EvaluationScores; label: string }[] = [
  { key: "marketTiming", label: "Market timing" },
  { key: "problemFit", label: "Problem fit" },
  { key: "demand", label: "Demand" },
  { key: "monetization", label: "Monetization" },
  { key: "differentiation", label: "Differentiation" },
  { key: "competition", label: "Competition" },
];

/** Point on axis i (0 = top, clockwise every 60deg) at value v (0-100). */
function pt(i: number, v: number): [number, number] {
  const angle = ((-90 + i * 60) * Math.PI) / 180;
  const r = (v / 100) * MAXR;
  return [
    Number((r * Math.cos(angle)).toFixed(1)),
    Number((r * Math.sin(angle)).toFixed(1)),
  ];
}

function ringPoints(v: number): string {
  return AXES.map((_, i) => pt(i, v).join(",")).join(" ");
}

export function ScoresRadar({ scores }: { scores: EvaluationScores }) {
  const dataPts = AXES.map((ax, i) => pt(i, scores[ax.key]));
  const dataStr = dataPts.map((p) => p.join(",")).join(" ");

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-soft md:p-8">
      <svg
        viewBox="0 0 320 300"
        width="100%"
        role="img"
        aria-label="Radar of six evaluation criteria"
        className="block"
      >
        <g transform="translate(160,150)">
          <g fill="none" style={{ stroke: "var(--border)" }} strokeWidth="1">
            {[100, 75, 50, 25].map((lvl) => (
              <polygon key={lvl} points={ringPoints(lvl)} />
            ))}
          </g>
          <g style={{ stroke: "var(--border)" }} strokeWidth="1">
            {AXES.map((_, i) => {
              const [x, y] = pt(i, 100);
              return <line key={i} x1="0" y1="0" x2={x} y2={y} />;
            })}
          </g>
          <polygon
            points={dataStr}
            strokeWidth="2"
            style={{
              fill: "color-mix(in srgb, var(--accent) 16%, transparent)",
              stroke: "var(--accent)",
            }}
          />
          <g style={{ fill: "var(--accent)" }}>
            {dataPts.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="3.2" />
            ))}
          </g>
          <g
            className="font-mono"
            fontSize="10"
            fontWeight="600"
            style={{ fill: "var(--fg-muted)" }}
          >
            {AXES.map((ax, i) => {
              const [x, y] = pt(i, 100);
              const lx = x * 1.16;
              const ly = y * 1.16 + (y < -10 ? -6 : y > 10 ? 13 : 4);
              return (
                <text key={ax.key} x={lx} y={ly} textAnchor="middle">
                  {ax.label}
                </text>
              );
            })}
          </g>
        </g>
      </svg>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
        {LEGEND.map((l) => (
          <div
            key={l.key}
            className="flex items-center gap-1.5 text-[12.5px] text-fg-muted"
          >
            <span className="size-2 rounded-full bg-accent" />
            {l.label}{" "}
            <b className="font-mono font-semibold text-fg">{scores[l.key]}</b>
          </div>
        ))}
      </div>
    </section>
  );
}
