import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { EvaluationReport } from "@/components/evaluation/evaluation-report";
import { IdeaExperience } from "@/components/idea-experience";
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
        <IdeaExperience>
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
        </IdeaExperience>
      </main>
    </div>
  );
}
