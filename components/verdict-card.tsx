import { Gauge, ShieldQuestion, TrendingUp, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Verdict } from "@/lib/types";

const VERDICT_META: Record<
  Verdict["verdict"],
  { label: string; variant: "success" | "accent" | "muted" }
> = {
  promising: { label: "Promising", variant: "success" },
  mixed: { label: "Mixed", variant: "accent" },
  risky: { label: "Risky", variant: "muted" },
};

function Signal({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 text-fg-muted">{icon}</div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs uppercase tracking-wide text-fg-muted">
          {label}
        </span>
        <span className="text-sm text-fg">{value}</span>
      </div>
    </div>
  );
}

export function VerdictCard({ verdict }: { verdict: Verdict }) {
  const meta = VERDICT_META[verdict.verdict];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>The verdict</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={meta.variant}>{meta.label}</Badge>
            <span className="flex items-center gap-1 text-sm font-semibold text-fg">
              <Gauge className="size-4 text-fg-muted" />
              {Math.round(verdict.score)}/100
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <p className="text-body text-fg">{verdict.summary}</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Signal
            icon={<TrendingUp className="size-4" />}
            label="Demand"
            value={verdict.demand}
          />
          <Signal
            icon={<Gauge className="size-4" />}
            label="Market size"
            value={verdict.marketSize}
          />
          <Signal
            icon={<Wallet className="size-4" />}
            label="Willingness to pay"
            value={verdict.willingnessToPay}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function VerdictSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-fg-muted">
          <ShieldQuestion className="size-5 animate-pulse" />
          Scoring your idea…
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted" />
        <div className="mt-2 grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
