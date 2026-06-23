"use client";

import { useState } from "react";

import { IdeaInputCard } from "@/components/idea-check";
import { useIdeaFlow } from "@/components/idea-experience";

/** Idea Check input slot: one-sentence idea fed straight into the shared flow. */
export function CheckInput() {
  const { onIdea, pending, error } = useIdeaFlow();
  const [idea, setIdea] = useState("");

  return (
    <IdeaInputCard
      idea={idea}
      onIdeaChange={setIdea}
      onSubmit={(e) => {
        e.preventDefault();
        onIdea(idea);
      }}
      pending={pending}
      error={error}
      className="w-full"
    />
  );
}
