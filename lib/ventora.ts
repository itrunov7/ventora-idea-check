// Confirm exact base URL + param names with the Ventora app before launch.
const BUILD_ENTRY_URL =
  process.env.NEXT_PUBLIC_VENTORA_BUILD_URL ?? "https://ventora.cc/build";

/** Handoff link into the Ventora builder, carrying the idea for prefill. */
export function buildVentoraHandoffUrl(idea: string): string {
  const url = new URL(BUILD_ENTRY_URL);
  url.searchParams.set("idea", idea);
  url.searchParams.set("source", "idea-check");
  return url.toString();
}
