import { z } from "zod";

import { generatePreviewImage } from "@/lib/higgsfield";

export const runtime = "nodejs";
// Preview generation polls Higgsfield; give the function room beyond the budget.
export const maxDuration = 60;

const bodySchema = z.object({
  idea: z.string().trim().min(8).max(400),
  brandHints: z.string().trim().max(400).optional(),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ imageUrl: null }, { status: 200 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ imageUrl: null }, { status: 200 });
  }

  // generatePreviewImage never throws — it returns null on any failure/timeout.
  const imageUrl = await generatePreviewImage(
    parsed.data.idea,
    parsed.data.brandHints,
  );
  return Response.json({ imageUrl });
}
