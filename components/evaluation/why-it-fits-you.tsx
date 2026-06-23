import { Compass, Sparkles, Target } from "lucide-react";

import type { WhyItFitsYou as WhyItFitsYouData } from "@/lib/types";

function FitBlock({
  icon: Icon,
  label,
  items,
}: {
  icon: typeof Sparkles;
  label: string;
  items: string[];
}) {
  if (!items.length) return null;
  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-4">
      <div className="flex items-center gap-2">
        <Icon className="size-[15px] text-accent" />
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-fg-muted">
          {label}
        </span>
      </div>
      <ul className="mt-2.5 flex flex-wrap gap-2">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-md border border-border bg-surface px-2.5 py-1 text-[13px] font-medium text-fg"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WhyItFitsYou({ data }: { data: WhyItFitsYouData }) {
  return (
    <section className="rounded-2xl border border-accent/30 bg-accent-soft p-6 shadow-soft md:p-8">
      <p className="text-[15px] leading-snug text-fg">{data.intro}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <FitBlock icon={Sparkles} label="Your edge" items={data.advantage} />
        <FitBlock
          icon={Target}
          label="Your goal"
          items={data.ambition ? [data.ambition] : []}
        />
        <FitBlock
          icon={Compass}
          label="What pulls you in"
          items={data.interests}
        />
      </div>

      {data.fitsYou ? (
        <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-accent">
            Why this idea, for you
          </div>
          <p className="mt-1.5 text-sm text-fg">{data.fitsYou}</p>
        </div>
      ) : null}
    </section>
  );
}
