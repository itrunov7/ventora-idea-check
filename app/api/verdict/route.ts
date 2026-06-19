import { z } from "zod";

import { generateVerdict } from "@/lib/ai";

export const runtime = "nodejs";
// AI verdict generation can run several seconds; give it headroom past the default.
export const maxDuration = 60;

const bodySchema = z.object({
  idea: z.string().trim().min(8).max(400),
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
    return Response.json({ error: "invalid_idea" }, { status: 400 });
  }

  try {
    const verdict = await generateVerdict(parsed.data.idea);
    return Response.json({ verdict });
  } catch (err) {
    console.error("verdict generation failed", err);
    return Response.json({ error: "generation_failed" }, { status: 502 });
  }
}
