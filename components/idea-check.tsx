"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

import { AdvancedReport } from "@/components/advanced-report";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { VerdictCard, VerdictSkeleton } from "@/components/verdict-card";
import type { AdvancedReport as AdvancedReportData, Verdict } from "@/lib/types";

type Phase = "idle" | "checking" | "verdict" | "unlocked";

export function IdeaCheck() {
  const [idea, setIdea] = useState("");
  const [submittedIdea, setSubmittedIdea] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [report, setReport] = useState<AdvancedReportData | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const canSubmit = idea.trim().length >= 8 && phase !== "checking";

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    const value = idea.trim();
    setPhase("checking");
    setCheckError(null);
    setVerdict(null);
    setReport(null);
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
        const data: { report: AdvancedReportData } = await res.json();
        setReport(data.report);
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

  return (
    <div className="flex w-full max-w-2xl flex-col gap-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Describe your idea</CardTitle>
          <CardDescription>
            No business plan. No technical details. Just one sentence.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <form onSubmit={handleCheck} className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="An app that helps freelancers track invoices"
              aria-label="Your startup idea"
              value={idea}
              disabled={phase === "checking"}
              onChange={(e) => setIdea(e.target.value)}
            />
            <Button type="submit" className="shrink-0" disabled={!canSubmit}>
              {phase === "checking" ? (
                <>
                  <Loader2 className="animate-spin" />
                  Checking…
                </>
              ) : (
                <>
                  Check my idea
                  <ArrowRight />
                </>
              )}
            </Button>
          </form>
          {checkError ? (
            <p className="text-sm text-fg-muted" role="alert">
              {checkError}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {phase === "checking" ? <VerdictSkeleton /> : null}

      {verdict && phase !== "checking" ? (
        <>
          <VerdictCard verdict={verdict} />
          <AdvancedReport
            idea={submittedIdea}
            report={report}
            pending={unlocking}
            errorCode={unlockError}
            onUnlock={handleUnlock}
          />
        </>
      ) : null}
    </div>
  );
}
