import "server-only";

import { Resend } from "resend";

let client: Resend | null = null;

/**
 * Lazy Resend client. Server-only — the API key must never reach the browser.
 * Created on first use so a missing key during build doesn't crash module load.
 */
function getClient(): Resend {
  if (client) return client;

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("Resend is not configured. Set RESEND_API_KEY.");
  }
  client = new Resend(key);
  return client;
}

function getFrom(): string {
  const from = process.env.RESEND_FROM;
  if (!from) {
    throw new Error("Resend sender is not configured. Set RESEND_FROM.");
  }
  return from;
}

export type SendNurtureEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
  /** ISO 8601 or natural language (e.g. "in 1 min"). Omit to send now. */
  scheduledAt?: string;
};

/** Sends (or schedules) one nurture email and returns the Resend email id. */
export async function sendNurtureEmail(
  input: SendNurtureEmailInput,
): Promise<string> {
  const { data, error } = await getClient().emails.send({
    from: getFrom(),
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
    headers: input.headers,
    scheduledAt: input.scheduledAt,
  });

  if (error) {
    throw new Error(`Resend send failed: ${error.message}`);
  }
  if (!data?.id) {
    throw new Error("Resend send returned no email id.");
  }
  return data.id;
}

/** Best-effort cancel of a scheduled email. Never throws. */
export async function cancelScheduled(id: string): Promise<void> {
  try {
    await getClient().emails.cancel(id);
  } catch (err) {
    console.error(`Resend cancel failed for ${id}`, err);
  }
}
