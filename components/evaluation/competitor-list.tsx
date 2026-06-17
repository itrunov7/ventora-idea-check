import type { Evaluation } from "@/lib/types";

const AVATARS = [
  "linear-gradient(135deg,#ff8a4c,#ef5f3c)",
  "linear-gradient(135deg,#3a3a3a,#111)",
  "linear-gradient(135deg,#26c0a6,#13b07c)",
];

export function CompetitorList({
  competitors,
  edge,
}: Pick<Evaluation, "competitors" | "edge">) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-soft md:p-8">
      <div className="flex flex-col gap-3">
        {competitors.map((c, i) => (
          <div
            key={c.name}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-3.5 rounded-2xl border border-border bg-muted/30 px-4 py-3.5"
          >
            <div
              className="flex size-[38px] items-center justify-center rounded-[10px] text-[15px] font-semibold text-white"
              style={{ background: AVATARS[i % AVATARS.length] }}
            >
              {c.initial}
            </div>
            <div className="min-w-0">
              <div className="text-[15px] font-semibold text-fg">{c.name}</div>
              <div className="mt-0.5 text-[13px] text-fg-muted">{c.gap}</div>
            </div>
            <div>
              <div className="h-1.5 w-[74px] overflow-hidden rounded-full bg-accent-soft">
                <span
                  className="block h-full rounded-full bg-accent"
                  style={{ width: `${c.reachScore}%` }}
                />
              </div>
              <div className="mt-1.5 text-right font-mono text-[11px] font-semibold text-fg-muted">
                {c.reachScore} reach
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-success/30 bg-success-soft p-4">
        <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-success">
          Your edge
        </div>
        <p className="mt-1.5 text-sm text-fg">{edge}</p>
      </div>
    </section>
  );
}
