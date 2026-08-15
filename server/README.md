# server/ — Agent-run backend

A FastAPI service that lets website visitors run the book's **agent
scripts** live and watch the model's tool calls stream in. It is the
"run agent" button on the site; the browser-based demos and the Colab
notebooks do not touch it.

## Security model

The server executes **only the fixed repo scripts** listed in
`registry.py`, selected by id. Visitors can never send code, prompts,
or parameters to the server. (Editable code execution on the site
happens entirely in the visitor's browser via Pyodide.)

## How a run works

1. `POST /api/py/agents/{id}/run` looks the id up in `registry.py`
   (12 runnable scripts from chapters 9–17).
2. `sandbox.py` copies the chapter folder plus `data/` and `common/`
   into a per-run `/tmp` workspace, so scripts that write state files
   always start from the committed baseline and never touch the repo.
3. A subprocess runs `runner.py`, which executes the **unmodified**
   chapter script via `runpy` after monkeypatching agno's
   `print_response` to re-emit the run as structured JSON events
   (token deltas, tool calls, workflow steps).
4. `main.py` relays those events to the browser as Server-Sent Events,
   with keepalives, a watchdog timeout, and kill-on-disconnect.
5. The workspace is deleted, whatever happened.

`ch12/02_vector_knowledge.py` is registered but not runnable here: it
makes embedding API calls at import time and needs ChromaDB, which is
too heavy for a serverless function. The site points it at Colab.

## Endpoints

| Route | Purpose |
|---|---|
| `GET /api/py/health` | liveness + whether an API key is configured |
| `GET /api/py/agents` | the script registry with metadata |
| `GET /api/py/limits` | remaining quota for the caller |
| `POST /api/py/agents/{id}/run` | run a script, streamed as SSE |
| `POST /api/py/waitlist` | store a launch-waitlist email |

## Rate limiting

Limits are enforced **only when deployed** (Vercel sets the `VERCEL`
env var) or when `RATE_LIMIT_ENFORCE=1`; local dev is unlimited.
Defaults: 4 runs/minute and 75 runs/day per IP, 750 runs/day site-wide
— generous enough to run every script five times over, tight enough to
stop scripted abuse. Override with `RATE_LIMIT_PER_IP_MIN`,
`RATE_LIMIT_PER_IP_DAY`, `RATE_LIMIT_GLOBAL_DAY`. Counters live in
Upstash Redis when `UPSTASH_REDIS_REST_URL`/`_TOKEN` are set (so they
hold across serverless instances), else in process memory.

## Environment

- `GOOGLE_API_KEY` — required for agent runs (from the repo-root
  `.env` locally, Vercel env vars in production).
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — recommended
  in production: durable rate limits and waitlist storage.

## Run locally

From `web/`, `npm run dev:all` starts this server on port 8000
alongside the Next.js dev server. Or directly:

```bash
uv run --env-file .env uvicorn server.main:app --port 8000 --reload
```

In production the same app is exposed as a Vercel Python function via
`web/api/index.py`.
