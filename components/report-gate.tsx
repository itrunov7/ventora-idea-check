import { Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailGate } from "@/components/email-gate";
import { EvaluationSkeleton } from "@/components/evaluation/skeletons";

/** Non-readable teaser shown behind the email gate. */
function LockedTeaser() {
  return (
    <div aria-hidden className="pointer-events-none select-none blur-sm">
      <div className="flex flex-col gap-6 opacity-60">
        <div className="aspect-video w-full rounded-2xl bg-gradient-to-br from-accent/20 via-muted to-surface" />
        <div className="flex flex-col gap-3">
          {[90, 75, 82, 68, 78].map((w, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="size-6 shrink-0 rounded-full bg-accent/20" />
              <div
                className="h-4 rounded-md bg-muted"
                style={{ width: `${w}%` }}
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Email gate guarding the full evaluation. Pre-submit shows a blurred teaser +
 * the email form; while generating it shows the report skeleton.
 */
export function ReportGate({
  pending,
  errorCode,
  onUnlock,
}: {
  pending: boolean;
  errorCode: string | null;
  onUnlock: (email: string) => void;
}) {
  if (pending) return <EvaluationSkeleton />;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge variant="accent">
            <Lock className="size-3" />
            Locked
          </Badge>
          <CardTitle>Your full evaluation</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <LockedTeaser />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface/90 p-6 text-center shadow-soft backdrop-blur-sm">
              <p className="max-w-sm text-sm text-fg-muted">
                Get your full evaluation — verdict, signals, market sizing,
                competitors, pricing, and the path to building it.
              </p>
              <EmailGate
                pending={pending}
                errorCode={errorCode}
                onSubmit={onUnlock}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
