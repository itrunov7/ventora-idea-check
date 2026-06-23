import "server-only";

import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { z } from "zod";

import type { Evaluation, Verdict } from "@/lib/types";

const MODEL = openai(process.env.OPENAI_MODEL ?? "gpt-5.4");

const GUARDRAILS = [
  "You produce evaluation and marketing framing ONLY.",
  "NEVER output working code, pseudo-code, API designs, database schemas, system architecture, file structures, or any technical implementation.",
  "NEVER output build instructions, tech stacks, team plans, hiring plans, or product roadmaps.",
  "NEVER produce an exportable spec, PRD, or investor/pitch deck.",
  "Everything must read as a teaser of what Ventora would build — not a deliverable the reader could build from on their own.",
].join(" ");

const verdictSchema = z.object({
  score: z.number().min(0).max(100).describe("Overall idea strength, 0-100."),
  verdict: z
    .enum(["promising", "mixed", "risky"])
    .describe("One-word call on the idea."),
  demand: z.string().describe("One sentence on real-world demand."),
  marketSize: z.string().describe("One sentence, rough market size framing."),
  willingnessToPay: z
    .string()
    .describe("One sentence on whether people will pay."),
  summary: z
    .string()
    .describe("Two-sentence punchy verdict the founder reads first."),
});

const signalSchema = z.object({
  text: z.string().describe("One specific sentence of evidence."),
  tag: z.string().max(12).describe("Short category tag, <= 12 chars."),
});

const marketTierSchema = z.object({
  value: z.string().describe('Dollar figure like "$1.4B".'),
  label: z.string().describe("One short line describing the tier."),
});

export const evaluationSchema = z.object({
  idea: z.string(),
  viabilityScore: z.number().min(0).max(100),
  verdict: z.object({
    label: z.string().describe('Short call like "Worth building".'),
    tone: z.enum(["go", "caution", "no"]),
    confidence: z.enum(["high", "medium", "low"]),
  }),
  synthesis: z.string().max(200).describe("One sentence, <= 200 chars."),
  quickStats: z.object({
    demand: z.enum(["High", "Medium", "Low"]),
    market: z.enum(["High", "Medium", "Low"]),
    willingToPay: z.enum(["Yes", "Maybe", "No"]),
  }),
  greenLights: z.array(signalSchema).min(3).max(4),
  redFlags: z.array(signalSchema).min(3).max(4),
  scores: z.object({
    marketTiming: z.number().min(0).max(100),
    problemFit: z.number().min(0).max(100),
    demand: z.number().min(0).max(100),
    monetization: z.number().min(0).max(100),
    differentiation: z.number().min(0).max(100),
    competition: z.number().min(0).max(100),
  }),
  market: z.object({
    tam: marketTierSchema,
    sam: marketTierSchema,
    som: marketTierSchema,
  }),
  demandTrend: z.object({
    changePct: z.number(),
    points: z.array(z.number().min(0).max(100)).length(9),
  }),
  competitors: z
    .array(
      z.object({
        name: z.string(),
        initial: z.string().max(2),
        gap: z.string().describe("One line on the opening they leave."),
        reachScore: z.number().min(0).max(100),
      }),
    )
    .length(3),
  edge: z.string().describe("One sentence: the user's wedge."),
  pricing: z.object({
    suggested: z.string().describe('Like "$29".'),
    unit: z.string().describe('Like "/ chair / month".'),
    rationale: z.string(),
    rangeLowPct: z.number().min(0).max(100),
    rangeHighPct: z.number().min(0).max(100),
  }),
  earnings: z.object({
    headline: z
      .string()
      .describe("Emotional one-liner about the money on the table."),
    summary: z
      .string()
      .max(220)
      .describe("1-2 sentences, grounded but motivating."),
    scenarios: z
      .array(
        z.object({
          label: z
            .string()
            .describe('"Conservative", "Likely", or "Breakout".'),
          mrr: z.string().describe('Monthly recurring revenue like "$2.3k".'),
          arr: z.string().describe('Annual recurring revenue like "$28k".'),
          basis: z
            .string()
            .describe('How the number is reached, e.g. "80 chairs @ $29/mo".'),
        }),
      )
      .length(3)
      .describe("Conservative, Likely, Breakout — in that order."),
    rampPoints: z
      .array(z.number().min(0).max(100))
      .length(9)
      .describe("MRR ramp over the first ~18 months, 0-100."),
    rampCaption: z
      .string()
      .describe('Names the target MRR, e.g. "Path to ~$5k MRR in 18 months".'),
    proof: z
      .array(
        z.object({
          name: z
            .string()
            .describe("Real player or a generic 'solo founder in this space'."),
          figure: z
            .string()
            .describe("Revenue figure clearly estimated: 'est.' / 'reportedly'."),
          text: z.string().describe("One line on how they make the money."),
        }),
      )
      .min(2)
      .max(3),
    benefits: z
      .array(
        z.object({
          title: z.string().max(28).describe("Short benefit label."),
          text: z
            .string()
            .describe("One sentence, specific to this idea."),
        }),
      )
      .min(3)
      .max(4),
  }),
});

const EVALUATION_SYSTEM = [
  "You are Ventora's startup idea evaluator. You produce a premium, honest evaluation that makes a founder feel their idea is understood, worth building, and capable of earning them real money — ending in a handoff to Ventora to build it.",
  "Stay on 'is this worth building and what could it earn me': market, demand, competition, pricing, validation, earning potential, and the personal benefits of building it.",
  "GENERATION RULES:",
  "- Be specific to THIS idea; never generic boilerplate.",
  "- Market numbers and the demand trend are estimates — keep them plausible and clearly framed as estimates; do NOT fabricate precise citations or sources.",
  "- Earnings figures must derive from the suggested price multiplied by plausible customer counts, and be framed as estimates; competitor/comparable revenue must be clearly estimated ('est.'/'reportedly'), never a fabricated precise citation.",
  "- Make the earnings and benefits motivating and emotionally resonant, but grounded — no hype that the numbers can't support.",
  "- Name real competitors when known; if unknown, describe category players, never invent brands.",
  "- Never output build instructions, tech stacks, team plans, or roadmaps.",
  GUARDRAILS,
].join("\n");

const ideaSchema = z.object({
  idea: z
    .string()
    .min(8)
    .max(220)
    .describe(
      "One concrete startup idea in a single sentence, phrased the way a founder would describe it (problem + who it's for). No preamble.",
    ),
});

export type FinderProfile = {
  skills: string;
  interests: string;
  constraints?: string;
};

/**
 * Turns a founder's skills/interests profile into one tailored startup idea
 * sentence, which then flows into the same verdict -> report pipeline as a
 * directly-typed idea. Idea discovery only — never a spec, plan, or build guide.
 */
export async function generateIdeaFromProfile(
  profile: FinderProfile,
): Promise<string> {
  const lines = [
    `Skills / what they're good at: ${profile.skills}`,
    `Interests / domains they care about: ${profile.interests}`,
  ];
  if (profile.constraints?.trim()) {
    lines.push(`Constraints / preferences: ${profile.constraints}`);
  }

  const { output } = await generateText({
    model: MODEL,
    output: Output.object({ schema: ideaSchema }),
    system: [
      "You are Ventora's startup idea finder. From a founder's skills and interests, propose ONE specific, buildable startup idea that plays to their strengths and has a plausible paying market.",
      "Prefer focused, niche, software/digital-product ideas a solo founder could launch — not broad platforms or hardware.",
      "Output ONLY the idea sentence (problem + target customer). Never explain your reasoning, list alternatives, or output build instructions.",
      GUARDRAILS,
    ].join("\n"),
    prompt: `Find the single best startup idea for this person:\n\n${lines.join("\n")}`,
  });

  return (output as { idea: string }).idea.trim();
}

export async function generateVerdict(idea: string): Promise<Verdict> {
  const { output } = await generateText({
    model: MODEL,
    output: Output.object({ schema: verdictSchema }),
    system: `You are Ventora's startup idea evaluator. Be sharp, specific, and honest. ${GUARDRAILS}`,
    prompt: `Evaluate this startup idea in one sentence each, then give a 0-100 score and a one-word verdict.\n\nIdea: ${idea}`,
  });

  return output as Verdict;
}

/**
 * Generates the full evaluation for an idea. Validates the model output with
 * zod and retries ONCE on a parse failure before surfacing a real error.
 */
export async function generateEvaluation(idea: string): Promise<Evaluation> {
  const prompt = [
    `Idea: ${idea}`,
    "",
    "Produce the complete evaluation as JSON matching the schema exactly:",
    "- A viability score (0-100), a short verdict label with tone (go/caution/no) and confidence.",
    "- A one-sentence synthesis (<= 200 chars).",
    "- Quick stats: demand, market, willing to pay.",
    "- 3-4 green lights and 3-4 red flags, each a specific sentence with a short tag.",
    "- Six 0-100 scores: marketTiming, problemFit, demand, monetization, differentiation, competition.",
    "- Market sizing: TAM, SAM, SOM (dollar value + one-line label each), framed as estimates.",
    "- A 24-month demand trend: a percent change and exactly 9 points (0-100).",
    "- Exactly 3 competitors (real or category players), each with an initial, the gap they leave, and a 0-100 reach score.",
    "- The user's edge in one sentence.",
    "- Pricing: a suggested price + unit, a rationale, and a low/high position (0-100) on the price scale.",
    "- Earnings: an emotional headline + 1-2 sentence summary of the money on the table.",
    "- Three earnings scenarios (Conservative, Likely, Breakout) each with MRR, ARR, and the basis (customer count x the suggested price).",
    "- A 9-point MRR ramp (0-100) and a caption naming the target MRR.",
    "- 2-3 proof points on how real players or solo founders already make money here — figures clearly framed as estimates ('est.'/'reportedly'), never invented precise sources.",
    "- 3-4 concrete benefits (recurring revenue, a sellable asset, freedom, leverage) specific to THIS idea.",
  ].join("\n");

  async function attempt(): Promise<Evaluation> {
    const { output } = await generateText({
      model: MODEL,
      output: Output.object({ schema: evaluationSchema }),
      system: EVALUATION_SYSTEM,
      prompt,
    });
    return evaluationSchema.parse(output) as Evaluation;
  }

  try {
    return await attempt();
  } catch (err) {
    console.error("evaluation generation failed, retrying once", err);
    return await attempt();
  }
}
