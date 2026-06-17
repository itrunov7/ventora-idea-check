import Link from "next/link";
import { ArrowUpRight, Check, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";

const colorTokens = [
  { name: "bg", className: "bg-bg" },
  { name: "surface", className: "bg-surface" },
  { name: "muted", className: "bg-muted" },
  { name: "border", className: "bg-border" },
  { name: "fg", className: "bg-fg" },
  { name: "fg-muted", className: "bg-fg-muted" },
  { name: "accent", className: "bg-accent" },
  { name: "accent-hover", className: "bg-accent-hover" },
  { name: "success", className: "bg-success" },
];

const typeTokens = [
  { name: "display", className: "text-display font-semibold", sample: "Build it for real" },
  { name: "heading", className: "text-heading font-semibold", sample: "Idea looks promising" },
  { name: "body", className: "text-body", sample: "Describe your idea and Ventora previews the product." },
];

const spacingTokens = ["1", "2", "4", "6", "8", "12"];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-heading font-semibold tracking-tight text-fg">
          {title}
        </h2>
        {description ? (
          <p className="text-sm text-fg-muted">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export default function StyleguidePage() {
  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-10 border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm font-semibold tracking-tight text-fg">
              Ventora Idea Check
            </Link>
            <Badge variant="muted">Styleguide</Badge>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-16 px-6 py-14">
        <div className="flex flex-col gap-3">
          <Badge variant="accent">
            <Sparkles />
            Design system
          </Badge>
          <h1 className="text-display font-semibold tracking-tight text-fg">
            Primitives & tokens
          </h1>
          <p className="max-w-xl text-body text-fg-muted">
            Every UI primitive and design token rendered in one place. Toggle the
            theme in the top-right to verify light and dark.
          </p>
        </div>

        <Section
          title="Colors"
          description="One accent (violet) plus a neutral scale. All theme-aware."
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {colorTokens.map((token) => (
              <div key={token.name} className="flex flex-col gap-2">
                <div
                  className={`h-16 w-full rounded-xl border border-border ${token.className}`}
                />
                <code className="text-xs text-fg-muted">{token.name}</code>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Typography"
          description="A restrained scale: body plus two heading sizes."
        >
          <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6">
            {typeTokens.map((token) => (
              <div key={token.name} className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-fg-muted">
                  {token.name}
                </span>
                <p className={`${token.className} text-fg`}>{token.sample}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Spacing"
          description="Generous, consistent spacing scale."
        >
          <div className="flex flex-wrap items-end gap-6">
            {spacingTokens.map((step) => (
              <div key={step} className="flex flex-col items-center gap-2">
                <div
                  className="rounded-md bg-accent"
                  style={{ width: `var(--spacing-${step}, ${Number(step) * 0.25}rem)`, height: "2rem" }}
                />
                <code className="text-xs text-fg-muted">{step}</code>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Buttons" description="Four variants, three sizes.">
          <div className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-6">
            <div className="flex flex-wrap items-center gap-3">
              <Button>Build my idea</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button>
                Continue to Ventora
                <ArrowUpRight />
              </Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </Section>

        <Section title="Badges" description="Status and label variants.">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-6">
            <Badge>Default</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="muted">Muted</Badge>
            <Badge variant="success">
              <Check />
              Verified
            </Badge>
          </div>
        </Section>

        <Section title="Inputs" description="Text fields with focus rings.">
          <div className="grid max-w-md gap-4 rounded-2xl border border-border bg-surface p-6">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="idea" className="text-sm font-medium text-fg">
                Your idea
              </label>
              <Input id="idea" placeholder="An app that helps freelancers get paid faster" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-fg">
                Email
              </label>
              <Input id="email" type="email" placeholder="you@startup.com" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="disabled" className="text-sm font-medium text-fg-muted">
                Disabled
              </label>
              <Input id="disabled" placeholder="Unavailable" disabled />
            </div>
          </div>
        </Section>

        <Section title="Cards" description="Rounded-2xl surfaces with subtle shadow.">
          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Idea Check</CardTitle>
                <CardDescription>
                  We score demand, market size, and willingness to pay.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="success">
                    <Check />
                    Large market
                  </Badge>
                  <Badge variant="muted">Freelancers</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button size="sm">See the preview</Button>
                <Button size="sm" variant="ghost">
                  Learn more
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What Ventora builds</CardTitle>
                <CardDescription>
                  A working product, landing page, payments, and ads.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-fg-muted">
                  This card uses only design tokens — no external images, no
                  placeholder media.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="outline">
                  Continue
                  <ArrowUpRight />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </Section>
      </main>
    </div>
  );
}
