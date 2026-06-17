import { createHash } from "node:crypto";

/** Stable hash of an idea, used as the preview cache key. */
export function ideaHash(idea: string): string {
  const normalized = idea.trim().toLowerCase().replace(/\s+/g, " ");
  return createHash("sha256").update(normalized).digest("hex").slice(0, 32);
}
