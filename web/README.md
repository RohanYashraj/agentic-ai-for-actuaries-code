# Agentic AI for Actuaries — Book Site

The book's companion website: a Next.js app where the deterministic
actuarial tool scripts run editable in the browser (Pyodide + CodeMirror),
the agent scripts run live on the server against Gemini with their tool
calls streamed to the page, and every chapter opens in Google Colab.

## How it fits together

- `app/` — routes: `/` (landing with a live hero demo), `/code`
  (chapter explorer), `/code/[chapter]` (one page per chapter, ch09-ch17).
- `components/` — `demo-runner` (editable CodeMirror + Run against the
  Pyodide worker), `agent-runner` (SSE stream of a server-side agno run),
  `script-card`, `code-view`, `run-output`, shadcn/ui primitives.
- `public/pyodide-worker.js` — static Web Worker that lazily loads
  Pyodide from the CDN and executes demos in an in-memory filesystem.
- `public/demos/` — **generated, never edited by hand.** Built from the
  chapter scripts by `../scripts/build_demos.py` (runs automatically via
  the `predev`/`prebuild` hooks), which strips the Agno agent wiring so
  each tool runs as a plain function. Because the copies are derived at
  build time, they cannot drift from the book code; CI double-checks via
  `.github/workflows/demos-check.yml`.
- `api/index.py` — Vercel Python function exposing the FastAPI backend
  in `../server/` (fixed script registry, per-run /tmp sandboxes,
  SSE streaming, rate limiting). See `../server/`.

## Run locally

Backend + frontend together (needs `GOOGLE_API_KEY` in the repo-root
`.env` for agent runs; browser demos work without it):

```bash
cd web
npm install
npm run dev:all
```

Or frontend only: `npm run dev`. Open http://localhost:3000.

## Deploy on Vercel

Import the repository into Vercel with:

1. **Root Directory** = `web/`, and enable "Include source files outside
   of the Root Directory in the Build Step".
2. Environment variables: `GOOGLE_API_KEY` (required for agent runs),
   `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (recommended:
   makes rate limits durable across function instances and stores the
   waitlist; add Upstash from the Vercel Marketplace, free tier).
   Optional tuning: `RATE_LIMIT_PER_IP_MIN` (default 4),
   `RATE_LIMIT_PER_IP_DAY` (default 75), `RATE_LIMIT_GLOBAL_DAY`
   (default 750). Rate limits only apply when deployed; local dev is
   unlimited (force locally with `RATE_LIMIT_ENFORCE=1`).
3. `web/vercel.json` wires `/api/py/*` to the Python function. The
   `prebuild` hook stages the backend (server, chapter code, data) into
   `web/_backend/` via `../scripts/bundle_backend.py`, because Vercel
   cannot bundle function files from outside the Root Directory.

Without the env vars the site still works: agent runs report that the
runner is unavailable and point at Colab; everything else is static.

## Waitlist form

`components/notify-form.tsx` posts to `POST /api/py/waitlist`, which
stores emails in the same Upstash Redis used for rate limiting (no
third-party form service). Export the list any time with:

```bash
uv run --env-file .env python scripts/export_waitlist.py > waitlist.csv
```

Locally without Upstash env vars, signups go to an in-memory store so
the form still works in dev.
