import "server-only";

import { ideaHash } from "@/lib/hash";
import { getPreview, savePreview } from "@/lib/supabase";

const SOUL_ENDPOINT = "https://platform.higgsfield.ai/higgsfield-ai/soul/standard";

/** Whole-operation budget. On overrun we return null so the UI shows a fallback. */
const TOTAL_BUDGET_MS = 25_000;
const POLL_INTERVAL_MS = 2_000;

type GenInput = { idea: string; brandHints?: string };

function buildPrompt({ idea, brandHints }: GenInput): string {
  const brand =
    brandHints ??
    "modern SaaS landing hero, clean typography, soft shadows, violet accent (#6d5efc), light background, lots of whitespace";
  return [
    `Marketing hero image for the landing page of a startup: ${idea}.`,
    `Style: ${brand}.`,
    "Photorealistic product/brand visual, no text, no UI mockups, no logos, no watermark.",
    "Aspect 16:9, high quality.",
  ].join(" ");
}

function authHeader(): string | null {
  const key = process.env.HIGGSFIELD_API_KEY;
  const secret = process.env.HIGGSFIELD_SECRET;
  if (!key || !secret) return null;
  return `Key ${key}:${secret}`;
}

/** Pull a usable image URL out of a Higgsfield status/result payload. */
function extractImageUrl(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const obj = payload as Record<string, unknown>;

  const fromArray = (arr: unknown): string | null => {
    if (!Array.isArray(arr)) return null;
    for (const item of arr) {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        const u = (item as Record<string, unknown>).url;
        if (typeof u === "string") return u;
      }
    }
    return null;
  };

  return (
    fromArray(obj.images) ??
    fromArray(obj.results) ??
    fromArray(obj.output) ??
    (typeof obj.url === "string" ? (obj.url as string) : null)
  );
}

function getStatus(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const s = (payload as Record<string, unknown>).status;
  return typeof s === "string" ? s.toLowerCase() : null;
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("higgsfield_timeout")), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

async function runGeneration(input: GenInput, auth: string, deadline: number) {
  const submit = await fetch(SOUL_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      prompt: buildPrompt(input),
      num_images: 1,
      resolution: "2K",
      aspect_ratio: "16:9",
    }),
  });

  if (!submit.ok) throw new Error(`higgsfield_submit_${submit.status}`);
  const submitJson: unknown = await submit.json();

  // Some responses are immediately complete; otherwise poll the status URL.
  const immediate = extractImageUrl(submitJson);
  if (immediate) return immediate;

  const statusUrl =
    (submitJson as Record<string, unknown>)?.status_url ??
    (submitJson as Record<string, unknown>)?.status_link;
  if (typeof statusUrl !== "string") throw new Error("higgsfield_no_status_url");

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    const res = await fetch(statusUrl, {
      headers: { Authorization: auth, Accept: "application/json" },
    });
    if (!res.ok) continue;
    const json: unknown = await res.json();
    const status = getStatus(json);
    const url = extractImageUrl(json);
    if (url) return url;
    if (status === "failed" || status === "nsfw" || status === "canceled") {
      throw new Error(`higgsfield_${status}`);
    }
  }
  throw new Error("higgsfield_timeout");
}

/**
 * Generate (or return cached) landing-hero preview for an idea. Server-only,
 * cached by idea-hash to avoid re-billing, and time-boxed. Returns null on any
 * failure/timeout so callers can render a graceful fallback — never throws.
 */
export async function generatePreviewImage(
  idea: string,
  brandHints?: string,
): Promise<string | null> {
  const hash = ideaHash(idea);

  try {
    const cached = await getPreview(hash);
    if (cached) return cached;
  } catch {
    // Cache lookup failure shouldn't block generation.
  }

  const auth = authHeader();
  if (!auth) return null;

  const deadline = Date.now() + TOTAL_BUDGET_MS;
  try {
    const url = await withTimeout(
      runGeneration({ idea, brandHints }, auth, deadline),
      TOTAL_BUDGET_MS,
    );
    try {
      await savePreview(hash, url);
    } catch {
      // Persisting the cache is best-effort.
    }
    return url;
  } catch {
    return null;
  }
}
