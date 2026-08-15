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


def _abs_pythonpath() -> str:
    # Vercel's Python runtime sets PYTHONPATH=_vendor, relative to the
    # function root; the runner subprocess executes from a /tmp
    # workspace, so relative entries must be absolutized before they
    # are passed down or vendored imports (agno, etc.) break.
    parts = os.environ.get("PYTHONPATH", "").split(os.pathsep)
    return os.pathsep.join(os.path.abspath(p) for p in parts if p)


# Chapter scripts run with an allowlisted environment: the active
# provider's model key and runtime basics, nothing else (no Upstash
# credentials, no unused provider keys — the sandbox's blast radius
# stays minimal).
_SUBPROCESS_ENV_KEYS = (
    "MODEL_PROVIDER", "MODEL_ID",
    "PATH", "HOME", "TMPDIR", "LANG", "LC_ALL",
    "SSL_CERT_FILE", "SSL_CERT_DIR", "REQUESTS_CA_BUNDLE",
    # Vercel's Python functions run on AWS Lambda, whose python binary
    # resolves libpython and bundled native libs via LD_LIBRARY_PATH —
    # dropping it would break the subprocess only in production. Proxy
    # knobs pass through for operators; none of these carry secrets.
    "LD_LIBRARY_PATH", "HTTP_PROXY", "HTTPS_PROXY", "NO_PROXY", "AGNO_TELEMETRY",
)


def _subprocess_env() -> dict[str, str]:
    env = {k: v for k in _SUBPROCESS_ENV_KEYS if (v := os.environ.get(k))}
    key_name = _required_key_name()
    if os.environ.get(key_name):
        env[key_name] = os.environ[key_name]
    env.update({"PYTHONPATH": _abs_pythonpath(), "PYTHONUNBUFFERED": "1",
                "NO_COLOR": "1", "TERM": "dumb"})
    return env

app = FastAPI(title="Agentic AI for Actuaries — agent runner")


def _client_ip(request: Request) -> str:
    # Per-IP limits are only as strong as the IP source. On Vercel the
    # platform-set x-vercel-forwarded-for is trustworthy; in a generic
    # proxy chain only the RIGHT-most x-forwarded-for entry is (left-most
    # is client-controlled and would grant a fresh limit bucket per
    # request). Locally, trust the socket peer and ignore headers.
    if os.environ.get("VERCEL"):
        fwd = request.headers.get("x-vercel-forwarded-for")
        if fwd:
            return fwd.split(",")[0].strip()
        fwd = request.headers.get("x-forwarded-for")
        if fwd:
            return fwd.split(",")[-1].strip()
    return request.client.host if request.client else "unknown"


_PROVIDER_KEYS = {
    "google": "GOOGLE_API_KEY",
    "anthropic": "ANTHROPIC_API_KEY",
    "openai": "OPENAI_API_KEY",
}


def _required_key_name() -> str:
    provider = os.environ.get("MODEL_PROVIDER", "google").lower()
    return _PROVIDER_KEYS.get(provider, "GOOGLE_API_KEY")


def _origin_allowed(request: Request) -> bool:
    # Optional belt on top of the x-agent-run header gate: when
    # ALLOWED_ORIGINS is set (comma-separated), reject browser requests
    # from other origins. Requests without an Origin header (curl,
    # server-to-server) pass — rate limits cover those.
    allowed = os.environ.get("ALLOWED_ORIGINS")
    if not allowed:
        return True
    origin = request.headers.get("origin")
    if not origin:
        return True
    return origin.rstrip("/") in {o.strip().rstrip("/") for o in allowed.split(",") if o.strip()}


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
        "hasApiKey": bool(os.environ.get(_required_key_name())),
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
    # Requiring the JSON content type forces cross-site senders into a
    # CORS preflight (which fails — no CORS headers exist). Without it, a
    # text/plain "simple request" from any page could post signups.
    ctype = request.headers.get("content-type", "").split(";")[0].strip().lower()
    if ctype != "application/json":
        return JSONResponse(
            {"error": "bad_request", "detail": "Send JSON with an email field."},
            status_code=415,
        )
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
    # The IP is hashed before it becomes a store key — no PII at rest.
    ip = _client_ip(request)
    day = time.strftime("%Y-%m-%d")
    try:
        count = ratelimit.store().incr(f"wl:ip:{ratelimit.ip_key(ip)}:{day}", 172800)
        if count > 5:
            return JSONResponse(
                {"error": "rate_limited", "detail": "Too many signups from this connection today."},
                status_code=429,
            )
        added = waitlist.signup(email)
    except Exception:  # noqa: BLE001 — a store outage must not become a 500
        return JSONResponse(
            {"error": "unavailable",
             "detail": "Could not save your signup right now — please try again in a minute."},
            status_code=503,
        )
    return {"ok": True, "already": not added}


def _sse(obj: dict) -> str:
    return f"data: {json.dumps(obj, ensure_ascii=False)}\n\n"


@app.post("/api/py/agents/{agent_id}/run")
async def run_agent(agent_id: str, request: Request):
    # The custom header forces a CORS preflight, which fails from any
    # foreign origin (this API sets no CORS headers) — without it, this
    # bodyless POST is a "simple request" any third-party page could fire
    # from a visitor's browser to bill the shared model key.
    if request.headers.get("x-agent-run") is None or not _origin_allowed(request):
        return JSONResponse(
            {"error": "forbidden", "detail": "Runs must be started from the site."},
            status_code=403,
        )
    spec = RUNNABLE.get(agent_id)
    if spec is None:
        known = AGENTS.get(agent_id)
        detail = known.reason if known else "unknown agent id"
        return JSONResponse({"error": "not_runnable", "detail": detail}, status_code=404)
    key_name = _required_key_name()
    if not os.environ.get(key_name):
        return JSONResponse(
            {"error": "no_api_key", "detail": f"{key_name} is not configured on the server."},
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
                env=_subprocess_env(),
            )
            yield _sse({"type": "Accepted", "id": spec.id, "estSeconds": spec.est_seconds})
            deadline = asyncio.get_event_loop().time() + RUN_TIMEOUT_SECONDS
            child_reported_failure = False
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
                    obj = json.loads(text)
                except json.JSONDecodeError:
                    yield _sse({"type": "Stdout", "line": text})
                else:
                    if obj.get("type") in ("Fatal", "RunError", "WorkflowError"):
                        child_reported_failure = True
                    yield _sse(obj)
            rc = await proc.wait()
            # The runner reports its own failures with an informative
            # excerpt and empty stderr; a second Fatal here would clobber
            # that excerpt with a useless "exit code N".
            if rc != 0 and not child_reported_failure:
                stderr_tail = (await proc.stderr.read())[-2000:].decode("utf-8", "replace")
                lines = [ln.strip() for ln in stderr_tail.splitlines() if ln.strip()]
                yield _sse({
                    "type": "Fatal",
                    "detail": "The run failed on the server. Try again, or open the chapter in Colab.",
                    "excerpt": " · ".join(lines[-3:])[:300] or f"exit code {rc}",
                })
        except Exception as e:  # noqa: BLE001
            yield _sse({
                "type": "Fatal",
                "detail": "The run failed on the server. Try again, or open the chapter in Colab.",
                "excerpt": f"{type(e).__name__}: {e}"[:300],
            })
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
