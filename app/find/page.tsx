import { Compass } from "lucide-react";

import { ExampleFittedIdea } from "@/components/example-fitted-idea";
import { FinderInput } from "@/components/finder-input";
import { IdeaExperience } from "@/components/idea-experience";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";

export default function FindPage() {
  return (
    <div className="min-h-full">
      <SiteHeader active="find" />

      <main className="mx-auto max-w-[1100px] px-6 py-10 lg:py-16">
        <IdeaExperience
          source="find"
          compactLabel="Your idea finder"
          input={<FinderInput />}
          aside={<ExampleFittedIdea />}
          hero={{
            badge: (
              <Badge variant="accent" className="self-start">
                <Compass />
                Free idea finder
              </Badge>
            ),
            title: "Don't have an idea yet? We'll find one for you.",
            description:
              "Tell us your skills and interests. We surface a startup idea tailored to you, evaluate its demand, market size, and willingness to pay — then preview the product Ventora would build for you.",
          }}
        />
      </main>
    </div>
  );
}
