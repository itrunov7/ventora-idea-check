"use client";

import { useState } from "react";

import { Quiz } from "@/components/quiz";
import { useIdeaFlow } from "@/components/idea-experience";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { quizAnswersToProfile, type QuizAnswers } from "@/lib/quiz";

/**
 * Idea Finder input slot: runs the short quiz, maps its answers into a
 * skills/interests profile, asks /api/find for one tailored idea, then hands it
 * to the shared flow — which runs the exact same verdict -> gate -> report
 * pipeline as Idea Check. Answers live in client state only (no account).
 */
export function FinderInput() {
  const { onIdea, pending, error } = useIdeaFlow();
  const [discovering, setDiscovering] = useState(false);
  const [discoverError, setDiscoverError] = useState<string | null>(null);
  const [foundIdea, setFoundIdea] = useState<string | null>(null);

  const busy = discovering || pending;
  const message = discoverError ?? error;

  async function handleComplete(answers: QuizAnswers) {
    if (busy) return;

    setDiscovering(true);
    setDiscoverError(null);
    setFoundIdea(null);

    try {
      const profile = quizAnswersToProfile(answers);
      const res = await fetch("/api/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!res.ok) throw new Error("find_failed");
      const data: { idea: string } = await res.json();
      setFoundIdea(data.idea);
      onIdea(data.idea);
    } catch {
      setDiscoverError("We couldn't find an idea just now. Please try again.");
    } finally {
      setDiscovering(false);
    }
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
        <Quiz
          onComplete={handleComplete}
          busy={busy}
          busyLabel={discovering ? "Finding your idea…" : "Scoring it…"}
        />
        {foundIdea && busy ? (
          <p className="text-sm text-fg">
            <span className="font-medium text-accent">We found:</span> {foundIdea}
          </p>
        ) : null}
        {message ? (
          <p className="text-sm text-fg-muted" role="alert">
            {message}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
