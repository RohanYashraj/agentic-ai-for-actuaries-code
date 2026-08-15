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
            args = getattr(tool, "tool_args", None)
            if args:
                out["args"] = _truncate(args, 1000)
            if name != "ToolCallStarted":
                result = getattr(tool, "result", None)
                if result is not None:
                    out["result"] = _truncate(result, 2000)
    elif name in ("StepStarted", "StepCompleted", "StepError"):
        out["step"] = getattr(ev, "step_name", None)
    elif name in ("RunError", "WorkflowError"):
        out["detail"] = _truncate(getattr(ev, "content", None) or "run failed", 2000)
    return out


def install_shim() -> None:
    from agno.agent import Agent
    from agno.workflow import Workflow

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
        emit({"type": "Fatal", "detail": _truncate(f"{type(e).__name__}: {e}", 2000)})
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
