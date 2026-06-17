import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EvaluationReport } from "@/components/evaluation/evaluation-report";
import { VerdictTeaser } from "@/components/evaluation/verdict-teaser";
import { IdeaCheck } from "@/components/idea-check";
import { LandingCta } from "@/components/landing-cta";
import { ThemeToggle } from "@/components/theme-toggle";
import { EXAMPLE_EVALUATION } from "@/lib/example-evaluation";

export default function Home() {
  return (
    <div className="min-h-full">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-4">
          <span className="text-sm font-semibold tracking-tight text-fg">
            Ventora Idea Check
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="https://ventora.cc"
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              Build it for real at ventora.cc
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-6 py-10 lg:py-16">
        <section className="grid w-full items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-7">
            <div className="flex flex-col gap-5">
              <Badge variant="accent" className="self-start">
                <Sparkles />
                Free idea check
              </Badge>
              <h1 className="text-display font-semibold tracking-tight text-fg">
                Find out if your startup idea is worth building.
              </h1>
              <p className="text-body text-fg-muted">
                Describe your idea in one sentence. We evaluate demand, market
                size, and willingness to pay — then preview the product Ventora
                would build for you.
              </p>
            </div>

            <IdeaCheck />
          </div>

          <div className="w-full lg:max-w-[380px] lg:justify-self-end">
            <VerdictTeaser />
          </div>
        </section>

        <div className="mt-16 flex items-center gap-4 lg:mt-24">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
            Here&apos;s a full example, start to finish
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <EvaluationReport
          mode="example"
          data={EXAMPLE_EVALUATION}
          className="mx-auto mt-6 w-full max-w-[1000px]"
        />

        <div className="mx-auto mt-12 w-full max-w-[1000px]">
          <LandingCta />
        </div>
      </main>
    </div>
  );
}
