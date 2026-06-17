import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { IdeaCheck } from "@/components/idea-check";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-full">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-sm font-semibold tracking-tight text-fg">
            Ventora Idea Check
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/styleguide"
              className="text-sm font-medium text-fg-muted transition-colors hover:text-fg"
            >
              Styleguide
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col items-start gap-10 px-6 py-24">
        <div className="flex max-w-2xl flex-col gap-5">
          <Badge variant="accent">
            <Sparkles />
            Free idea check
          </Badge>
          <h1 className="text-display font-semibold tracking-tight text-fg">
            Find out if your startup idea is worth building.
          </h1>
          <p className="text-body text-fg-muted">
            Describe your idea in one sentence. We evaluate demand, market size,
            and willingness to pay — then preview the product Ventora would build
            for you.
          </p>
        </div>

        <IdeaCheck />

        <a
          href="https://ventora.cc"
          className="text-sm font-medium text-fg-muted transition-colors hover:text-fg"
        >
          Build it for real at ventora.cc &rarr;
        </a>
      </main>
    </div>
  );
}
