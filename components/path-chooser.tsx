import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { INTENT_PATHS, type IntentPath } from "@/lib/landing-content";
import { cn } from "@/lib/utils";

/**
 * The two-path intent chooser — the heart of the unified front door. Renders
 * the two funnels (`/check`, `/find`) as large, equal-weight cards so the user
 * routes by intent. Single column < 768px (works at 380px), two columns above.
 */
export function PathChooser({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 md:gap-5", className)}>
      {INTENT_PATHS.map((path) => (
        <PathCard key={path.href} path={path} />
      ))}
    </div>
  );
}

function PathCard({ path }: { path: IntentPath }) {
  const Icon = path.icon;
  return (
    <Link
      href={path.href}
      className={cn(
        "group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-soft transition-all sm:p-8",
        "hover:-translate-y-0.5 hover:border-accent hover:shadow-soft",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-accent-soft opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
      />

      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-accent-soft text-accent transition-colors group-hover:bg-accent group-hover:text-accent-fg [&_svg]:size-5">
          <Icon />
        </span>
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
          {path.intent}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-heading font-semibold tracking-tight text-fg">
          {path.title}
        </h3>
        <p className="text-body text-fg-muted">{path.description}</p>
      </div>

      <ul className="flex flex-col gap-2">
        {path.bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2.5 text-sm text-fg">
            <Check className="mt-0.5 size-4 shrink-0 text-success" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>

      <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-accent">
        {path.cta}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
