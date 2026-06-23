"use client";

import {
  ArrowRight,
  ChevronLeft,
  Crosshair,
  Loader2,
  Maximize2,
  Shuffle,
  Sparkles,
  Wrench,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Candidate, RefineDirection } from "@/lib/types";

const REFINE_OPTIONS: {
  direction: RefineDirection;
  label: string;
  icon: typeof Crosshair;
}[] = [
  { direction: "niche", label: "More niche", icon: Crosshair },
  { direction: "broader", label: "Broader", icon: Maximize2 },
  { direction: "different", label: "Different angle", icon: Shuffle },
];

/**
 * Phase F3 ownership step: once a candidate is picked, the user can edit the
 * one-liner and nudge the idea in one direction (niche / broader / different
 * angle) — each a single regenerate that stays within their quiz fit profile —
 * before locking it into the verdict pipeline. Picking already happened, so this
 * shows the "✓ your idea" affordance.
 */
export function RefineIdea({
  candidate,
  oneLiner,
  onOneLinerChange,
  onRefine,
  onLock,
  onBack,
  refining,
  busy = false,
  error,
}: {
  candidate: Candidate;
  /** Editable draft one-liner (controlled by the parent). */
  oneLiner: string;
  onOneLinerChange: (value: string) => void;
  onRefine: (direction: RefineDirection) => void;
  onLock: () => void;
  onBack: () => void;
  /** Direction currently regenerating, if any. */
  refining: RefineDirection | null;
  busy?: boolean;
  error?: string | null;
}) {
  const canLock = oneLiner.trim().length >= 4;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          disabled={busy}
          className="-ml-1 px-2 text-fg-muted"
        >
          <ChevronLeft />
          Back to ideas
        </Button>
        <Badge variant="success">
          <Sparkles />
          Your idea
        </Badge>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-accent/40 bg-surface p-5 shadow-soft">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-heading font-semibold tracking-tight text-fg">
            {candidate.name}
          </h2>
          <p className="text-sm text-fg-muted">
            Make it yours — tweak the one-liner or nudge the angle, then lock it
            in.
          </p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-fg-muted">
            Your one-liner
          </span>
          <Input
            value={oneLiner}
            onChange={(e) => onOneLinerChange(e.target.value)}
            maxLength={120}
            disabled={busy}
            placeholder="One punchy sentence on what it is"
            aria-label="Editable idea one-liner"
          />
        </label>

        <p className="flex items-start gap-2 rounded-xl bg-muted px-3 py-2.5 text-sm text-fg">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" />
          <span>{candidate.fitsYou}</span>
        </p>

        <p className="flex items-start gap-2 text-sm text-fg-muted">
          <Wrench className="mt-0.5 size-4 shrink-0 text-fg-muted" />
          <span>{candidate.buildableInVentora}</span>
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-fg-muted">
          Make it more…
        </span>
        <div className="flex flex-wrap gap-2">
          {REFINE_OPTIONS.map(({ direction, label, icon: Icon }) => {
            const loading = refining === direction;
            return (
              <Button
                key={direction}
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onRefine(direction)}
                disabled={busy}
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Icon />
                )}
                {label}
              </Button>
            );
          })}
        </div>
      </div>

      <Button
        type="button"
        size="lg"
        onClick={onLock}
        disabled={busy || !canLock}
        className="self-start"
      >
        {busy && refining === null ? (
          <>
            <Loader2 className="animate-spin" />
            Scoring it…
          </>
        ) : (
          <>
            Lock it in &amp; check
            <ArrowRight />
          </>
        )}
      </Button>

      {error ? (
        <p className="text-sm text-fg-muted" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
