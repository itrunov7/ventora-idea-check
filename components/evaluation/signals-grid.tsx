import { Check, TriangleAlert } from "lucide-react";

import type { Signal } from "@/lib/types";
import { cn } from "@/lib/utils";

function SignalList({
  items,
  tone,
}: {
  items: Signal[];
  tone: "green" | "red";
}) {
  const green = tone === "green";
  const Icon = green ? Check : TriangleAlert;
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft md:p-8">
      <div className="mb-1.5 flex items-center gap-2.5">
        <span
          className={cn(
            "rounded-md px-2.5 py-1 font-mono text-[11px] font-semibold",
            green ? "bg-success-soft text-success" : "bg-danger-soft text-danger",
          )}
        >
          {green ? "Green lights" : "Red flags"}
        </span>
        <h3 className="text-base font-semibold text-fg">
          {green ? "Wind behind it" : "What could kill it"}
        </h3>
      </div>
      <ul className="mt-3.5 flex flex-col gap-3.5">
        {items.map((s, i) => (
          <li key={i} className="flex gap-3 text-[14.5px] leading-snug text-fg">
            <Icon
              className={cn(
                "mt-0.5 size-[18px] shrink-0",
                green ? "text-success" : "text-danger",
              )}
            />
            <span>
              {s.text}
              <span className="ml-1.5 inline-block whitespace-nowrap rounded-md border border-border bg-muted px-1.5 py-0.5 align-middle font-mono text-[10px] font-semibold tracking-wide text-fg-muted">
                {s.tag}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SignalsGrid({
  greenLights,
  redFlags,
}: {
  greenLights: Signal[];
  redFlags: Signal[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SignalList items={greenLights} tone="green" />
      <SignalList items={redFlags} tone="red" />
    </div>
  );
}
