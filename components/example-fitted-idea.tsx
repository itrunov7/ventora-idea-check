import { Sparkles, Wrench } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EXAMPLE_CANDIDATE } from "@/lib/example-candidate";
import type { Candidate } from "@/lib/types";

/**
 * Static, non-interactive preview of the Idea Finder OUTCOME, shown in the
 * pre-quiz hero on `/find`. Mirrors the visual language of CandidateCard
 * (name, one-liner, "fits you" row, teaser score meters) but is clearly tagged
 * "Example" and never selectable — it sells the result before the quiz starts.
 */
export function ExampleFittedIdea({
  candidate = EXAMPLE_CANDIDATE,
}: {
  candidate?: Candidate;
}) {
  return (
    <div className="flex w-full flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-soft sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
          What you&apos;ll get
        </span>
        <Badge variant="muted">
          <span className="size-[7px] rounded-full bg-accent motion-safe:animate-pulse" />
          Example
        </Badge>
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="text-heading font-semibold tracking-tight text-fg">
          {candidate.name}
        </h3>
        <p className="text-sm text-fg-muted">{candidate.oneLiner}</p>
      </div>

      <p className="flex items-start gap-2 rounded-xl bg-muted px-3 py-2.5 text-sm text-fg">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" />
        <span>{candidate.fitsYou}</span>
      </p>

      <p className="flex items-start gap-2 text-sm text-fg-muted">
        <Wrench className="mt-0.5 size-4 shrink-0 text-fg-muted" />
        <span>{candidate.buildableInVentora}</span>
      </p>

      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <ScoreMeter label="Fit" value={candidate.teaserScores.fit} />
        <ScoreMeter
          label="Feasibility"
          value={candidate.teaserScores.feasibility}
        />
        <ScoreMeter label="Profit" value={candidate.teaserScores.profit} />
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-fg-muted">
          Teaser estimates
        </p>
      </div>
    </div>
  );
}

function ScoreMeter({ label, value }: { label: string; value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-xs font-medium text-fg-muted">
        {label}
      </span>
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
        <span
          className="block h-full rounded-full bg-accent"
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="w-8 shrink-0 text-right font-mono text-xs text-fg">
        {pct}
      </span>
    </div>
  );
}
