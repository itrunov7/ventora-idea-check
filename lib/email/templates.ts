import type { AdvancedReport, Verdict } from "@/lib/types";

export type EmailContent = {
  subject: string;
  html: string;
  text: string;
};

/** Per-recipient links resolved by the orchestrator (already UTM-tagged). */
export type TemplateLinks = {
  build: string;
  unsubscribe: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Inline styles only, single column, system fonts — renders fast everywhere and
// survives the major email clients that strip <style> blocks.
const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;padding:14px 28px;border-radius:8px;font-family:${FONT}">${label}</a>`;
}

function layout(inner: string, unsubscribeUrl: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f5f5f5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #ebebeb;">
<tr><td style="padding:32px;font-family:${FONT};color:#1a1a1a;font-size:16px;line-height:1.5;">
${inner}
</td></tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="padding:16px 32px;font-family:${FONT};color:#999999;font-size:12px;line-height:1.5;text-align:center;">
Ventora Idea Check &middot; You got this email because you ran an idea check.<br>
<a href="${unsubscribeUrl}" style="color:#999999;text-decoration:underline;">Unsubscribe</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

/** Day 0 — report recap with the primary build CTA. */
export function recap(
  verdict: Verdict,
  report: AdvancedReport,
  links: TemplateLinks,
): EmailContent {
  const subject = `Your idea check: ${verdict.score}/100`;

  const features = report.firstFiveFeatures
    .slice(0, 3)
    .map(
      (f) =>
        `<li style="margin-bottom:6px;"><strong>${escapeHtml(f.name)}</strong> — ${escapeHtml(f.why)}</li>`,
    )
    .join("");

  const inner = `
<p style="margin:0 0 8px;font-size:14px;color:#777;">Your verdict</p>
<h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;">${verdict.score}/100 &middot; ${escapeHtml(verdict.verdict)}</h1>
<p style="margin:0 0 24px;">${escapeHtml(verdict.summary)}</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border-collapse:collapse;">
<tr><td style="padding:8px 0;border-top:1px solid #eee;"><strong>Demand</strong></td><td style="padding:8px 0;border-top:1px solid #eee;">${escapeHtml(verdict.demand)}</td></tr>
<tr><td style="padding:8px 0;border-top:1px solid #eee;"><strong>Market size</strong></td><td style="padding:8px 0;border-top:1px solid #eee;">${escapeHtml(verdict.marketSize)}</td></tr>
<tr><td style="padding:8px 0;border-top:1px solid #eee;border-bottom:1px solid #eee;"><strong>Willingness to pay</strong></td><td style="padding:8px 0;border-top:1px solid #eee;border-bottom:1px solid #eee;">${escapeHtml(verdict.willingnessToPay)}</td></tr>
</table>

<h2 style="margin:0 0 8px;font-size:18px;">First features to build</h2>
<ul style="margin:0 0 24px;padding-left:20px;">${features}</ul>

<h2 style="margin:0 0 8px;font-size:18px;">Path to first sale</h2>
<p style="margin:0 0 24px;">${escapeHtml(report.pathToFirstSale.narrative)}</p>

<p style="margin:0 0 24px;">${button(links.build, "Build this idea")}</p>
<p style="margin:0;color:#777;font-size:14px;">Most ideas die in a doc. Yours doesn't have to.</p>
`;

  const text = `Your idea check: ${verdict.score}/100 (${verdict.verdict})

${verdict.summary}

Demand: ${verdict.demand}
Market size: ${verdict.marketSize}
Willingness to pay: ${verdict.willingnessToPay}

First features to build:
${report.firstFiveFeatures
  .slice(0, 3)
  .map((f) => `- ${f.name}: ${f.why}`)
  .join("\n")}

Path to first sale: ${report.pathToFirstSale.narrative}

Build this idea: ${links.build}

Unsubscribe: ${links.unsubscribe}`;

  return { subject, html: layout(inner, links.unsubscribe), text };
}

/** Day 2 — social proof / momentum. */
export function shipped(idea: string, links: TemplateLinks): EmailContent {
  const subject = "Founders shipped these in 48h";

  const inner = `
<h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;">Founders shipped these in 48 hours</h1>
<p style="margin:0 0 16px;">While your idea sat in your notes, other founders went from a one-line idea to a live product over a weekend — landing page, working app, first users.</p>
<p style="margin:0 0 24px;">The gap between them and you isn't talent. It's that they started. Yours — "${escapeHtml(idea)}" — is one click from the same path.</p>
<p style="margin:0 0 24px;">${button(links.build, "Ship yours this week")}</p>
<p style="margin:0;color:#777;font-size:14px;">It takes minutes to start. Momentum does the rest.</p>
`;

  const text = `Founders shipped these in 48 hours

While your idea sat in your notes, other founders went from a one-line idea to a live product over a weekend — landing page, working app, first users.

The gap isn't talent. It's that they started. Your idea — "${idea}" — is one click from the same path.

Ship yours this week: ${links.build}

Unsubscribe: ${links.unsubscribe}`;

  return { subject, html: layout(inner, links.unsubscribe), text };
}

/** Day 5 — reactivation. */
export function waiting(idea: string, links: TemplateLinks): EmailContent {
  const subject = "Your idea is still waiting -> build it";

  const inner = `
<h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;">Your idea is still waiting</h1>
<p style="margin:0 0 16px;">"${escapeHtml(idea)}" got a verdict five days ago. Since then: nothing has changed for it.</p>
<p style="margin:0 0 24px;">That's the default outcome for most ideas — not because they're bad, but because no one builds them. Be the exception. You already did the hard part: deciding it's worth it.</p>
<p style="margin:0 0 24px;">${button(links.build, "Build it now")}</p>
<p style="margin:0;color:#777;font-size:14px;">Last nudge from us — your idea deserves a shot.</p>
`;

  const text = `Your idea is still waiting

"${idea}" got a verdict five days ago. Since then: nothing has changed for it.

That's the default outcome for most ideas — not because they're bad, but because no one builds them. Be the exception.

Build it now: ${links.build}

Unsubscribe: ${links.unsubscribe}`;

  return { subject, html: layout(inner, links.unsubscribe), text };
}
