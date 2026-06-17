import { createHmac, timingSafeEqual } from "node:crypto";

import type { BuildFeature } from "@/lib/types";
import { buildVentoraHandoffUrl } from "@/lib/ventora";

export type NurtureCampaign = "day0" | "day2" | "day5";

/** Appends consistent nurture UTM params so signups can be attributed. */
export function withUtm(rawUrl: string, campaign: NurtureCampaign): string {
  const url = new URL(rawUrl);
  url.searchParams.set("utm_source", "email");
  url.searchParams.set("utm_medium", "nurture");
  url.searchParams.set("utm_campaign", campaign);
  url.searchParams.set("utm_content", "cta");
  return url.toString();
}

/** Build CTA link (handoff to the Ventora builder) tagged for attribution. */
export function ctaUrl(
  idea: string,
  features: BuildFeature[],
  campaign: NurtureCampaign,
): string {
  return withUtm(buildVentoraHandoffUrl(idea, features), campaign);
}

function unsubSecret(): string {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret) {
    throw new Error("Unsubscribe signing is not configured. Set UNSUBSCRIBE_SECRET.");
  }
  return secret;
}

/** Stateless HMAC token so unsubscribe links need no DB token lookup. */
export function signUnsub(email: string): string {
  return createHmac("sha256", unsubSecret())
    .update(email.trim().toLowerCase())
    .digest("hex");
}

export function verifyUnsub(email: string, token: string): boolean {
  const expected = signUnsub(email);
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function unsubscribeUrl(email: string, siteUrl: string): string {
  const url = new URL("/api/unsubscribe", siteUrl);
  url.searchParams.set("email", email);
  url.searchParams.set("token", signUnsub(email));
  return url.toString();
}
