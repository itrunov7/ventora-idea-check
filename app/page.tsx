import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";

import { PathChooser } from "@/components/path-chooser";
import { SiteHeader } from "@/components/site-header";
import { Testimonials } from "@/components/testimonials";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { VerdictTeaser } from "@/components/evaluation/verdict-teaser";
import { EXAMPLE_EVALUATION } from "@/lib/example-evaluation";
import {
  EVIDENCE_STATS,
  FAQS,
  HOW_IT_WORKS,
  INTENT_PATHS,
} from "@/lib/landing-content";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Ventora — Check a startup idea, or find one worth building",
  description:
    "Two front doors, one honest read. Check your startup idea or discover one fitted to you — demand, market, willingness to pay — free, in seconds.",
};

export default function HomePage() {
  return (
    <div className="min-h-full">
      <SiteHeader />

      <main>
        <Hero />
        <EvidenceStrip />
        <OutcomePreview />
        <HowItWorks />
        <SocialProof />
        <Faq />
        <FinalCta />
      </main>

      <Footer />
    </div>
  );
}

/** Section shell with consistent rhythm and width. */
function Section({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mx-auto max-w-[1100px] px-6", className)}>
      {children}
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
      {children}
    </span>
  );
}

function Hero() {
  return (
    <div className="relative overflow-hidden">
      {/* Decorative, Apple-style soft glow behind the hero. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[-10%] -z-10 mx-auto h-[420px] max-w-[760px] rounded-full bg-accent-soft opacity-70 blur-3xl"
      />

      <Section className="flex flex-col items-center gap-8 pb-12 pt-16 text-center lg:pb-16 lg:pt-24">
        <Badge variant="accent">
          <Sparkles />
          Free idea check — no signup to start
        </Badge>

        <h1 className="max-w-[16ch] text-balance text-[clamp(34px,6.5vw,58px)] font-semibold leading-[1.05] tracking-[-0.02em] text-fg">
          Know if it&apos;s worth building.{" "}
          <span className="text-accent">Before you build it.</span>
        </h1>

        <p className="max-w-[52ch] text-balance text-[clamp(16px,2.2vw,19px)] leading-relaxed text-fg-muted">
          Ventora gives your startup idea a brutally honest read — demand,
          market, willingness to pay — in seconds. Don&apos;t have an idea yet?
          We&apos;ll find one fitted to you.
        </p>

        <PathChooser className="mt-2 w-full max-w-[820px] text-left" />

        <p className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-fg-muted">
          {["Free to run", "No account to start", "Report in ~20 seconds"].map(
            (item) => (
              <span key={item} className="inline-flex items-center gap-1.5">
                <Check className="size-4 text-success" />
                {item}
              </span>
            ),
          )}
        </p>
      </Section>
    </div>
  );
}

function EvidenceStrip() {
  return (
    <Section className="py-10">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
        {EVIDENCE_STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex flex-col gap-2 bg-surface p-6 text-center"
            >
              <Icon className="mx-auto size-5 text-accent" />
              <div className="text-[clamp(22px,3vw,30px)] font-semibold tracking-tight text-fg">
                {stat.value}
              </div>
              <div className="text-xs leading-snug text-fg-muted">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function OutcomePreview() {
  const { synthesis, greenLights } = EXAMPLE_EVALUATION;
  return (
    <Section className="py-16 lg:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-5">
          <Eyebrow>See a real verdict</Eyebrow>
          <h2 className="text-balance text-[clamp(26px,4vw,38px)] font-semibold leading-[1.1] tracking-[-0.02em] text-fg">
            Not a vibe. An evidence-backed score.
          </h2>
          <p className="text-body text-fg-muted">{synthesis}</p>

          <ul className="flex flex-col gap-2.5">
            {greenLights.slice(0, 3).map((signal) => (
              <li
                key={signal.text}
                className="flex items-start gap-2.5 text-sm text-fg"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-success" />
                <span>{signal.text}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/check"
            className={cn(buttonVariants({ variant: "default", size: "lg" }))}
          >
            See the full example report
            <ArrowRight />
          </Link>
        </div>

        <div className="lg:justify-self-end lg:max-w-[420px]">
          <div className="mb-3 flex justify-end">
            <Badge variant="muted">
              <span className="size-[7px] rounded-full bg-accent motion-safe:animate-pulse" />
              Example
            </Badge>
          </div>
          <VerdictTeaser />
        </div>
      </div>
    </Section>
  );
}

function HowItWorks() {
  return (
    <Section className="py-16 lg:py-20">
      <div className="flex flex-col items-center gap-3 text-center">
        <Eyebrow>How it works</Eyebrow>
        <h2 className="max-w-[18ch] text-balance text-[clamp(26px,4vw,38px)] font-semibold leading-[1.1] tracking-[-0.02em] text-fg">
          From a hunch to a verdict in three steps.
        </h2>
      </div>

      <ol className="mt-10 grid gap-4 md:grid-cols-3 md:gap-5">
        {HOW_IT_WORKS.map((step, i) => {
          const Icon = step.icon;
          return (
            <li
              key={step.title}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-soft"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-accent-soft text-accent [&_svg]:size-5">
                  <Icon />
                </span>
                <span className="font-mono text-sm font-semibold text-fg-muted">
                  0{i + 1}
                </span>
              </div>
              <h3 className="text-heading font-semibold tracking-tight text-fg">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-fg-muted">
                {step.description}
              </p>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}

function SocialProof() {
  return (
    <Section className="py-16 lg:py-20">
      <div className="flex flex-col items-center gap-3 text-center">
        <Eyebrow>Founders, before they wasted a month</Eyebrow>
        <h2 className="max-w-[20ch] text-balance text-[clamp(26px,4vw,38px)] font-semibold leading-[1.1] tracking-[-0.02em] text-fg">
          A second opinion that earns its keep.
        </h2>
      </div>
      <div className="mt-10">
        <Testimonials />
      </div>
    </Section>
  );
}

function Faq() {
  return (
    <Section className="py-16 lg:py-20">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="flex flex-col gap-3">
          <Eyebrow>Questions</Eyebrow>
          <h2 className="text-balance text-[clamp(26px,4vw,38px)] font-semibold leading-[1.1] tracking-[-0.02em] text-fg">
            Everything you&apos;d ask first.
          </h2>
          <p className="text-body text-fg-muted">
            Still unsure? Just run an idea — it&apos;s free, and you&apos;ll see
            exactly what you get.
          </p>
        </div>

        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group p-5 sm:p-6">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-[15px] font-semibold text-fg [&::-webkit-details-marker]:hidden">
                {faq.q}
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-fg-muted transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}

function FinalCta() {
  return (
    <Section className="py-16 lg:py-24">
      <div className="relative overflow-hidden rounded-[28px] border border-border bg-surface px-6 py-14 text-center shadow-soft sm:px-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[-40%] -z-0 mx-auto h-[300px] max-w-[560px] rounded-full bg-accent-soft opacity-70 blur-3xl"
        />
        <div className="relative flex flex-col items-center gap-6">
          <h2 className="max-w-[20ch] text-balance text-[clamp(26px,4.5vw,42px)] font-semibold leading-[1.08] tracking-[-0.02em] text-fg">
            Pick your door. Get your answer.
          </h2>
          <p className="max-w-[46ch] text-body text-fg-muted">
            Whether you have the idea or just the ambition, you&apos;re one
            sentence away from knowing where you stand.
          </p>

          <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
            {INTENT_PATHS.map((path, i) => (
              <Link
                key={path.href}
                href={path.href}
                className={cn(
                  buttonVariants({
                    variant: i === 0 ? "default" : "outline",
                    size: "lg",
                  }),
                  "flex-1",
                )}
              >
                {path.cta}
                <ArrowRight />
              </Link>
            ))}
          </div>

          <Link
            href="https://ventora.cc"
            className="text-sm font-medium text-fg-muted underline-offset-4 hover:text-fg hover:underline"
          >
            Already validated? Build it for real at ventora.cc →
          </Link>
        </div>
      </div>
    </Section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <Section className="flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
        <span className="text-sm font-semibold tracking-tight text-fg">
          Ventora
        </span>
        <nav className="flex items-center gap-5 text-sm text-fg-muted">
          <Link href="/check" className="hover:text-fg">
            Check an idea
          </Link>
          <Link href="/find" className="hover:text-fg">
            Find an idea
          </Link>
          <Link href="https://ventora.cc" className="hover:text-fg">
            ventora.cc
          </Link>
        </nav>
      </Section>
    </footer>
  );
}
