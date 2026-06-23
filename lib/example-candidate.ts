import type { Candidate } from "@/lib/types";

/**
 * Static sample fitted idea used to preview the Idea Finder OUTCOME before the
 * quiz starts. Mirrors the barber example in {@link EXAMPLE_EVALUATION} so the
 * teaser, the fitted card, and the full example report all tell one story.
 * Tagged "Example" wherever it renders — never generated, no API.
 */
export const EXAMPLE_CANDIDATE: Candidate = {
  id: "example-barber-booking",
  name: "ChairTime",
  oneLiner:
    "One-tap rebooking and no-show deposits built for solo barbers and their regulars.",
  fitsYou:
    "You already live in this workflow and have a niche audience who feels the pain — a textbook unfair-advantage wedge.",
  buildableInVentora:
    "A booking + payments web app with SMS reminders — shippable as a first version in days.",
  teaserScores: { fit: 91, feasibility: 84, profit: 78 },
};
