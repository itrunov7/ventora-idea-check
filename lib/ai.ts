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
});

const EVALUATION_SYSTEM = [
  "You are Ventora's startup idea evaluator. You produce a premium, honest evaluation that makes a founder feel their idea is understood and worth building — ending in a handoff to Ventora to build it.",
  "Stay entirely on 'is this worth building': market, demand, competition, pricing, validation.",
  "GENERATION RULES:",
  "- Be specific to THIS idea; never generic boilerplate.",
  "- Market numbers and the demand trend are estimates — keep them plausible and clearly framed as estimates; do NOT fabricate precise citations or sources.",
  "- Name real competitors when known; if unknown, describe category players, never invent brands.",
  "- Never output build instructions, tech stacks, team plans, or roadmaps.",
  GUARDRAILS,
].join("\n");

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
