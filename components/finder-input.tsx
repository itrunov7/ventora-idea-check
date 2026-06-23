"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";

import { CandidateCards } from "@/components/candidate-cards";
import { Quiz } from "@/components/quiz";
import { RefineIdea } from "@/components/refine-idea";
import { useIdeaFlow } from "@/components/idea-experience";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type QuizAnswers } from "@/lib/quiz";
import type { Candidate, RefineDirection } from "@/lib/types";

/**
 * Idea Finder input slot: runs the short quiz, asks /api/candidates for 2-3
 * fitted ideas, and renders them as selectable cards (free, pre-gate). Picking
 * a card opens the Phase F3 refine step where the user can edit the one-liner
 * and nudge the angle (one regenerate, within their fit) before locking the
 * idea into the shared verdict -> gate -> report pipeline. All client state,
 * no account.
 */
export function FinderInput() {
  const { onIdea, pending, error } = useIdeaFlow();
  const [discovering, setDiscovering] = useState(false);
  const [discoverError, setDiscoverError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<QuizAnswers | null>(null);
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [draftOneLiner, setDraftOneLiner] = useState("");
  const [refining, setRefining] = useState<RefineDirection | null>(null);
  const [refineError, setRefineError] = useState<string | null>(null);

  const busy = discovering || pending || refining !== null;
  const message = discoverError ?? error;

  async function handleComplete(quizAnswers: QuizAnswers) {
    if (busy) return;

    setDiscovering(true);
    setDiscoverError(null);
    setCandidates(null);
    setSelected(null);
    // Keep the answers around so refine stays within the fit profile and the
    // quiz never has to be retaken.
    setAnswers(quizAnswers);

    try {
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quizAnswers),
      });

      if (!res.ok) throw new Error("candidates_failed");
      const data: { candidates: Candidate[] } = await res.json();
      setCandidates(data.candidates);
    } catch {
      setDiscoverError("We couldn't find ideas just now. Please try again.");
    } finally {
      setDiscovering(false);
    }
  }

  function handleSelect(candidate: Candidate) {
    if (busy) return;
    // Picking no longer fires the verdict — it opens the refine/ownership step.
    setSelected(candidate);
    setDraftOneLiner(candidate.oneLiner);
    setRefineError(null);
  }

  async function handleRefine(direction: RefineDirection) {
    if (busy || !selected || !answers) return;

    setRefining(direction);
    setRefineError(null);

    try {
      const res = await fetch("/api/candidates/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          candidate: {
            name: selected.name,
            oneLiner: draftOneLiner,
            fitsYou: selected.fitsYou,
            buildableInVentora: selected.buildableInVentora,
          },
          direction,
        }),
      });

      if (!res.ok) throw new Error("refine_failed");
      const data: { candidate: Candidate } = await res.json();
      setSelected(data.candidate);
      setDraftOneLiner(data.candidate.oneLiner);
    } catch {
      setRefineError("We couldn't refine that just now. Please try again.");
    } finally {
      setRefining(null);
    }
  }

  function handleLock() {
    if (busy || !selected) return;
    const oneLiner = draftOneLiner.trim();
    if (oneLiner.length < 4) return;
    onIdea(`${selected.name} — ${oneLiner}`);
  }

  function handleBackToIdeas() {
    if (busy) return;
    setSelected(null);
    setRefineError(null);
  }

  function handleStartOver() {
    if (busy) return;
    setCandidates(null);
    setSelected(null);
    setAnswers(null);
    setDiscoverError(null);
    setRefineError(null);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Find your idea</CardTitle>
        <CardDescription>
          A few quick taps — no idea required, no signup to start.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {selected ? (
          <RefineIdea
            candidate={selected}
            oneLiner={draftOneLiner}
            onOneLinerChange={setDraftOneLiner}
            onRefine={handleRefine}
            onLock={handleLock}
            onBack={handleBackToIdeas}
            refining={refining}
            busy={busy}
            error={refineError ?? error}
          />
        ) : candidates ? (
          <>
            <CandidateCards
              candidates={candidates}
              onSelect={handleSelect}
              busy={busy}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleStartOver}
              disabled={busy}
              className="self-start px-3"
            >
              <RotateCcw />
              Start over
            </Button>
          </>
        ) : (
          <Quiz
            onComplete={handleComplete}
            busy={busy}
            busyLabel="Finding your ideas…"
          />
        )}
        {!selected && message ? (
          <p className="text-sm text-fg-muted" role="alert">
            {message}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
