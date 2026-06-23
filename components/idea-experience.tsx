"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { RotateCcw } from "lucide-react";

import { EvaluationReport } from "@/components/evaluation/evaluation-report";
import { ReportGate } from "@/components/report-gate";
import { Button } from "@/components/ui/button";
import { VerdictCard, VerdictSkeleton } from "@/components/verdict-card";
import type { Evaluation, Verdict } from "@/lib/types";

type Phase = "idle" | "checking" | "verdict" | "unlocked";

/** Funnel the experience belongs to — persisted on the lead for attribution. */
export type IdeaSource = "check" | "find";

/**
 * Shared state the funnel-specific input slot needs to drive the pipeline.
 * Consumed via {@link useIdeaFlow} so server-rendered pages can hand the engine
 * a client input element without passing a function across the RSC boundary.
 */
type IdeaFlowValue = {
  /** Hand a resolved idea string to the shared verdict -> gate -> report flow. */
  onIdea: (idea: string) => void;
  /** True while the verdict request is in flight. */
  pending: boolean;
  /** Verdict-stage error message, if any. */
  error: string | null;
};

const IdeaFlowContext = createContext<IdeaFlowValue | null>(null);

export function useIdeaFlow(): IdeaFlowValue {
  const ctx = useContext(IdeaFlowContext);
  if (!ctx) {
    throw new Error("useIdeaFlow must be used within <IdeaExperience>");
  }
  return ctx;
}

export type IdeaHero = {
  badge: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
};

export function IdeaExperience({
  source,
  hero,
  input,
  aside,
  compactLabel = "Your idea check",
  children,
}: {
  source: IdeaSource;
  hero: IdeaHero;
  /** Funnel-specific input element. Reads state via {@link useIdeaFlow}. */
  input: React.ReactNode;
  /** Optional right-column teaser. */
  aside?: React.ReactNode;
  /** Eyebrow label shown above the submitted idea after a check. */
  compactLabel?: string;
  children?: React.ReactNode;
}) {
  const [submittedIdea, setSubmittedIdea] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [codeSentAt, setCodeSentAt] = useState<number | null>(null);
  const [requestingCode, setRequestingCode] = useState(false);
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

  const handleIdea = useCallback(
    async (rawIdea: string) => {
      const value = rawIdea.trim();
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
    },
    [phase],
  );

  async function handleRequestCode(email: string) {
    setRequestingCode(true);
    setUnlockError(null);

    try {
      const res = await fetch("/api/unlock/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setCodeSent(true);
        setCodeSentAt(Date.now());
        return;
      }

      const data: { error?: string } = await res.json().catch(() => ({}));
      setUnlockError(data.error ?? "send_failed");
    } catch {
      setUnlockError("send_failed");
    } finally {
      setRequestingCode(false);
    }
  }

  async function handleVerify(email: string, code: string) {
    if (!verdict) return;
    setUnlocking(true);
    setUnlockError(null);

    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code,
          idea: submittedIdea,
          verdict,
          source,
        }),
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

  function handleChangeEmail() {
    setCodeSent(false);
    setCodeSentAt(null);
    setUnlockError(null);
  }

  const reset = useCallback(() => {
    setPhase("idle");
    setVerdict(null);
    setEvaluation(null);
    setUnlockError(null);
    setCheckError(null);
    setCodeSent(false);
    setCodeSentAt(null);
    setRequestingCode(false);
    setUnlocking(false);
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, []);

  if (hasResult) {
    return (
      <div ref={resultRef} className="flex flex-col">
        <CompactHeader
          idea={submittedIdea}
          label={compactLabel}
          onReset={reset}
        />

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
              codeSent={codeSent}
              codeSentAt={codeSentAt}
              requesting={requestingCode}
              verifying={unlocking}
              errorCode={unlockError}
              onRequestCode={handleRequestCode}
              onVerify={handleVerify}
              onChangeEmail={handleChangeEmail}
            />
          </div>
        ) : null}
      </div>
    );
  }

  const flowValue: IdeaFlowValue = {
    onIdea: handleIdea,
    pending: phase === "checking",
    error: checkError,
  };

  return (
    <IdeaFlowContext.Provider value={flowValue}>
      <section className="grid w-full items-center gap-10 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-7">
          <div className="flex flex-col gap-5">
            {hero.badge}
            <h1 className="text-display font-semibold tracking-tight text-fg">
              {hero.title}
            </h1>
            <p className="text-body text-fg-muted">{hero.description}</p>
          </div>

          <div className="flex w-full max-w-2xl flex-col gap-8">
            {input}
            {phase === "checking" ? <VerdictSkeleton /> : null}
          </div>
        </div>

        {aside ? (
          <div className="w-full lg:max-w-[380px] lg:justify-self-end">
            {aside}
          </div>
        ) : null}
      </section>

      {children}
    </IdeaFlowContext.Provider>
  );
}

function CompactHeader({
  idea,
  label,
  onReset,
}: {
  idea: string;
  label: string;
  onReset: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
          {label}
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
