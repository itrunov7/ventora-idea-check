import { z } from "zod";

import { generateCandidates } from "@/lib/ai";
import type { QuizAnswers } from "@/lib/quiz";

export const runtime = "nodejs";
// Generating 2-3 candidates is a single AI call; give it headroom past the default.
export const maxDuration = 60;

const bodySchema = z.record(
  z.string(),
  z.union([z.string(), z.array(z.string())]),
);

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "invalid_answers" }, { status: 400 });
  }

  try {
    const candidates = await generateCandidates(parsed.data as QuizAnswers);
    return Response.json({ candidates });
  } catch (err) {
    console.error("candidate generation failed", err);
    return Response.json({ error: "generation_failed" }, { status: 502 });
  }
}
