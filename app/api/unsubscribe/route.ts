import { verifyUnsub } from "@/lib/email/links";
import { cancelScheduled } from "@/lib/resend";
import { getLeadForUnsub, markUnsubscribed } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * Verify the signed token, mark the lead unsubscribed, and cancel any pending
 * day-2/day-5 sends. Idempotent. Returns false only on a bad/invalid token.
 */
async function processUnsubscribe(
  emailRaw: string | null,
  token: string | null,
): Promise<boolean> {
  if (!emailRaw || !token) return false;
  const email = emailRaw.trim().toLowerCase();
  if (!verifyUnsub(email, token)) return false;

  const lead = await getLeadForUnsub(email);
  // Unknown email with a valid signature: treat as success (nothing to do).
  if (!lead) return true;

  if (!lead.unsubscribedAt) {
    await markUnsubscribed(email);
    await Promise.all(lead.scheduledEmailIds.map((id) => cancelScheduled(id)));
  }
  return true;
}

// RFC 8058 one-click unsubscribe — mail clients POST here directly.
export async function POST(request: Request) {
  const url = new URL(request.url);
  let email = url.searchParams.get("email");
  let token = url.searchParams.get("token");

  // Some clients send the params in the form body instead of the query string.
  if (!email || !token) {
    try {
      const form = await request.formData();
      email = email ?? (form.get("email") as string | null);
      token = token ?? (form.get("token") as string | null);
    } catch {
      // No form body — fall through to query-string values.
    }
  }

  const ok = await processUnsubscribe(email, token);
  return new Response(null, { status: ok ? 200 : 403 });
}

// Visible link in the email footer.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const ok = await processUnsubscribe(
    url.searchParams.get("email"),
    url.searchParams.get("token"),
  );

  const body = ok
    ? `<h1>You're unsubscribed</h1><p>You won't get any more emails from Ventora Idea Check.</p>`
    : `<h1>Invalid link</h1><p>This unsubscribe link is invalid or expired.</p>`;

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribe</title></head><body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#f5f5f5;color:#1a1a1a;"><div style="max-width:480px;margin:64px auto;padding:32px;background:#fff;border:1px solid #ebebeb;border-radius:12px;text-align:center;">${body}</div></body></html>`;

  return new Response(html, {
    status: ok ? 200 : 403,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
