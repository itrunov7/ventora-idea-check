"use client";

import { ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function IdeaInputCard({
  idea,
  onIdeaChange,
  onSubmit,
  pending,
  error,
  className,
}: {
  idea: string;
  onIdeaChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  pending: boolean;
  error: string | null;
  className?: string;
}) {
  const canSubmit = idea.trim().length >= 8 && !pending;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Describe your idea</CardTitle>
        <CardDescription>
          No business plan. No technical details. Just one sentence.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
          <Input
            id="idea-input"
            className="h-12 text-base"
            placeholder="An app that helps freelancers track invoices"
            aria-label="Your startup idea"
            value={idea}
            disabled={pending}
            onChange={(e) => onIdeaChange(e.target.value)}
          />
          <Button
            type="submit"
            size="lg"
            className="shrink-0"
            disabled={!canSubmit}
          >
            {pending ? (
              <>
                <Loader2 className="animate-spin" />
                Checking…
              </>
            ) : (
              <>
                Check my idea
                <ArrowRight />
              </>
            )}
          </Button>
        </form>
        <p className="font-mono text-[12px] text-fg-muted">
          Free · instant · no signup to start
        </p>
        {error ? (
          <p className="text-sm text-fg-muted" role="alert">
            {error}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
