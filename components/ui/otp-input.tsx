"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

const LENGTH = 6;

/**
 * Segmented 6-digit code input. Auto-advances on entry, steps back on
 * backspace, accepts a full pasted code, and fires `onComplete` when filled.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  disabled,
  invalid,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.split("").slice(0, LENGTH);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  function setAt(index: number, char: string) {
    const next = value.split("");
    next[index] = char;
    const joined = next.join("").slice(0, LENGTH);
    onChange(joined);
    return joined;
  }

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) return;
    const joined = setAt(index, digit);
    if (index < LENGTH - 1) refs.current[index + 1]?.focus();
    if (joined.length === LENGTH) {
      onComplete?.(joined);
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index]) {
        setAt(index, "");
      } else if (index > 0) {
        refs.current[index - 1]?.focus();
        setAt(index - 1, "");
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, LENGTH);
    if (!pasted) return;
    onChange(pasted);
    const target = Math.min(pasted.length, LENGTH - 1);
    refs.current[target]?.focus();
    if (pasted.length === LENGTH) onComplete?.(pasted);
  }

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-2.5">
      {Array.from({ length: LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          value={digits[i] ?? ""}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "size-12 rounded-xl border bg-surface text-center text-xl font-semibold text-fg shadow-soft-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50 sm:size-[52px]",
            invalid ? "border-danger" : "border-border",
          )}
        />
      ))}
    </div>
  );
}
