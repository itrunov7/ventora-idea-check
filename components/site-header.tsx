import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Shared top chrome with cross-funnel nav. `active` highlights the current route. */
export function SiteHeader({ active }: { active?: "check" | "find" }) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-4">
        <Link
          href="/check"
          className="text-sm font-semibold tracking-tight text-fg"
        >
          Ventora
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link
            href="/check"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              active === "check" && "bg-muted",
            )}
          >
            Check an idea
          </Link>
          <Link
            href="/find"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              active === "find" && "bg-muted",
            )}
          >
            Find an idea
          </Link>
          <Link
            href="https://ventora.cc"
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "hidden sm:inline-flex",
            )}
          >
            Build it for real at ventora.cc
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
