"use client";

import { useState } from "react";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";

import { useIdeaFlow } from "@/components/idea-experience";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

/**
 * Idea Finder input slot: collects a short skills/interests profile, asks
 * /api/find for one tailored idea, then hands it to the shared flow — which
 * runs the exact same verdict -> gate -> report pipeline as Idea Check.
 */
export function FinderInput() {
  const { onIdea, pending, error } = useIdeaFlow();
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [constraints, setConstraints] = useState("");
  const [discovering, setDiscovering] = useState(false);
  const [discoverError, setDiscoverError] = useState<string | null>(null);
  const [foundIdea, setFoundIdea] = useState<string | null>(null);

  const busy = discovering || pending;
  const canSubmit =
    skills.trim().length >= 3 && interests.trim().length >= 3 && !busy;
  const message = discoverError ?? error;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setDiscovering(true);
    setDiscoverError(null);
    setFoundIdea(null);

    try {
      const res = await fetch("/api/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: skills.trim(),
          interests: interests.trim(),
          constraints: constraints.trim() || undefined,
        }),
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
        <CardTitle>Tell us about you</CardTitle>
        <CardDescription>
          No idea required. Your skills and interests are enough.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            className="h-12 text-base"
            placeholder="Your skills — e.g. design, sales, Python, cooking"
            aria-label="Your skills"
            value={skills}
            disabled={busy}
            onChange={(e) => setSkills(e.target.value)}
          />
          <Input
            className="h-12 text-base"
            placeholder="Your interests — e.g. fitness, small businesses, travel"
            aria-label="Your interests"
            value={interests}
            disabled={busy}
            onChange={(e) => setInterests(e.target.value)}
          />
          <Input
            className="h-12 text-base"
            placeholder="Constraints (optional) — e.g. solo, nights & weekends"
            aria-label="Constraints (optional)"
            value={constraints}
            disabled={busy}
            onChange={(e) => setConstraints(e.target.value)}
          />
          <Button type="submit" size="lg" disabled={!canSubmit}>
            {discovering ? (
              <>
                <Loader2 className="animate-spin" />
                Finding your idea…
              </>
            ) : pending ? (
              <>
                <Loader2 className="animate-spin" />
                Scoring it…
              </>
            ) : (
              <>
                <Sparkles />
                Find my idea
                <ArrowRight />
              </>
            )}
          </Button>
        </form>
        <p className="font-mono text-[12px] text-fg-muted">
          Free · instant · no signup to start
        </p>
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
