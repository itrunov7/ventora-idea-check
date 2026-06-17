"use client";

import {
  AlertTriangle,
  Hammer,
  Lock,
  Route,
  Tag,
  Target,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailGate } from "@/components/email-gate";
import { PreviewCard } from "@/components/preview-card";
import type { AdvancedReport as AdvancedReportData } from "@/lib/types";

function SectionTitle({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-accent">{icon}</span>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-fg">
        {children}
      </h3>
    </div>
  );
}

function ReportBody({
  idea,
  report,
}: {
  idea: string;
  report: AdvancedReportData;
}) {
  const { validation, pathToFirstSale } = report;
  return (
    <div className="flex flex-col gap-8">
      <PreviewCard
        idea={idea}
        headline={report.landingHeadline}
        subhead={report.landingSubhead}
      />

      <section className="flex flex-col gap-4">
        <SectionTitle icon={<Hammer className="size-4" />}>
          What Ventora builds first
        </SectionTitle>
        <ol className="flex flex-col gap-3">
          {report.firstFiveFeatures.map((f, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
                {i + 1}
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-fg">{f.name}</span>
                <span className="text-sm text-fg-muted">{f.why}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-4">
        <SectionTitle icon={<Target className="size-4" />}>
          Validation signals
        </SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1 rounded-xl border border-border bg-muted/40 p-4">
            <span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-fg-muted">
              <Users className="size-3.5" />
              Market size
            </span>
            <span className="text-sm text-fg">{validation.marketSize}</span>
          </div>
          <div className="flex flex-col gap-1 rounded-xl border border-border bg-muted/40 p-4">
            <span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-fg-muted">
              <Tag className="size-3.5" />
              Suggested price
            </span>
            <span className="text-sm text-fg">{validation.suggestedPrice}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wide text-fg-muted">
            Competitor snapshot
          </span>
          <div className="flex flex-col gap-2">
            {validation.competitors.map((c, i) => (
              <div key={i} className="flex flex-wrap items-baseline gap-2">
                <Badge variant="outline">{c.name}</Badge>
                <span className="text-sm text-fg-muted">{c.note}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-4">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-fg-muted" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs uppercase tracking-wide text-fg-muted">
              Closest failure pattern
            </span>
            <span className="text-sm text-fg">
              {validation.closestFailurePattern}
            </span>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionTitle icon={<Route className="size-4" />}>
          Path to first sale
        </SectionTitle>
        <div className="grid grid-cols-3 gap-3">
          <Stat value={pathToFirstSale.visitors.toLocaleString()} label="Visitors" />
          <Stat value={`${pathToFirstSale.conversionRate}%`} label="Conversion" />
          <Stat value={`~${pathToFirstSale.days}d`} label="To first sale" />
        </div>
        <p className="text-sm text-fg-muted">{pathToFirstSale.narrative}</p>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-surface p-4 text-center">
      <span className="text-heading font-semibold text-fg">{value}</span>
      <span className="text-xs uppercase tracking-wide text-fg-muted">
        {label}
      </span>
    </div>
  );
}

/** Non-readable teaser shown behind the email gate. */
function LockedTeaser() {
  return (
    <div
      aria-hidden
      className="pointer-events-none select-none blur-sm"
    >
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

export function AdvancedReport({
  idea,
  report,
  pending,
  errorCode,
  onUnlock,
}: {
  idea: string;
  report: AdvancedReportData | null;
  pending: boolean;
  errorCode: string | null;
  onUnlock: (email: string) => void;
}) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          {report ? (
            <Badge variant="success">Unlocked</Badge>
          ) : (
            <Badge variant="accent">
              <Lock className="size-3" />
              Locked
            </Badge>
          )}
          <CardTitle>Advanced report + product preview</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {report ? (
          <ReportBody idea={idea} report={report} />
        ) : (
          <div className="relative">
            <LockedTeaser />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface/90 p-6 text-center shadow-soft backdrop-blur-sm">
                <p className="max-w-sm text-sm text-fg-muted">
                  See the first features Ventora would build, a rendered landing
                  preview, validation signals, and your path to first sale.
                </p>
                <EmailGate
                  pending={pending}
                  errorCode={errorCode}
                  onSubmit={onUnlock}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
