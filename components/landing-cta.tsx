"use client";

import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LandingCta() {
  function focusInput() {
    const input = document.getElementById("idea-input");
    if (!input) return;
    input.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => (input as HTMLInputElement).focus(), 450);
  }

  return (
    <section className="flex flex-col items-center gap-5 rounded-2xl border border-border bg-surface px-6 py-12 text-center shadow-soft">
      <h2 className="max-w-[24ch] text-[clamp(22px,3.2vw,30px)] font-semibold tracking-tight text-fg">
        Your idea deserves the same read.
      </h2>
      <p className="max-w-[46ch] text-body text-fg-muted">
        Run yours in one sentence and get a full report like this — free, in
        seconds.
      </p>
      <Button size="lg" onClick={focusInput}>
        Check my idea
        <ArrowUp />
      </Button>
    </section>
  );
}
