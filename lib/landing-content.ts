import {
  Compass,
  Gauge,
  Lock,
  Rocket,
  Sparkles,
  Target,
  Wand2,
  type LucideIcon,
} from "lucide-react";

/** A single intent path on the unified landing's two-path chooser. */
export type IntentPath = {
  href: "/check" | "/find";
  icon: LucideIcon;
  /** Short intent label, e.g. "I have an idea". */
  intent: string;
  /** The action verb the route delivers, e.g. "check it". */
  action: string;
  title: string;
  description: string;
  bullets: string[];
  cta: string;
};

export const INTENT_PATHS: IntentPath[] = [
  {
    href: "/check",
    icon: Sparkles,
    intent: "I have an idea",
    action: "check it",
    title: "Check your idea",
    description:
      "Describe it in one sentence. Get a brutally honest viability read — demand, market, willingness to pay — in seconds.",
    bullets: [
      "Viability score across 6 dimensions",
      "Real demand & competitor signals",
      "A product preview of what to build",
    ],
    cta: "Check my idea",
  },
  {
    href: "/find",
    icon: Compass,
    intent: "I need an idea",
    action: "find one",
    title: "Find your idea",
    description:
      "No idea yet? Answer a few quick taps about your skills and interests. We surface startup ideas fitted to you — then score them.",
    bullets: [
      "Ideas matched to your unfair advantage",
      "Fit, feasibility & profit at a glance",
      "Pick one and get the full report",
    ],
    cta: "Find my idea",
  },
];

/** Illustrative, example-tagged proof points shown in the evidence strip. */
export type EvidenceStat = {
  value: string;
  label: string;
  icon: LucideIcon;
};

export const EVIDENCE_STATS: EvidenceStat[] = [
  { value: "~20s", label: "From sentence to full report", icon: Gauge },
  { value: "6", label: "Viability dimensions scored", icon: Target },
  { value: "$0", label: "Free to run — no signup to start", icon: Lock },
  { value: "1-tap", label: "Send it straight to a real build", icon: Rocket },
];

/** "How it works" — three steps, intent-agnostic. */
export type HowStep = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const HOW_IT_WORKS: HowStep[] = [
  {
    icon: Wand2,
    title: "Tell us the idea — or find one",
    description:
      "Type your idea in a sentence, or take the 60-second finder quiz and we'll fit ideas to your strengths.",
  },
  {
    icon: Gauge,
    title: "Get the honest read",
    description:
      "Demand, market size, willingness to pay, competitors and a real viability score — no hype, no fluff.",
  },
  {
    icon: Rocket,
    title: "Build it for real",
    description:
      "Like what you see? Hand it to Ventora and turn the verdict into a shipped product.",
  },
];

/** Illustrative testimonials (placeholder names/roles), clearly example copy. */
export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  initial: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "I'd been polishing the same idea for months. The report killed two assumptions in 20 seconds and pointed me at the niche that actually pays.",
    name: "Maya R.",
    role: "Solo founder",
    initial: "M",
  },
  {
    quote:
      "I didn't have an idea — I had skills. The finder handed me three I could actually build, scored, with the math on what each could earn.",
    name: "Daniel K.",
    role: "Staff engineer, nights & weekends",
    initial: "D",
  },
  {
    quote:
      "It reads like a sharp advisor who isn't trying to flatter you. I forwarded my report to my co-founder and we changed the plan that day.",
    name: "Priya S.",
    role: "Indie hacker",
    initial: "P",
  },
];

export type Faq = {
  q: string;
  a: string;
};

export const FAQS: Faq[] = [
  {
    q: "Is it really free?",
    a: "Yes. Running an idea check or the finder quiz is free and takes seconds. You only verify your email to unlock the full written report.",
  },
  {
    q: "How accurate is the verdict?",
    a: "It's a fast, evidence-weighted read — demand signals, market sizing, competitor gaps and pricing benchmarks — not a guarantee. Treat it as a sharp second opinion that saves you weeks of guessing.",
  },
  {
    q: "What if I don't have an idea yet?",
    a: "Use the finder. Answer a few taps about your skills, interests and ambition, and we surface startup ideas fitted to your unfair advantage — then score them like any other idea.",
  },
  {
    q: "What is Ventora?",
    a: "Ventora turns a validated idea into a real, shipped product. The Idea Check is the free front door — when a verdict looks promising, you can build it for real at ventora.cc.",
  },
];
