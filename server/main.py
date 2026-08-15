"""FastAPI backend: streams agent-script runs to the website via SSE.

Routes live under /api/py (matched by the Next.js rewrite in web/).
Security model: the server only executes the fixed repo scripts listed in
registry.py, selected by id. No code, prompts, or parameters are accepted
from the client.
"""
from __future__ import annotations

import asyncio
import json
import os
import sys
import time
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, StreamingResponse

from . import ratelimit, waitlist
from .registry import AGENTS, RUNNABLE
from .sandbox import cleanup_workspace, prepare_workspace

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

RUNNER = Path(__file__).resolve().parent / "runner.py"
RUN_TIMEOUT_SECONDS = 240
KEEPALIVE_SECONDS = 15

app = FastAPI(title="Agentic AI for Actuaries — agent runner")


def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.headers.get("x-real-ip") or (request.client.host if request.client else "unknown")


def _agent_json(a) -> dict:
    return {
        "id": a.id,
        "chapter": a.chapter,
        "script": a.script,
        "title": a.title,
        "description": a.description,
        "estSeconds": a.est_seconds,
        "runnable": a.runnable,
        "reason": a.reason,
        "colabUrl": a.colab_url,
        "githubUrl": a.github_url,
    }


@app.get("/api/py/health")
async def health() -> dict:
    return {
        "status": "ok",
        "hasApiKey": bool(os.environ.get("GOOGLE_API_KEY")),
        "agents": len(RUNNABLE),
    }


@app.get("/api/py/agents")
async def agents() -> list[dict]:
    return [_agent_json(a) for a in AGENTS.values()]


@app.get("/api/py/limits")
async def limits(request: Request) -> dict:
    quota = ratelimit.peek(_client_ip(request))
    return {
        "allowed": quota.allowed,
        "perIpRemaining": quota.per_ip_remaining,
        "globalRemaining": quota.global_remaining,
        "limitedBy": quota.limited_by,
        "enforced": ratelimit.enforced(),
    }


@app.post("/api/py/waitlist")
async def join_waitlist(request: Request):
    try:
        body = await request.json()
        email_raw = str(body.get("email", ""))
    except Exception:
        return JSONResponse({"error": "bad_request", "detail": "Send JSON with an email field."}, status_code=400)
    email = waitlist.normalize(email_raw)
    if email is None:
        return JSONResponse(
            {"error": "invalid_email", "detail": "That does not look like an email address."},
            status_code=422,
        )
    # Light abuse guard: a handful of signups per IP per day is plenty.
    ip = _client_ip(request)
    day = time.strftime("%Y-%m-%d")
    count = ratelimit.store().incr(f"wl:ip:{ip}:{day}", 172800)
    if count > 5:
        return JSONResponse(
            {"error": "rate_limited", "detail": "Too many signups from this connection today."},
            status_code=429,
        )
    waitlist.signup(email)
    return {"ok": True}


def _sse(obj: dict) -> str:
    return f"data: {json.dumps(obj, ensure_ascii=False)}\n\n"


@app.post("/api/py/agents/{agent_id}/run")
async def run_agent(agent_id: str, request: Request):
    spec = RUNNABLE.get(agent_id)
    if spec is None:
        known = AGENTS.get(agent_id)
        detail = known.reason if known else "unknown agent id"
        return JSONResponse({"error": "not_runnable", "detail": detail}, status_code=404)
    if not os.environ.get("GOOGLE_API_KEY"):
        return JSONResponse(
            {"error": "no_api_key", "detail": "GOOGLE_API_KEY is not configured on the server."},
            status_code=503,
        )
    quota = ratelimit.check_and_increment(_client_ip(request))
    if not quota.allowed:
        details = {
            "minute": "A few runs in under a minute — give it a moment and try again.",
            "day": "You have used today's runs. Open the chapter in Colab to keep going with your own key.",
            "global": "The site's daily run budget is spent. Open the chapter in Colab to keep going with your own key.",
        }
        return JSONResponse(
            {"error": "rate_limited", "limitedBy": quota.limited_by, "colabUrl": spec.colab_url,
             "detail": details.get(quota.limited_by or "", details["day"])},
            status_code=429,
        )

    async def stream():
        run_root = None
        proc = None
        try:
            run_root, cwd = prepare_workspace(spec.chapter_dir)
            proc = await asyncio.create_subprocess_exec(
                sys.executable, "-u", str(RUNNER), spec.script,
                cwd=str(cwd),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                env={**os.environ, "PYTHONUNBUFFERED": "1", "NO_COLOR": "1", "TERM": "dumb"},
            )
            yield _sse({"type": "Accepted", "id": spec.id, "estSeconds": spec.est_seconds})
            deadline = asyncio.get_event_loop().time() + RUN_TIMEOUT_SECONDS
            while True:
                if await request.is_disconnected():
                    proc.kill()
                    return
                remaining = deadline - asyncio.get_event_loop().time()
                if remaining <= 0:
                    proc.kill()
                    yield _sse({"type": "Fatal", "detail": "Run timed out on the server. Try Colab for long runs."})
                    return
                try:
                    line = await asyncio.wait_for(
                        proc.stdout.readline(), timeout=min(KEEPALIVE_SECONDS, remaining)
                    )
                except asyncio.TimeoutError:
                    yield ": keepalive\n\n"
                    continue
                if not line:
                    break
                text = line.decode("utf-8", "replace").strip()
                if not text:
                    continue
                try:
                    yield _sse(json.loads(text))
                except json.JSONDecodeError:
                    yield _sse({"type": "Stdout", "line": text})
            rc = await proc.wait()
            if rc != 0:
                stderr_tail = (await proc.stderr.read())[-2000:].decode("utf-8", "replace")
                yield _sse({"type": "Fatal", "detail": stderr_tail or f"exit code {rc}"})
        except Exception as e:  # noqa: BLE001
            yield _sse({"type": "Fatal", "detail": f"{type(e).__name__}: {e}"})
        finally:
            if proc is not None and proc.returncode is None:
                proc.kill()
            if run_root is not None:
                cleanup_workspace(run_root)

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no"},
    )
