"use client";

import { useEffect, useState } from "react";
import { ImageIcon, Loader2, Sparkles } from "lucide-react";

type PreviewState =
  | { status: "loading" }
  | { status: "ready"; url: string }
  | { status: "fallback" };

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-gradient-to-br from-muted to-surface">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
        <ImageIcon className="size-6" />
      </div>
      <span className="text-sm text-fg-muted">{label}</span>
    </div>
  );
}

export function PreviewCard({
  idea,
  headline,
  subhead,
}: {
  idea: string;
  headline: string;
  subhead: string;
}) {
  const [state, setState] = useState<PreviewState>({ status: "loading" });

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const res = await fetch("/api/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idea }),
        });
        const data: { imageUrl: string | null } = await res.json();
        if (!active) return;
        setState(
          data.imageUrl
            ? { status: "ready", url: data.imageUrl }
            : { status: "fallback" },
        );
      } catch {
        if (active) setState({ status: "fallback" });
      }
    })();

    return () => {
      active = false;
    };
  }, [idea]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
      <div className="relative">
        {state.status === "loading" ? (
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 bg-muted">
            <Loader2 className="size-6 animate-spin text-accent" />
            <span className="text-sm text-fg-muted">
              Rendering your product preview…
            </span>
          </div>
        ) : state.status === "ready" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={state.url}
            alt={`Landing concept for: ${idea}`}
            className="aspect-video w-full object-cover"
            onError={() => setState({ status: "fallback" })}
          />
        ) : (
          <Placeholder label="Preview is being crafted by Ventora" />
        )}
      </div>

      <div className="flex flex-col gap-2 p-6">
        <span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-accent">
          <Sparkles className="size-3.5" />
          Landing concept
        </span>
        <h4 className="text-heading font-semibold tracking-tight text-fg">
          {headline}
        </h4>
        <p className="text-sm text-fg-muted">{subhead}</p>
      </div>
    </div>
  );
}
