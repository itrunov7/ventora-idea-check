"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/** Reveal-on-scroll wrapper. Static (no animation) under prefers-reduced-motion. */
export function Reveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce || !("IntersectionObserver" in window)) {
      const raf = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(raf);
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none",
        shown ? "translate-y-0 opacity-100" : "translate-y-3.5 opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
