import { z } from "zod";

import { EXAMPLE_EVALUATION } from "@/lib/example-evaluation";
import { enqueueNurture } from "@/lib/nurture";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  idea: z.string().trim().min(8).max(400).optional(),
});

/**
 * Forced test trigger. Sends all 3 nurture emails on a compressed schedule
 * (day-0 now, day-2/day-5 in ~1 min) so delivery, UTM links, and unsubscribe
 * can be verified without waiting days. Guarded by NURTURE_TEST_SECRET.
 */
export async function POST(request: Request) {
  const secret = process.env.NURTURE_TEST_SECRET;
  if (!secret) {
    return Response.json({ error: "not_configured" }, { status: 503 });
  }
  if (request.headers.get("x-nurture-secret") !== secret) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "invalid_input" }, { status: 400 });
  }

  const { email, idea } = parsed.data;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;

  const scheduledEmailIds = await enqueueNurture({
    email,
    idea: idea ?? "an AI tool that validates startup ideas",
    evaluation: EXAMPLE_EVALUATION,
    siteUrl,
    immediate: true,
  });

  return Response.json({ ok: true, scheduledEmailIds });
}
