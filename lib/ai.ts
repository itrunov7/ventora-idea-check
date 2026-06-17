import "server-only";

import { generateText, Output } from "ai";
import { z } from "zod";

import type { AdvancedReport, Verdict } from "@/lib/types";

const MODEL = "openai/gpt-5.4";

const GUARDRAILS = [
  "You produce evaluation and marketing framing ONLY.",
  "NEVER output working code, pseudo-code, API designs, database schemas, system architecture, file structures, or any technical implementation.",
  "NEVER produce an exportable spec, PRD, or investor/pitch deck.",
  "Everything must read as a teaser of what Ventora would build — not a deliverable the reader could build from on their own.",
].join(" ");

const verdictSchema = z.object({
  score: z
    .number()
    .min(0)
    .max(100)
    .describe("Overall idea strength, 0-100."),
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

const reportSchema = z.object({
  firstFiveFeatures: z
    .array(
      z.object({
        name: z.string().describe("Short feature name."),
        why: z
          .string()
          .describe("One line on why it ships first. NO implementation detail."),
      }),
    )
    .length(5)
    .describe("The first 5 things Ventora would build — names + one-liners only."),
  landingHeadline: z.string().describe("Punchy landing page headline."),
  landingSubhead: z.string().describe("One supporting sentence under the headline."),
  validation: z.object({
    marketSize: z.string().describe("Rough market size with a number."),
    competitors: z
      .array(z.object({ name: z.string(), note: z.string() }))
      .min(2)
      .max(3)
      .describe("2-3 real-ish competitors with a one-line snapshot each."),
    suggestedPrice: z.string().describe("A concrete suggested price point."),
    closestFailurePattern: z
      .string()
      .describe("One line: the most common way this kind of idea dies."),
  }),
  pathToFirstSale: z.object({
    visitors: z.number().describe("Visitors needed."),
    conversionRate: z.number().describe("Assumed conversion rate as a percent, e.g. 2 for 2%."),
    days: z.number().describe("Estimated days to first paying customer."),
    narrative: z
      .string()
      .describe("One sentence tying visitors x conversion -> first sale in N days."),
  }),
});

export async function generateVerdict(idea: string): Promise<Verdict> {
  const { output } = await generateText({
    model: MODEL,
    output: Output.object({ schema: verdictSchema }),
    system: `You are Ventora's startup idea evaluator. Be sharp, specific, and honest. ${GUARDRAILS}`,
    prompt: `Evaluate this startup idea in one sentence each, then give a 0-100 score and a one-word verdict.\n\nIdea: ${idea}`,
    providerOptions: {
      gateway: { tags: ["feature:verdict", "env:production"] },
    },
  });

  return output as Verdict;
}

export async function generateAdvancedReport(
  idea: string,
  verdict: Verdict,
): Promise<AdvancedReport> {
  const { output } = await generateText({
    model: MODEL,
    output: Output.object({ schema: reportSchema }),
    system: `You are Ventora's product strategist creating a locked "preview" report that makes the founder feel Ventora already started building their product. ${GUARDRAILS}`,
    prompt: [
      `Idea: ${idea}`,
      `Prior verdict: ${verdict.verdict} (${verdict.score}/100). ${verdict.summary}`,
      "",
      "Produce a teaser report:",
      "(a) The first 5 features Ventora would build first — names + one-liners, framed as 'what Ventora will build first'. No implementation.",
      "(b) A landing headline + subhead for this product.",
      "(c) Validation signals: rough market size, 2-3 competitor snapshots, a suggested price, and the closest failure pattern.",
      "(d) Path to first sale: visitors x conversion rate -> first paying customer in ~N days.",
    ].join("\n"),
    providerOptions: {
      gateway: { tags: ["feature:advanced-report", "env:production"] },
    },
  });

  return output as AdvancedReport;
}
