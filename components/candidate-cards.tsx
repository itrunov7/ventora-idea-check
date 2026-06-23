"use client";

import { ArrowRight, Loader2, Sparkles, Wrench } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Candidate } from "@/lib/types";

/**
 * Free, pre-gate candidate picker (Phase F2). Renders the 2-3 fitted ideas as
 * selectable cards so the user gains ownership by choosing. Picking one calls
 * `onSelect`, which hands the idea to the shared verdict pipeline.
 */
export function CandidateCards({
  candidates,
  onSelect,
  selectedId,
  busy = false,
}: {
  candidates: Candidate[];
  onSelect: (candidate: Candidate) => void;
  /** Id of the card the user just picked (locks the grid while it loads). */
  selectedId?: string | null;
  busy?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-heading font-semibold tracking-tight text-fg">
          Three ideas, built around you
        </h2>
        <p className="text-sm text-fg-muted">
          Pick the one that excites you most — we&apos;ll score it next.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            onSelect={() => onSelect(candidate)}
            loading={busy && selectedId === candidate.id}
            disabled={busy}
          />
        ))}
      </div>
    </div>
  );
}

function CandidateCard({
  candidate,
  onSelect,
  loading,
  disabled,
}: {
  candidate: Candidate;
  onSelect: () => void;
  loading: boolean;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "group flex w-full flex-col gap-4 rounded-2xl border border-border bg-surface p-5 text-left shadow-soft transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        "hover:border-accent hover:bg-accent/5",
        "disabled:cursor-not-allowed disabled:opacity-60",
      )}
    >
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

      <div className="flex flex-col gap-2">
        <ScoreMeter label="Fit" value={candidate.teaserScores.fit} />
        <ScoreMeter
          label="Feasibility"
          value={candidate.teaserScores.feasibility}
        />
        <ScoreMeter label="Profit" value={candidate.teaserScores.profit} />
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-fg-muted">
          Estimates
        </p>
      </div>

      <span className="inline-flex items-center gap-2 text-sm font-medium text-accent">
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Scoring it…
          </>
        ) : (
          <>
            Choose this idea
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </span>
    </button>
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
          className="block h-full rounded-full bg-accent transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="w-8 shrink-0 text-right font-mono text-xs text-fg">
        {pct}
      </span>
    </div>
  );
}
