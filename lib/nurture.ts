import "server-only";

import { ctaUrl, unsubscribeUrl } from "@/lib/email/links";
import { recap, recapFind, shipped, waiting } from "@/lib/email/templates";
import { sendNurtureEmail } from "@/lib/resend";
import type { LeadSource } from "@/lib/supabase";
import type { Evaluation } from "@/lib/types";

const DAY = 24 * 60 * 60 * 1000;

export type EnqueueNurtureInput = {
  email: string;
  idea: string;
  evaluation: Evaluation;
  /** Absolute origin used to build unsubscribe + link targets. */
  siteUrl: string;
  /** Funnel the lead came from — selects the day-0 copy angle. */
  source?: LeadSource;
  /**
   * Compress the schedule so day-2/day-5 fire in ~1 min — used by the forced
   * test trigger to verify the full sequence without waiting days.
   */
  immediate?: boolean;
};

/**
 * RFC 8058 one-click unsubscribe headers. The https target must accept POST.
 */
function unsubHeaders(unsubUrl: string): Record<string, string> {
  return {
    "List-Unsubscribe": `<${unsubUrl}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

/**
 * Sends the day-0 recap immediately and schedules the day-2 / day-5 follow-ups
 * via Resend's native scheduling. Returns the scheduled email ids so they can be
 * cancelled on unsubscribe. Returns [] if sending fails (never throws).
 */
export async function enqueueNurture(
  input: EnqueueNurtureInput,
): Promise<string[]> {
  const { email, idea, evaluation, siteUrl, source, immediate } = input;

  const unsubUrl = unsubscribeUrl(email, siteUrl);
  const headers = unsubHeaders(unsubUrl);

  // Finder leads get the "your fitted idea is waiting" angle; check uses recap.
  const day0Template = source === "find" ? recapFind : recap;
  const day0 = day0Template(evaluation, {
    build: ctaUrl(idea, "day0"),
    unsubscribe: unsubUrl,
  });
  const day2 = shipped(idea, {
    build: ctaUrl(idea, "day2"),
    unsubscribe: unsubUrl,
  });
  const day5 = waiting(idea, {
    build: ctaUrl(idea, "day5"),
    unsubscribe: unsubUrl,
  });

  const now = Date.now();
  const day2At = immediate ? "in 1 min" : new Date(now + 2 * DAY).toISOString();
  const day5At = immediate ? "in 1 min" : new Date(now + 5 * DAY).toISOString();

  try {
    // Day 0 sends now; failure here means the lead never entered the sequence,
    // so we bail rather than schedule orphan follow-ups.
    await sendNurtureEmail({
      to: email,
      subject: day0.subject,
      html: day0.html,
      text: day0.text,
      headers,
    });
  } catch (err) {
    console.error("nurture day-0 send failed", err);
    return [];
  }

  const scheduledIds: string[] = [];
  for (const [label, email_, at] of [
    ["day-2", day2, day2At],
    ["day-5", day5, day5At],
  ] as const) {
    try {
      const id = await sendNurtureEmail({
        to: email,
        subject: email_.subject,
        html: email_.html,
        text: email_.text,
        headers,
        scheduledAt: at,
      });
      scheduledIds.push(id);
    } catch (err) {
      console.error(`nurture ${label} schedule failed`, err);
    }
  }

  return scheduledIds;
}
