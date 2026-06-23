import { Quote } from "lucide-react";

import { TESTIMONIALS, type Testimonial } from "@/lib/landing-content";

/** Social-proof row of illustrative quote cards. Stacks to one column < 768px. */
export function Testimonials() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {TESTIMONIALS.map((t) => (
        <TestimonialCard key={t.name} testimonial={t} />
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="flex h-full flex-col gap-5 rounded-2xl border border-border bg-surface p-6 shadow-soft">
      <Quote className="size-5 text-accent" aria-hidden />
      <blockquote className="flex-1 text-[15px] leading-relaxed text-fg">
        “{testimonial.quote}”
      </blockquote>
      <figcaption className="flex items-center gap-3 border-t border-border pt-4">
        <span className="flex size-9 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
          {testimonial.initial}
        </span>
        <span className="flex flex-col">
          <span className="text-sm font-semibold text-fg">
            {testimonial.name}
          </span>
          <span className="text-xs text-fg-muted">{testimonial.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}
