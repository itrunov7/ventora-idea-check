"use client";

import { useState } from "react";
import { ArrowRight, Loader2, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailGate({
  pending,
  errorCode,
  onSubmit,
}: {
  pending: boolean;
  errorCode: string | null;
  onSubmit: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);

  const valid = EMAIL_RE.test(email.trim());

  const message =
    errorCode === "rate_limited"
      ? "This email already used its free run. One report per email."
      : errorCode === "invalid_email"
        ? "That email doesn't look right."
        : errorCode
          ? "Something went wrong. Please try again."
          : touched && !valid
            ? "Enter a valid email."
            : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid || pending) return;
    onSubmit(email.trim().toLowerCase());
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-3">
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
          disabled={pending}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
        />
        <Button type="submit" className="shrink-0" disabled={pending || !valid}>
          {pending ? (
            <>
              <Loader2 className="animate-spin" />
              Building…
            </>
          ) : (
            <>
              Unlock report
              <ArrowRight />
            </>
          )}
        </Button>
      </div>
      {message ? (
        <p className="text-sm text-fg-muted" role="alert">
          {message}
        </p>
      ) : (
        <p className="text-xs text-fg-muted">
          No spam. We use this to send your report and build it for real.
        </p>
      )}
    </form>
  );
}
