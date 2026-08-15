"""Child-process entrypoint: run one chapter script, stream NDJSON events.

Invoked as `python -u runner.py <script_path>` with cwd already set to the
script's sandboxed chapter directory. The chapter script is executed
UNMODIFIED (drift-free by construction); the only intervention is a
monkeypatch of Agent.print_response / Workflow.print_response that
replaces Rich terminal rendering with `run(stream=True, stream_events=True)`
and emits one JSON object per stdout line for the API to relay as SSE.
"""
from __future__ import annotations

import json
import runpy
import sys


def emit(obj: dict) -> None:
    json.dump(obj, sys.__stdout__, ensure_ascii=False, default=str)
    sys.__stdout__.write("\n")
    sys.__stdout__.flush()


def _truncate(value, limit: int = 4000) -> str:
    s = value if isinstance(value, str) else repr(value)
    return s if len(s) <= limit else s[:limit] + " …[truncated]"


def _truncate_json(value, limit: int = 4000) -> str:
    # JSON-encode dicts/lists so the UI can pretty-print them; anything
    # unserializable falls back to the plain truncated repr.
    if not isinstance(value, str):
        try:
            value = json.dumps(value, ensure_ascii=False, default=str)
        except (TypeError, ValueError):
            pass
    return _truncate(value, limit)


def serialize_event(ev) -> dict:
    """Map an agno RunOutputEvent/WorkflowRunOutputEvent to a small dict.

    Defensive: unknown event types pass through by name so newer agno
    versions degrade gracefully instead of crashing the stream.
    """
    name = str(getattr(ev, "event", "") or type(ev).__name__)
    out: dict = {"type": name}
    if name in ("RunContent", "RunIntermediateContent"):
        content = getattr(ev, "content", None)
        if isinstance(content, str):
            out["delta"] = content
        elif content is not None:
            out["delta"] = _truncate(content)
    elif name in ("ToolCallStarted", "ToolCallCompleted", "ToolCallError"):
        tool = getattr(ev, "tool", None)
        if tool is not None:
            out["tool"] = getattr(tool, "tool_name", None)
            call_id = getattr(tool, "tool_call_id", None)
            if call_id:
                out["toolCallId"] = call_id
            args = getattr(tool, "tool_args", None)
            if args:
                out["args"] = _truncate_json(args, 1000)
            if name != "ToolCallStarted":
                result = getattr(tool, "result", None)
                if result is not None:
                    out["result"] = _truncate_json(result, 2000)
                if getattr(tool, "tool_call_error", None):
                    out["error"] = True
        if name == "ToolCallError":
            out["error"] = True
            out["detail"] = _truncate(getattr(ev, "error", None) or "tool call failed", 2000)
    elif name in ("StepStarted", "StepCompleted", "StepError"):
        out["step"] = getattr(ev, "step_name", None)
    elif name in ("RunError", "WorkflowError"):
        # agno-authored error messages (auth, quota, model errors) — short
        # and user-actionable, unlike tracebacks, so shown but capped.
        out["detail"] = _truncate(getattr(ev, "content", None) or "run failed", 500)
    return out


def install_shim() -> None:
    import logging

    from agno.agent import Agent
    from agno.workflow import Workflow

    # agno reports failed tool lookups (e.g. a model calling a tool name
    # that does not exist) only through its loggers — no run event is
    # emitted. Route WARNING+ records onto the stream so those failures
    # are visible in the UI. Replacing the handlers (not appending) also
    # drops agno's RichHandler, which would otherwise write terminal
    # markup through the stdout shim.
    class _LogToStream(logging.Handler):
        def emit(self, record: logging.LogRecord) -> None:
            try:
                emit({"type": "Log", "level": record.levelname.lower(),
                      "message": _truncate(record.getMessage(), 1000)})
            except Exception:  # noqa: BLE001 — logging must never kill the run
                pass

    handler = _LogToStream(level=logging.WARNING)
    for logger_name in ("agno", "agno-team", "agno-workflow"):
        lg = logging.getLogger(logger_name)
        lg.handlers = [handler]
        lg.setLevel(logging.WARNING)

    def make_shim(kind: str):
        def shim(self, input=None, *args, **kwargs):
            prompt = input if input is not None else (args[0] if args else "")
            emit({"type": "RunInput", "kind": kind, "input": _truncate(prompt, 2000)})
            for ev in self.run(input=prompt, stream=True, stream_events=True):
                emit(serialize_event(ev))
        return shim

    Agent.print_response = make_shim("agent")
    Workflow.print_response = make_shim("workflow")


def main() -> int:
    script_path = sys.argv[1]
    # Plain print() calls in scripts/support modules still stream through
    # as text lines; wrap them as events so the relay stays pure NDJSON.
    class _StdoutAsEvents:
        def __init__(self):
            self._buf = ""

        def write(self, s: str) -> int:
            self._buf += s
            while "\n" in self._buf:
                line, self._buf = self._buf.split("\n", 1)
                emit({"type": "Stdout", "line": line})
            return len(s)

        def flush(self) -> None:
            if self._buf:
                emit({"type": "Stdout", "line": self._buf})
                self._buf = ""

    sys.stdout = _StdoutAsEvents()
    sys.path.insert(0, ".")
    try:
        install_shim()
        runpy.run_path(script_path, run_name="__main__")
        sys.stdout.flush()
        emit({"type": "Done"})
        return 0
    except SystemExit as e:
        sys.stdout.flush()
        code = e.code if isinstance(e.code, int) else 0
        emit({"type": "Done"} if code == 0 else {"type": "Fatal", "detail": f"exit {code}"})
        return code or 0
    except BaseException as e:  # noqa: BLE001 — report anything to the stream
        sys.stdout.flush()
        # Same shape as main.py's sanitized Fatal: friendly message plus a
        # short excerpt — raw exception text never reaches the browser.
        emit({
            "type": "Fatal",
            "detail": "The run failed on the server. Try again, or open the chapter in Colab.",
            "excerpt": _truncate(f"{type(e).__name__}: {e}", 300),
        })
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
