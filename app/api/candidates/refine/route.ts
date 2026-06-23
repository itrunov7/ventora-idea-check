import { z } from "zod";

import { refineCandidate } from "@/lib/ai";
import type { QuizAnswers } from "@/lib/quiz";
import type { CandidateSeed } from "@/lib/types";

export const runtime = "nodejs";
// Refining is a single AI call; give it headroom past the default.
export const maxDuration = 60;

const answersSchema = z.record(
  z.string(),
  z.union([z.string(), z.array(z.string())]),
);

const candidateSeedSchema = z.object({
  name: z.string().min(1).max(200),
  oneLiner: z.string().min(1).max(400),
  fitsYou: z.string().max(2000),
  buildableInVentora: z.string().max(2000),
});

const bodySchema = z.object({
  answers: answersSchema,
  candidate: candidateSeedSchema,
  direction: z.enum(["niche", "broader", "different"]),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  try {
    const candidate = await refineCandidate(
      parsed.data.answers as QuizAnswers,
      parsed.data.candidate as CandidateSeed,
      parsed.data.direction,
    );
    return Response.json({ candidate });
  } catch (err) {
    console.error("candidate refine failed", err);
    return Response.json({ error: "generation_failed" }, { status: 502 });
  }
}
