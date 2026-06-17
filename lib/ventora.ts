import type { BuildFeature } from "@/lib/types";

// Confirm exact base URL + param names with the Ventora app before launch.
const BUILD_ENTRY_URL =
  process.env.NEXT_PUBLIC_VENTORA_BUILD_URL ?? "https://ventora.cc/build";

export function buildVentoraHandoffUrl(
  idea: string,
  features: BuildFeature[],
): string {
  const url = new URL(BUILD_ENTRY_URL);
  url.searchParams.set("idea", idea);
  // Full {name, why} so nothing is dropped in transit.
  url.searchParams.set("features", JSON.stringify(features));
  url.searchParams.set("source", "idea-check");
  return url.toString();
}
