import { z } from "zod";

import { enqueueNurture } from "@/lib/nurture";
import type { AdvancedReport, Verdict } from "@/lib/types";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  idea: z.string().trim().min(8).max(400).optional(),
});

const SAMPLE_VERDICT: Verdict = {
  score: 78,
  verdict: "promising",
  demand: "Steady search volume from indie founders validating ideas weekly.",
  marketSize: "Tens of thousands of would-be founders per month.",
  willingnessToPay: "$20-40/mo for a tool that shortcuts validation + build.",
  summary:
    "Clear pain, cheap to test, and a natural path from check to build. Differentiation is the main risk.",
};

const SAMPLE_REPORT: AdvancedReport = {
  firstFiveFeatures: [
    { name: "Idea input + instant verdict", why: "Hook users in under 10 seconds." },
    { name: "Advanced report", why: "The payoff that earns the email." },
    { name: "One-click build handoff", why: "Convert intent into a real project." },
  ],
  landingHeadline: "Check your startup idea in 10 seconds",
  landingSubhead: "Honest AI verdict, then build it for real.",
  validation: {
    marketSize: "Tens of thousands of would-be founders per month.",
    competitors: [{ name: "Generic AI chat", note: "No build path." }],
    suggestedPrice: "$29/mo",
    closestFailurePattern: "Validation tools that stop at a score.",
  },
  pathToFirstSale: {
    visitors: 1000,
    conversionRate: 0.03,
    days: 30,
    narrative:
      "Ship the landing page, drive 1k visitors from founder communities, convert ~3% to paid in the first month.",
  },
};

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
    verdict: SAMPLE_VERDICT,
    report: SAMPLE_REPORT,
    siteUrl,
    immediate: true,
  });

  return Response.json({ ok: true, scheduledEmailIds });
}
