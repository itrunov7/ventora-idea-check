import { cn } from "@/lib/utils";

function Block({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-muted", className)} />;
}

/** Full-report skeleton shown while a real evaluation is generating. */
export function EvaluationSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface p-8 shadow-soft">
        <div className="grid gap-6 md:grid-cols-[1.45fr_1fr]">
          <div className="flex flex-col gap-4">
            <Block className="h-3 w-20" />
            <Block className="h-9 w-3/4" />
            <Block className="h-6 w-44" />
            <Block className="h-14 w-full" />
            <div className="grid grid-cols-3 gap-3.5 border-t border-border pt-5">
              <Block className="h-11" />
              <Block className="h-11" />
              <Block className="h-11" />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="size-[188px] animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Block className="h-56" />
        <Block className="h-56" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Block className="h-72" />
        <Block className="h-72" />
      </div>
      <Block className="h-52" />
      <Block className="h-44" />
    </div>
  );
}
