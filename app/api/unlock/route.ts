import { z } from "zod";

import { generateAdvancedReport } from "@/lib/ai";
import { ideaHash } from "@/lib/hash";
import { getLeadByEmail, insertLead } from "@/lib/supabase";

export const runtime = "nodejs";

const verdictSchema = z.object({
  score: z.number(),
  verdict: z.enum(["promising", "mixed", "risky"]),
  demand: z.string(),
  marketSize: z.string(),
  willingnessToPay: z.string(),
  summary: z.string(),
});

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  idea: z.string().trim().min(8).max(400),
  verdict: verdictSchema,
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
    const isEmail = parsed.error.issues.some((i) => i.path[0] === "email");
    return Response.json(
      { error: isEmail ? "invalid_email" : "invalid_input" },
      { status: 400 },
    );
  }

  const { email, idea, verdict } = parsed.data;

  // One free run per email.
  try {
    if (await getLeadByEmail(email)) {
      return Response.json({ error: "rate_limited" }, { status: 429 });
    }
  } catch (err) {
    console.error("lead lookup failed", err);
    return Response.json({ error: "store_unavailable" }, { status: 503 });
  }

  // Capture the lead before spending on heavy generation.
  const insert = await insertLead({ email, idea, verdict });
  if (!insert.ok) {
    if (insert.duplicate) {
      return Response.json({ error: "rate_limited" }, { status: 429 });
    }
    return Response.json({ error: "store_unavailable" }, { status: 503 });
  }

  try {
    const report = await generateAdvancedReport(idea, verdict);
    return Response.json({ report, ideaHash: ideaHash(idea) });
  } catch (err) {
    console.error("advanced report generation failed", err);
    return Response.json({ error: "generation_failed" }, { status: 502 });
  }
}
