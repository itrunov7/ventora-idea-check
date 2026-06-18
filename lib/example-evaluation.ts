import type { Evaluation } from "@/lib/types";

/**
 * Fixed example evaluation used on the landing preview (EXAMPLE mode). Mirrors
 * the values in the design target exactly. Static — no generation, no API.
 */
export const EXAMPLE_EVALUATION: Evaluation = {
  idea: "A booking app for independent barbers",
  viabilityScore: 82,
  verdict: { label: "Worth building", tone: "go", confidence: "high" },
  synthesis:
    "Real, repeated pain in a market that already pays for software — but crowded. You win by going narrow on solo barbers the big platforms treat as an afterthought.",
  quickStats: { demand: "High", market: "Medium", willingToPay: "Yes" },
  greenLights: [
    {
      text: "Barbers rebook clients constantly — high-frequency pain, not a one-off.",
      tag: "behaviour",
    },
    {
      text: "Competitors charge $20–40/chair and still grow — the market pays.",
      tag: "pricing",
    },
    {
      text: "“Booking app” searches in grooming up ~31% over two years.",
      tag: "trend",
    },
    {
      text: "Solo barbers are underserved by salon-first incumbents.",
      tag: "gap",
    },
  ],
  redFlags: [
    {
      text: "Booksy, Squire and Fresha are funded and entrenched.",
      tag: "competition",
    },
    {
      text: "Switching cost is real — barbers hate moving their booked clients.",
      tag: "retention",
    },
    {
      text: "Local, one-shop-at-a-time sales — acquisition can get expensive.",
      tag: "CAC",
    },
    {
      text: "A generic calendar isn’t enough — you need a reason to switch.",
      tag: "diff",
    },
  ],
  scores: {
    marketTiming: 88,
    problemFit: 85,
    demand: 80,
    monetization: 74,
    differentiation: 66,
    competition: 40,
  },
  market: {
    tam: { value: "$1.4B", label: "Global appointment & booking software" },
    sam: { value: "$320M", label: "Independent barbers & grooming" },
    som: { value: "$9M", label: "Realistic 3-year capture" },
  },
  demandTrend: {
    changePct: 31,
    points: [28, 32, 38, 35, 52, 60, 70, 82, 92],
  },
  competitors: [
    {
      name: "Booksy",
      initial: "B",
      gap: "Huge marketplace — but barbers are one vertical among many.",
      reachScore: 86,
    },
    {
      name: "Squire",
      initial: "S",
      gap: "Barber-focused, premium — priced for shops, not solo chairs.",
      reachScore: 71,
    },
    {
      name: "Fresha",
      initial: "F",
      gap: "Free + commission model — salon-first UX, weak for solo barbers.",
      reachScore: 64,
    },
  ],
  edge: "One-tap rebooking and a no-show deposit built for a single barber and their regulars — the workflow incumbents bury under salon, staff and marketplace features.",
  pricing: {
    suggested: "$29",
    unit: "/ chair / month",
    rationale:
      "Sits just under Squire, above free-but-commission Fresha. Anchor on “keep your no-shows, skip the marketplace cut.”",
    rangeLowPct: 32,
    rangeHighPct: 58,
  },
  earnings: {
    headline: "A realistic path to $30k+/year in recurring income.",
    summary:
      "At $29/chair, you only need a few hundred barbers to clear six figures — and every one of them sticks around for years. This is a slow-burn cash machine, not a lottery ticket.",
    scenarios: [
      {
        label: "Conservative",
        mrr: "$870",
        arr: "$10k",
        basis: "30 chairs @ $29/mo",
      },
      {
        label: "Likely",
        mrr: "$2.3k",
        arr: "$28k",
        basis: "80 chairs @ $29/mo",
      },
      {
        label: "Breakout",
        mrr: "$8.7k",
        arr: "$104k",
        basis: "300 chairs @ $29/mo",
      },
    ],
    rampPoints: [4, 9, 16, 24, 34, 45, 58, 72, 88],
    rampCaption: "Path to ~$2.3k MRR over the first 18 months.",
    proof: [
      {
        name: "Squire",
        figure: "est. ~$30M ARR",
        text: "Charges barbershops monthly for booking + payments — proof the category pays for software.",
      },
      {
        name: "Solo founder, niche booking SaaS",
        figure: "reportedly ~$15k/mo",
        text: "One operator quietly running a single-vertical scheduling tool with no team.",
      },
      {
        name: "Booksy",
        figure: "est. millions in ARR",
        text: "Marketplace + subscriptions across grooming — the demand is real and recurring.",
      },
    ],
    benefits: [
      {
        title: "Recurring income",
        text: "Subscriptions bill every month whether you're working or not — predictable cash you can plan a life around.",
      },
      {
        title: "A sellable asset",
        text: "Sticky B2B SaaS with low churn is the kind of business that sells for 3-5x ARR down the line.",
      },
      {
        title: "Freedom & leverage",
        text: "Software serves 30 or 3,000 barbers with almost the same effort — your time stops being the bottleneck.",
      },
      {
        title: "Own the niche",
        text: "Be the obvious choice for solo barbers before a big platform notices the gap you're filling.",
      },
    ],
  },
};
