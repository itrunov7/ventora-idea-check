"use client";

import { ArrowRight } from "lucide-react";

import { track } from "@/lib/analytics";
import type { WhyItFitsYou } from "@/lib/types";
import { buildVentoraHandoffUrl } from "@/lib/ventora";
import { cn } from "@/lib/utils";

function Compare({
  h,
  t,
  c,
  win,
}: {
  h: string;
  t: string;
  c: string;
  win?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[14px] border p-4",
        win
          ? "border-[#8b78ff] bg-[rgba(139,120,255,.14)]"
          : "border-white/[0.13] bg-white/[0.04]",
      )}
    >
      <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9d8dff]">
        {h}
      </div>
      <div
        className={cn(
          "mt-2 text-[18px] font-semibold",
          win ? "text-white" : "text-white/90",
        )}
      >
        {t}
      </div>
      <div className="text-[13px] text-[#cdc7ee]">{c}</div>
    </div>
  );
}

export function VentoraSwap({
  idea,
  viabilityScore,
  whyItFitsYou,
}: {
  idea: string;
  viabilityScore: number;
  whyItFitsYou?: WhyItFitsYou;
}) {
  const href = buildVentoraHandoffUrl(idea, { whyItFitsYou });
  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-[#2a1b6b] text-white shadow-[0_24px_48px_-20px_rgba(36,26,82,.6)]"
      style={{
        background:
          "radial-gradient(120% 140% at 100% 0%, #6b54ff 0%, rgba(107,84,255,0) 55%), linear-gradient(160deg,#241a52,#150f33)",
      }}
    >
      <div className="p-8">
        <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#b9aaff]">
          Verdict: build it
        </div>
        <h2 className="mt-2.5 text-[clamp(22px,3.2vw,30px)] font-semibold leading-[1.1] tracking-tight">
          This idea scores {viabilityScore}. Don&apos;t let it sit in a notes
          app.
        </h2>
        <p className="mt-3 max-w-[54ch] text-[15px] text-[#cdc7ee]">
          You don&apos;t need a $15k agency or six months of learning to code.
          Describe this idea to Ventora and get a working product — with payments
          and a live landing page — to put in front of real users this week.
        </p>
        <div className="my-6 grid gap-3 sm:grid-cols-3">
          <Compare h="Do it yourself" t="3–6 months" c="Learn the stack, or stall." />
          <Compare h="Hire an agency" t="$12k–20k" c="Weeks of briefs and revisions." />
          <Compare h="With Ventora" t="~48 hours" c="Live product, ready to test." win />
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("build_handoff_click", { idea, viabilityScore })}
          className="inline-flex items-center gap-2.5 rounded-[14px] bg-white px-6 py-3.5 text-base font-semibold text-[#1a1340] shadow-[0_8px_20px_-6px_rgba(0,0,0,.4)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1340]"
        >
          Build this with Ventora
          <ArrowRight className="size-[18px]" />
        </a>
        <div className="mt-3.5 font-mono text-[11.5px] text-[#9b92c4]">
          Your idea and these notes carry straight into the builder — no
          retyping.
        </div>
      </div>
    </section>
  );
}
