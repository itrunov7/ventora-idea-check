import type { WhyItFitsYou } from "@/lib/types";

// Confirm exact base URL + param names with the Ventora app before launch.
const BUILD_ENTRY_URL =
  process.env.NEXT_PUBLIC_VENTORA_BUILD_URL ?? "https://ventora.cc/build";

type HandoffOptions = {
  /** Finder "why this fits you" context, carried so the builder can prefill it. */
  whyItFitsYou?: WhyItFitsYou;
};

/** Handoff link into the Ventora builder, carrying the idea for prefill. */
export function buildVentoraHandoffUrl(
  idea: string,
  opts?: HandoffOptions,
): string {
  const url = new URL(BUILD_ENTRY_URL);
  url.searchParams.set("idea", idea);
  url.searchParams.set("source", "idea-check");
  if (opts?.whyItFitsYou) {
    url.searchParams.set("context", JSON.stringify(opts.whyItFitsYou));
  }
  return url.toString();
}
