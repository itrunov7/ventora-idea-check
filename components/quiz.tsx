"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  QUIZ_QUESTIONS,
  type QuizAnswers,
  type QuizQuestion,
} from "@/lib/quiz";
import { cn } from "@/lib/utils";

/**
 * Data-driven Idea Finder quiz. Renders {@link QUIZ_QUESTIONS} one step at a
 * time, keeping every answer in client state so back/next is lossless. On the
 * final step it hands the full answer map to `onComplete`.
 *
 * Mobile-first: single column, >= 48px tap targets, controls reachable with a
 * thumb. Works down to 380px.
 */
export function Quiz({
  onComplete,
  busy = false,
  busyLabel,
}: {
  onComplete: (answers: QuizAnswers) => void;
  /** True while the parent resolves the idea; locks the final action. */
  busy?: boolean;
  /** Label shown on the final action while busy. */
  busyLabel?: string;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});

  const total = QUIZ_QUESTIONS.length;
  const question = QUIZ_QUESTIONS[stepIndex];
  const isLast = stepIndex === total - 1;

  const prevHint = useMemo(() => {
    if (stepIndex === 0) return null;
    const prev = QUIZ_QUESTIONS[stepIndex - 1];
    return isAnswered(prev, answers[prev.id]) ? (prev.hint ?? null) : null;
  }, [stepIndex, answers]);

  const current = answers[question.id];
  const answered = isAnswered(question, current);
  const canAdvance = question.kind === "shorttext" ? true : answered;

  function setAnswer(value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  }

  function goNext() {
    if (isLast) {
      onComplete(answers);
      return;
    }
    setStepIndex((i) => Math.min(i + 1, total - 1));
  }

  function goBack() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  function handleSingleSelect(value: string) {
    setAnswer(value);
    if (!isLast) {
      // Tiny delay so the selected state is visible before advancing.
      window.setTimeout(() => setStepIndex((i) => Math.min(i + 1, total - 1)), 160);
    }
  }

  function handleMultiToggle(value: string) {
    const selected = Array.isArray(current) ? current : [];
    const has = selected.includes(value);
    if (has) {
      setAnswer(selected.filter((v) => v !== value));
      return;
    }
    const cap = question.maxSelect ?? Infinity;
    if (selected.length >= cap) return;
    setAnswer([...selected, value]);
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <ProgressBar step={stepIndex} total={total} />

      <div className="flex flex-col gap-1.5">
        <h2 className="text-heading font-semibold tracking-tight text-fg">
          {question.prompt}
        </h2>
        {question.subPrompt ? (
          <p className="text-sm text-fg-muted">{question.subPrompt}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        {question.kind === "single" ? (
          <ChipGrid>
            {question.options?.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                selected={current === opt.value}
                onClick={() => handleSingleSelect(opt.value)}
                disabled={busy}
              />
            ))}
          </ChipGrid>
        ) : null}

        {question.kind === "multi" ? (
          <ChipGrid>
            {question.options?.map((opt) => {
              const selected =
                Array.isArray(current) && current.includes(opt.value);
              const cap = question.maxSelect ?? Infinity;
              const atCap = Array.isArray(current) && current.length >= cap;
              return (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  selected={!!selected}
                  showCheck
                  onClick={() => handleMultiToggle(opt.value)}
                  disabled={busy || (!selected && atCap)}
                />
              );
            })}
          </ChipGrid>
        ) : null}

        {question.kind === "shorttext" ? (
          <Input
            className="h-12 text-base"
            placeholder={question.placeholder ?? "One short phrase…"}
            aria-label={question.prompt}
            value={typeof current === "string" ? current : ""}
            disabled={busy}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canAdvance) goNext();
            }}
          />
        ) : null}
      </div>

      {prevHint ? (
        <p
          className="flex items-start gap-2 rounded-2xl bg-muted px-4 py-3 text-sm text-fg"
          aria-live="polite"
        >
          <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" />
          <span>{prevHint}</span>
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        {stepIndex > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={goBack}
            disabled={busy}
            className="px-4"
          >
            <ArrowLeft />
            Back
          </Button>
        ) : null}

        <Button
          type="button"
          size="lg"
          onClick={goNext}
          disabled={!canAdvance || busy}
          className="flex-1"
        >
          {busy && isLast ? (
            <>
              <Loader2 className="animate-spin" />
              {busyLabel ?? "Working…"}
            </>
          ) : isLast ? (
            <>
              <Sparkles />
              Find my idea
              <ArrowRight />
            </>
          ) : (
            <>
              Continue
              <ArrowRight />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
          Step {step + 1} of {total}
        </span>
        <span className="font-mono text-[11px] text-fg-muted">
          ~{Math.max(1, total - step) * 12}s left
        </span>
      </div>
      <div className="flex gap-1.5" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={total}>
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i <= step ? "bg-accent" : "bg-border",
            )}
          />
        ))}
      </div>
    </div>
  );
}

function ChipGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">{children}</div>;
}

function Chip({
  label,
  selected,
  onClick,
  disabled,
  showCheck = false,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  showCheck?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "flex min-h-12 w-full items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-left text-base font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        "disabled:cursor-not-allowed disabled:opacity-40",
        selected
          ? "border-accent bg-accent/10 text-fg"
          : "border-border bg-surface text-fg hover:bg-muted",
      )}
    >
      <span>{label}</span>
      {showCheck ? (
        <span
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
            selected
              ? "border-accent bg-accent text-accent-fg"
              : "border-border bg-transparent text-transparent",
          )}
        >
          <Check className="size-3.5" />
        </span>
      ) : null}
    </button>
  );
}

function isAnswered(
  question: QuizQuestion,
  value: string | string[] | undefined,
): boolean {
  if (value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  return value.trim().length > 0;
}
