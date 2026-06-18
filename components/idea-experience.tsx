"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, Sparkles } from "lucide-react";

import { EvaluationReport } from "@/components/evaluation/evaluation-report";
import { VerdictTeaser } from "@/components/evaluation/verdict-teaser";
import { IdeaInputCard } from "@/components/idea-check";
import { ReportGate } from "@/components/report-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VerdictCard, VerdictSkeleton } from "@/components/verdict-card";
import type { Evaluation, Verdict } from "@/lib/types";

type Phase = "idle" | "checking" | "verdict" | "unlocked";

export function IdeaExperience({ children }: { children?: React.ReactNode }) {
  const [idea, setIdea] = useState("");
  const [submittedIdea, setSubmittedIdea] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);
  const hasResult = phase === "verdict" || phase === "unlocked";

  useEffect(() => {
    if (!hasResult) return;
    const el = resultRef.current;
    if (!el) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  }, [hasResult, phase]);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    const value = idea.trim();
    if (value.length < 8 || phase === "checking") return;

    setPhase("checking");
    setCheckError(null);
    setVerdict(null);
    setEvaluation(null);
    setUnlockError(null);

    try {
      const res = await fetch("/api/verdict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: value }),
      });
      if (!res.ok) throw new Error("verdict_failed");
      const data: { verdict: Verdict } = await res.json();
      setVerdict(data.verdict);
      setSubmittedIdea(value);
      setPhase("verdict");
    } catch {
      setCheckError("We couldn't score that idea. Please try again.");
      setPhase("idle");
    }
  }

  async function handleUnlock(email: string) {
    if (!verdict) return;
    setUnlocking(true);
    setUnlockError(null);

    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, idea: submittedIdea, verdict }),
      });

      if (res.ok) {
        const data: { evaluation: Evaluation } = await res.json();
        setEvaluation(data.evaluation);
        setPhase("unlocked");
        return;
      }

      const data: { error?: string } = await res.json().catch(() => ({}));
      setUnlockError(data.error ?? "generation_failed");
    } catch {
      setUnlockError("generation_failed");
    } finally {
      setUnlocking(false);
    }
  }

  const reset = useCallback(() => {
    setPhase("idle");
    setVerdict(null);
    setEvaluation(null);
    setUnlockError(null);
    setCheckError(null);
    setIdea("");
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, []);

  if (hasResult) {
    return (
      <div ref={resultRef} className="flex flex-col">
        <CompactHeader idea={submittedIdea} onReset={reset} />

        {phase === "unlocked" && evaluation ? (
          <EvaluationReport
            mode="report"
            data={evaluation}
            className="mx-auto mt-2 w-full max-w-[1000px]"
          />
        ) : verdict ? (
          <div className="mx-auto mt-2 flex w-full max-w-[860px] flex-col gap-8">
            <VerdictCard verdict={verdict} />
            <ReportGate
              pending={unlocking}
              errorCode={unlockError}
              onUnlock={handleUnlock}
            />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <section className="grid w-full items-center gap-10 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-7">
          <div className="flex flex-col gap-5">
            <Badge variant="accent" className="self-start">
              <Sparkles />
              Free idea check
            </Badge>
            <h1 className="text-display font-semibold tracking-tight text-fg">
              Find out if your startup idea is worth building.
            </h1>
            <p className="text-body text-fg-muted">
              Describe your idea in one sentence. We evaluate demand, market
              size, and willingness to pay — then preview the product Ventora
              would build for you.
            </p>
          </div>

          <div className="flex w-full max-w-2xl flex-col gap-8">
            <IdeaInputCard
              idea={idea}
              onIdeaChange={setIdea}
              onSubmit={handleCheck}
              pending={phase === "checking"}
              error={checkError}
              className="w-full"
            />
            {phase === "checking" ? <VerdictSkeleton /> : null}
          </div>
        </div>

        <div className="w-full lg:max-w-[380px] lg:justify-self-end">
          <VerdictTeaser />
        </div>
      </section>

      {children}
    </>
  );
}

function CompactHeader({
  idea,
  onReset,
}: {
  idea: string;
  onReset: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
          Your idea check
        </span>
        <p className="truncate text-sm text-fg-muted">{idea}</p>
      </div>
      <Button
        variant="secondary"
        size="sm"
        className="shrink-0 self-start sm:self-auto"
        onClick={onReset}
      >
        <RotateCcw />
        Check another idea
      </Button>
    </div>
  );
}
