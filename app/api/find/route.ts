import { z } from "zod";

import { generateIdeaFromProfile } from "@/lib/ai";

export const runtime = "nodejs";
// Idea discovery is a single AI call; give it headroom past the default.
export const maxDuration = 60;

const bodySchema = z.object({
  skills: z.string().trim().min(3).max(400),
  interests: z.string().trim().min(3).max(400),
  constraints: z.string().trim().max(400).optional(),
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
    return Response.json({ error: "invalid_profile" }, { status: 400 });
  }

  try {
    const idea = await generateIdeaFromProfile(parsed.data);
    return Response.json({ idea });
  } catch (err) {
    console.error("idea discovery failed", err);
    return Response.json({ error: "generation_failed" }, { status: 502 });
  }
}
