import { Sparkles } from "lucide-react";

import { CheckInput } from "@/components/check-input";
import { EvaluationReport } from "@/components/evaluation/evaluation-report";
import { VerdictTeaser } from "@/components/evaluation/verdict-teaser";
import { IdeaExperience } from "@/components/idea-experience";
import { LandingCta } from "@/components/landing-cta";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { EXAMPLE_EVALUATION } from "@/lib/example-evaluation";

export default function CheckPage() {
  return (
    <div className="min-h-full">
      <SiteHeader active="check" />

      <main className="mx-auto max-w-[1100px] px-6 py-10 lg:py-16">
        <IdeaExperience
          source="check"
          compactLabel="Your idea check"
          input={<CheckInput />}
          aside={<VerdictTeaser />}
          hero={{
            badge: (
              <Badge variant="accent" className="self-start">
                <Sparkles />
                Free idea check
              </Badge>
            ),
            title: "Find out if your startup idea is worth building.",
            description:
              "Describe your idea in one sentence. We evaluate demand, market size, and willingness to pay — then preview the product Ventora would build for you.",
          }}
        >
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
