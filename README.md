# Ventora Idea Check

Validate a startup idea in seconds. Users submit an idea, get an AI verdict
(score + demand/market/willingness-to-pay), then unlock a full report behind an
email one-time code. Captured leads enter an automated nurture email sequence.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Supabase,
OpenAI (via the AI SDK), Higgsfield (product preview images), and Resend (email).

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

- `app/page.tsx` — landing + idea submission flow.
- `app/api/verdict` — generates the quick AI verdict.
- `app/api/unlock` — verifies the OTP, generates the full report, enqueues nurture.
- `app/api/unlock/code` — issues email verification codes.
- `app/api/preview` — Higgsfield product preview image (graceful fallback on failure).
- `app/api/unsubscribe` — one-click unsubscribe via signed HMAC token.
- `lib/*` — AI, Supabase, Resend, Higgsfield, hashing, and nurture logic (all server-only).

## Environment variables

All variables are **server-only** unless prefixed with `NEXT_PUBLIC_`. See
[`.env.example`](.env.example) for the full annotated list.

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Text generation (verdict + report). |
| `OPENAI_MODEL` | Model override (defaults to `gpt-5.4`). |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Lead capture + image/report cache (service role, bypasses RLS). |
| `RESEND_API_KEY` / `RESEND_FROM` | Nurture email delivery. |
| `HIGGSFIELD_API_KEY` / `HIGGSFIELD_SECRET` | Product preview image (optional; falls back gracefully). |
| `UNSUBSCRIBE_SECRET` | HMAC key for one-click unsubscribe tokens. |
| `OTP_SECRET` | HMAC key for hashing email verification codes. |
| `NURTURE_TEST_SECRET` | Guards the forced nurture test endpoint. |
| `NEXT_PUBLIC_SITE_URL` | Absolute origin for email links (set to the production domain). |
| `AI_GATEWAY_API_KEY` | Optional — Vercel AI Gateway path. |

## Deploy on Vercel

1. Push to GitHub (`main`).
2. Link the repo: `vercel link` (team) and `vercel git connect` for auto-deploys.
3. Add every variable above to Vercel (Production + Preview). Set
   `NEXT_PUBLIC_SITE_URL` to the production URL, not `localhost`.
4. Deploy: `vercel --prod` (or push to `main` once Git is connected).
