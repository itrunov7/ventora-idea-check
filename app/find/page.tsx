import { Compass } from "lucide-react";

import { EvaluationReport } from "@/components/evaluation/evaluation-report";
import { VerdictTeaser } from "@/components/evaluation/verdict-teaser";
import { FinderInput } from "@/components/finder-input";
import { IdeaExperience } from "@/components/idea-experience";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { EXAMPLE_EVALUATION } from "@/lib/example-evaluation";

export default function FindPage() {
  return (
    <div className="min-h-full">
      <SiteHeader active="find" />

      <main className="mx-auto max-w-[1100px] px-6 py-10 lg:py-16">
        <IdeaExperience
          source="find"
          compactLabel="Your idea finder"
          input={<FinderInput />}
          aside={<VerdictTeaser />}
          hero={{
            badge: (
              <Badge variant="accent" className="self-start">
                <Compass />
                Free idea finder
              </Badge>
            ),
            title: "Don't have an idea yet? We'll find one for you.",
            description:
              "Tell us your skills and interests. We surface a startup idea tailored to you, evaluate its demand, market size, and willingness to pay — then preview the product Ventora would build for you.",
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
        </IdeaExperience>
      </main>
    </div>
  );
}
