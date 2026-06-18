import { z } from "zod";

import { requestCode } from "@/lib/verification";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
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
    return Response.json({ error: "invalid_email" }, { status: 400 });
  }

  try {
    const result = await requestCode(parsed.data.email);
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: 429 });
    }
    // Always return ok on success — never reveal whether the email is known.
    return Response.json({ ok: true });
  } catch (err) {
    console.error("verification code request failed", err);
    return Response.json({ error: "send_failed" }, { status: 502 });
  }
}
