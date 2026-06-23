"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Lock, MailCheck } from "lucide-react";

import { OtpInput } from "@/components/ui/otp-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_COOLDOWN_S = 30;

function errorMessage(code: string | null): string | null {
  switch (code) {
    case null:
      return null;
    case "code_invalid":
      return "That code isn't right. Check it and try again.";
    case "code_expired":
      return "That code expired. Send a fresh one.";
    case "too_many_attempts":
      return "Too many tries. Request a new code.";
    case "cooldown":
      return "Hang on a sec before requesting another code.";
    case "rate_limited":
      return "Too many codes requested. Try again in a bit.";
    case "weekly_limit":
      return "You've used all 3 reports this week. Try again in a few days.";
    case "invalid_email":
      return "That email doesn't look right.";
    case "send_failed":
      return "We couldn't send the code right now. Try again in a moment.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export function VerifyGate({
  codeSent,
  codeSentAt,
  requesting,
  verifying,
  errorCode,
  onRequestCode,
  onVerify,
  onChangeEmail,
}: {
  codeSent: boolean;
  codeSentAt: number | null;
  requesting: boolean;
  verifying: boolean;
  errorCode: string | null;
  onRequestCode: (email: string) => void;
  onVerify: (email: string, code: string) => void;
  onChangeEmail: () => void;
}) {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [code, setCode] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const submittedRef = useRef<string | null>(null);

  const validEmail = EMAIL_RE.test(email.trim());
  const message = errorMessage(errorCode);
  const codeError =
    errorCode === "code_invalid" ||
    errorCode === "code_expired" ||
    errorCode === "too_many_attempts";

  const cooldown = codeSentAt
    ? Math.max(
        0,
        RESEND_COOLDOWN_S - Math.floor((now - codeSentAt) / 1000),
      )
    : 0;

  // Tick once a second while a cooldown is counting down.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // Let the user retry after a rejected code (ref write, not render state).
  useEffect(() => {
    if (codeError) submittedRef.current = null;
  }, [codeError]);

  function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!validEmail || requesting) return;
    onRequestCode(email.trim().toLowerCase());
  }

  function handleComplete(value: string) {
    if (verifying || submittedRef.current === value) return;
    submittedRef.current = value;
    onVerify(email.trim().toLowerCase(), value);
  }

  function resend() {
    if (cooldown > 0 || requesting) return;
    setCode("");
    submittedRef.current = null;
    onRequestCode(email.trim().toLowerCase());
  }

  if (!codeSent) {
    return (
      <form
        onSubmit={submitEmail}
        className="flex w-full max-w-md flex-col gap-3"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-fg">
          <Lock className="size-4 text-accent" />
          Unlock your full report + product preview
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@startup.com"
            aria-label="Your email"
            aria-invalid={message ? true : undefined}
            value={email}
            disabled={requesting}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
          />
          <Button
            type="submit"
            className="shrink-0"
            disabled={requesting || !validEmail}
          >
            {requesting ? (
              <>
                <Loader2 className="animate-spin" />
                Sending…
              </>
            ) : (
              <>
                Email me a code
                <ArrowRight />
              </>
            )}
          </Button>
        </div>
        {message ? (
          <p className="text-sm text-fg-muted" role="alert">
            {message}
          </p>
        ) : touched && !validEmail ? (
          <p className="text-sm text-fg-muted" role="alert">
            Enter a valid email.
          </p>
        ) : (
          <p className="text-xs text-fg-muted">
            We email a 6-digit code to confirm it&apos;s really you. No spam.
          </p>
        )}
      </form>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-accent-soft text-accent">
        <MailCheck className="size-5" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-fg">Enter your code</p>
        <p className="text-sm text-fg-muted">
          We sent a 6-digit code to <span className="text-fg">{email}</span>
        </p>
      </div>

      <OtpInput
        value={code}
        onChange={setCode}
        onComplete={handleComplete}
        disabled={verifying}
        invalid={codeError}
        autoFocus
      />

      {verifying ? (
        <p className="flex items-center gap-2 text-sm text-fg-muted">
          <Loader2 className="size-4 animate-spin" />
          Verifying and building your report…
        </p>
      ) : message ? (
        <p className="text-sm text-danger" role="alert">
          {message}
        </p>
      ) : null}

      <div className="flex items-center gap-3 text-sm">
        <button
          type="button"
          onClick={resend}
          disabled={cooldown > 0 || requesting}
          className="font-medium text-accent transition-colors hover:text-accent-hover disabled:text-fg-muted disabled:hover:text-fg-muted"
        >
          {requesting
            ? "Sending…"
            : cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Resend code"}
        </button>
        <span className="h-3 w-px bg-border" />
        <button
          type="button"
          onClick={() => {
            setCode("");
            setTouched(false);
            submittedRef.current = null;
            onChangeEmail();
          }}
          className="inline-flex items-center gap-1 font-medium text-fg-muted transition-colors hover:text-fg"
        >
          <ArrowLeft className="size-3.5" />
          Change email
        </button>
      </div>
    </div>
  );
}
