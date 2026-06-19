import { z } from "zod";

import { generateEvaluation } from "@/lib/ai";
import { ideaHash } from "@/lib/hash";
import { enqueueNurture } from "@/lib/nurture";
import { REPORT_WINDOW_MS, REPORTS_PER_WINDOW } from "@/lib/otp";
import {
  countReportRunsSince,
  getLeadRecord,
  insertReportRun,
  updateLeadNurture,
  upsertLeadReport,
} from "@/lib/supabase";
import { verifyCode } from "@/lib/verification";

export const runtime = "nodejs";
// Full report generation plus DB writes and nurture enqueue; give it headroom.
export const maxDuration = 60;

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
  code: z.string().trim().regex(/^\d{6}$/),
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
    const isCode = parsed.error.issues.some((i) => i.path[0] === "code");
    return Response.json(
      {
        error: isEmail
          ? "invalid_email"
          : isCode
            ? "code_invalid"
            : "invalid_input",
      },
      { status: 400 },
    );
  }

  const { email, code, idea, verdict } = parsed.data;

  // Gate everything behind a verified one-time code.
  const verification = await verifyCode(email, code);
  if (!verification.ok) {
    return Response.json({ error: verification.error }, { status: 401 });
  }

  // Returning verified user with a saved report for this same idea: hand it
  // back instead of re-billing or re-running the nurture sequence.
  let existing;
  try {
    existing = await getLeadRecord(email);
  } catch (err) {
    console.error("lead lookup failed", err);
    return Response.json({ error: "store_unavailable" }, { status: 503 });
  }

  const isReturningLead = existing !== null;

  if (
    existing?.report &&
    ideaHash(existing.idea) === ideaHash(idea)
  ) {
    return Response.json({
      evaluation: existing.report,
      ideaHash: ideaHash(idea),
    });
  }

  // Cap new report generations per confirmed email on a rolling window. Cache
  // hits above return early, so re-viewing the same report is always free.
  try {
    const since = new Date(Date.now() - REPORT_WINDOW_MS).toISOString();
    const used = await countReportRunsSince(email, since);
    if (used >= REPORTS_PER_WINDOW) {
      return Response.json({ error: "weekly_limit" }, { status: 429 });
    }
  } catch (err) {
    console.error("report limit check failed", err);
    return Response.json({ error: "store_unavailable" }, { status: 503 });
  }

  let evaluation;
  try {
    evaluation = await generateEvaluation(idea);
  } catch (err) {
    console.error("evaluation generation failed", err);
    return Response.json({ error: "generation_failed" }, { status: 502 });
  }

  try {
    await upsertLeadReport({ email, idea, verdict, report: evaluation });
  } catch (err) {
    console.error("lead persist failed", err);
  }

  // Record usage against the weekly cap (only for freshly generated reports).
  try {
    await insertReportRun(email, ideaHash(idea));
  } catch (err) {
    console.error("report run log failed", err);
  }

  // First-time leads enter the nurture sequence. Returning users are already in
  // it (or opted out), so we don't re-enqueue and spam them.
  if (!isReturningLead) {
    try {
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
      const scheduledEmailIds = await enqueueNurture({
        email,
        idea,
        evaluation,
        siteUrl,
      });
      await updateLeadNurture(email, { evaluation, scheduledEmailIds });
    } catch (err) {
      console.error("nurture enqueue/persist failed", err);
    }
  }

  return Response.json({ evaluation, ideaHash: ideaHash(idea) });
}
