import "server-only";

import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { z } from "zod";

import { quizAnswersToSummary, type QuizAnswers } from "@/lib/quiz";
import type {
  Candidate,
  CandidateSeed,
  Evaluation,
  RefineDirection,
  Verdict,
} from "@/lib/types";

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

// AI returns everything except `id`; ids are assigned server-side so they're
// always unique and never fabricated by the model.
const candidateSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(48)
    .describe("Memorable product name — short and brandable."),
  oneLiner: z
    .string()
    .max(120)
    .describe("One punchy sentence on what it is, <= 120 chars."),
  fitsYou: z
    .string()
    .describe(
      "1-2 sentences explaining why this fits THIS user, referencing their actual quiz answers (role, unfair advantage, audience, interests). Never generic flattery.",
    ),
  buildableInVentora: z
    .string()
    .describe("One sentence on what Ventora would build for them."),
  teaserScores: z.object({
    fit: z.number().min(0).max(100).describe("How well it matches the user."),
    feasibility: z
      .number()
      .min(0)
      .max(100)
      .describe("Buildability as a software product in Ventora."),
    profit: z.number().min(0).max(100).describe("Revenue potential."),
  }),
});

const candidatesSchema = z.object({
  candidates: z.array(candidateSchema).min(2).max(3),
});

const CANDIDATES_SYSTEM = [
  "You are Ventora's idea finder. From a founder's quiz answers, propose 2-3 distinct, AMBITIOUS startup ideas that feel built around THIS person and make them excited to build.",
  "Each idea MUST be a software product Ventora can build (web/mobile app, SaaS, tool, dashboard, marketplace, AI feature) — never hardware, services, content, or offline businesses.",
  "BAR FOR EACH IDEA — advanced, feasible, and lucrative:",
  "- Aim high: modern, sophisticated, defensible software businesses (AI-native, vertical SaaS, B2B workflow tools, marketplaces, automation) — not a thin wrapper, toy, or generic to-do clone.",
  "- Strong, obvious monetization: recurring/scalable revenue, clear willingness to pay (ideally B2B or prosumer), and real pricing power. Favor ideas with a credible path to meaningful MRR.",
  "- Still genuinely BUILDABLE: an ambitious-but-shippable v1 Ventora can launch, then expand — not a moonshot that needs a huge team or years before first revenue.",
  "- Make the founder think 'this could actually be big AND I could realistically build it.'",
  "GENERATION RULES:",
  "- 'fitsYou' must reference the user's ACTUAL answers (their role/skill, unfair advantage, audience access, interests). Quote or paraphrase real selections; never generic flattery that could apply to anyone.",
  "- Make the ideas genuinely different from each other (different angle, audience, or wedge), and specific — not broad platforms.",
  "- 'buildableInVentora' names concretely what Ventora would build for a strong v1, in one sentence.",
  "- teaserScores (fit/feasibility/profit) are rough ESTIMATES, 0-100, and must stay honest: only score feasibility high when the v1 is truly buildable, and only score profit high when the monetization path is real. Do not inflate.",
  "- No fabricated citations, sources, or precise statistics.",
  GUARDRAILS,
].join("\n");

/**
 * Turns quiz answers into 2-3 fitted, software-buildable candidate ideas — the
 * free, pre-gate "wow, these actually fit me" hook. Validates with zod and
 * retries ONCE on a parse failure. Ids are assigned server-side.
 */
export async function generateCandidates(
  answers: QuizAnswers,
): Promise<Candidate[]> {
  const summary = quizAnswersToSummary(answers);
  const prompt = [
    "Here are the founder's quiz answers:",
    "",
    summary,
    "",
    "Propose 2-3 candidate ideas as JSON matching the schema exactly. Make each 'fitsYou' tie directly to the answers above.",
    "Push for ambitious, advanced software businesses with a clear, lucrative monetization path AND a realistically buildable v1 — ideas that feel exciting and big, not safe or generic. Keep the teaserScores honest.",
  ].join("\n");

  async function attempt(): Promise<Candidate[]> {
    const { output } = await generateText({
      model: MODEL,
      output: Output.object({ schema: candidatesSchema }),
      system: CANDIDATES_SYSTEM,
      prompt,
    });
    const { candidates } = candidatesSchema.parse(output);
    return candidates.map((c) => ({ ...c, id: crypto.randomUUID() }));
  }

  try {
    return await attempt();
  } catch (err) {
    console.error("candidate generation failed, retrying once", err);
    return await attempt();
  }
}

const REFINE_DIRECTIONS: Record<RefineDirection, string> = {
  niche:
    "Make it MORE NICHE: sharpen it to a narrower, more specific audience or wedge. Smaller beachhead, clearer 'this is exactly for me' pull. Do not water it down — keep it ambitious within that niche.",
  broader:
    "Make it BROADER: widen the audience or market it can serve while staying a focused product. Bigger TAM and a more horizontal angle, without becoming a vague everything-platform.",
  different:
    "Take a DIFFERENT ANGLE: keep the same founder fit, but attack it from a meaningfully different wedge, audience, or business model. It should feel like a fresh take, not a rename of the same idea.",
};

const REFINE_SYSTEM = [
  "You are Ventora's idea finder. The founder has picked one idea and wants you to refine it in a specific direction while keeping it built around THIS person.",
  "Return ONE refined idea as JSON matching the schema exactly.",
  "CRITICAL: stay within the founder's fit profile from their quiz answers — same role/skill, unfair advantage, audience access, and interests. The refined idea must still feel like it was made for them.",
  "Keep the SAME bar as before: an ambitious, advanced, defensible software product Ventora can build, with strong/obvious monetization AND a realistically buildable v1. No hardware, services, content, or offline businesses.",
  "'fitsYou' must reference the user's ACTUAL answers (quote or paraphrase real selections), never generic flattery.",
  "'buildableInVentora' names concretely what Ventora would build for a strong v1, in one sentence.",
  "teaserScores (fit/feasibility/profit) are rough ESTIMATES, 0-100, and must stay honest — do not inflate.",
  "No fabricated citations, sources, or precise statistics.",
  GUARDRAILS,
].join("\n");

/**
 * Takes a candidate the user already picked and nudges it in one direction
 * (niche / broader / different angle) WITHOUT leaving their quiz fit profile.
 * One AI call, validated with zod, retries ONCE on parse failure. The id is
 * assigned server-side.
 */
export async function refineCandidate(
  answers: QuizAnswers,
  candidate: CandidateSeed,
  direction: RefineDirection,
): Promise<Candidate> {
  const summary = quizAnswersToSummary(answers);
  const prompt = [
    "Here are the founder's quiz answers (their fit profile — do not leave it):",
    "",
    summary,
    "",
    "Here is the idea they picked:",
    `Name: ${candidate.name}`,
    `One-liner: ${candidate.oneLiner}`,
    `Why it fits them: ${candidate.fitsYou}`,
    `What Ventora would build: ${candidate.buildableInVentora}`,
    "",
    "Refine it as follows:",
    REFINE_DIRECTIONS[direction],
    "",
    "Return ONE candidate idea as JSON matching the schema exactly. Make 'fitsYou' tie directly to the quiz answers above and keep the teaserScores honest.",
  ].join("\n");

  async function attempt(): Promise<Candidate> {
    const { output } = await generateText({
      model: MODEL,
      output: Output.object({ schema: candidateSchema }),
      system: REFINE_SYSTEM,
      prompt,
    });
    const refined = candidateSchema.parse(output);
    return { ...refined, id: crypto.randomUUID() };
  }

  try {
    return await attempt();
  } catch (err) {
    console.error("candidate refine failed, retrying once", err);
    return await attempt();
  }
}
