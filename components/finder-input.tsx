"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";

import { CandidateCards } from "@/components/candidate-cards";
import { Quiz } from "@/components/quiz";
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
import type { Candidate } from "@/lib/types";

/**
 * Idea Finder input slot: runs the short quiz, asks /api/candidates for 2-3
 * fitted ideas, and renders them as selectable cards (free, pre-gate). Picking
 * a card hands its idea to the shared verdict -> gate -> report pipeline. All
 * client state, no account.
 */
export function FinderInput() {
  const { onIdea, pending, error } = useIdeaFlow();
  const [discovering, setDiscovering] = useState(false);
  const [discoverError, setDiscoverError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const busy = discovering || pending;
  const message = discoverError ?? error;

  async function handleComplete(answers: QuizAnswers) {
    if (busy) return;

    setDiscovering(true);
    setDiscoverError(null);
    setCandidates(null);
    setSelectedId(null);

    try {
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
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
    if (pending) return;
    setSelectedId(candidate.id);
    onIdea(`${candidate.name} — ${candidate.oneLiner}`);
  }

  function handleStartOver() {
    if (busy) return;
    setCandidates(null);
    setSelectedId(null);
    setDiscoverError(null);
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
        {candidates ? (
          <>
            <CandidateCards
              candidates={candidates}
              onSelect={handleSelect}
              selectedId={selectedId}
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
        {message ? (
          <p className="text-sm text-fg-muted" role="alert">
            {message}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
