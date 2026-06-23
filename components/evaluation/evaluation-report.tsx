import type { Evaluation } from "@/lib/types";
import { cn } from "@/lib/utils";

import { CompetitorList } from "./competitor-list";
import { EarningsPotential } from "./earnings-potential";
import { MarketRings } from "./market-rings";
import { PricingBand } from "./pricing-band";
import { Reveal } from "./reveal";
import { ScoresRadar } from "./scores-radar";
import { SignalsGrid } from "./signals-grid";
import { VentoraSwap } from "./ventora-swap";
import { VerdictCockpit } from "./verdict-cockpit";
import { WhyItFitsYou } from "./why-it-fits-you";

function SectionHead({
  n,
  title,
  sub,
}: {
  n: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="mx-1 mb-3.5 mt-8 flex items-baseline gap-3">
      <span className="font-mono text-xs font-semibold text-accent">{n}</span>
      <h2 className="text-xl font-semibold tracking-tight text-fg">{title}</h2>
      {sub ? (
        <span className="ml-auto hidden text-[13px] text-fg-muted sm:block">
          {sub}
        </span>
      ) : null}
    </div>
  );
}

export function EvaluationReport({
  data,
  mode,
  className,
}: {
  data: Evaluation;
  mode: "example" | "report";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      {mode === "example" ? (
        <div className="mb-4 flex justify-end">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-accent-soft px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-accent">
            <span className="size-[7px] rounded-full bg-accent motion-safe:animate-pulse" />
            Example report
          </span>
        </div>
      ) : null}

      <Reveal>
        <VerdictCockpit data={data} />
      </Reveal>

      {data.whyItFitsYou ? (
        <>
          <SectionHead n="00" title="Why this fits you" sub="from your finder answers" />
          <Reveal>
            <WhyItFitsYou data={data.whyItFitsYou} />
          </Reveal>
        </>
      ) : null}

      <SectionHead n="01" title="What the signals say" sub="weighted from multiple sources" />
      <Reveal>
        <SignalsGrid greenLights={data.greenLights} redFlags={data.redFlags} />
      </Reveal>

      <SectionHead n="02" title="Scored across what matters" sub="0–100 per criterion" />
      <div className="grid gap-4 md:grid-cols-2">
        <Reveal>
          <ScoresRadar scores={data.scores} />
        </Reveal>
        <Reveal>
          <MarketRings market={data.market} demandTrend={data.demandTrend} />
        </Reveal>
      </div>

      <SectionHead n="03" title="Who you’re up against" />
      <Reveal>
        <CompetitorList competitors={data.competitors} edge={data.edge} />
      </Reveal>

      <SectionHead n="04" title="What you can charge" sub="benchmarked to the field" />
      <Reveal>
        <PricingBand pricing={data.pricing} />
      </Reveal>

      <SectionHead n="05" title="What this could earn you" sub="estimates from your pricing" />
      <Reveal>
        <EarningsPotential earnings={data.earnings} />
      </Reveal>

      <div className="mt-6">
        <Reveal>
          <VentoraSwap
            idea={data.idea}
            viabilityScore={data.viabilityScore}
            whyItFitsYou={data.whyItFitsYou}
          />
        </Reveal>
      </div>
    </div>
  );
}
