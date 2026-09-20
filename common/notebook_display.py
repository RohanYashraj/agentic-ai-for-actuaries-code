# ── common/notebook_display.py ───────────────────────────────────────
# Render agent answers as Markdown (with LaTeX) inside Jupyter / Colab.
#
# The chapter scripts call Agent.print_response / Workflow.print_response,
# which draw the answer with Rich for a terminal. In a notebook that
# leaves LaTeX as raw `$...$` text and lets underscores inside formulas
# turn into italics. install() swaps in a display that streams the same
# run through IPython's Markdown output, which Colab renders with
# MathJax — the scripts themselves stay unchanged.
#
# The website's agent runner applies the same conventions (see
# web/lib/markdown-math.ts); keep the two in step.

from __future__ import annotations

import inspect
import json
import re
import time

# ── Math normalisation ────────────────────────────────────────────────
# Models mix LaTeX with currency ("$70,967,919 ... $68,669,640"), and a
# math-aware renderer would swallow everything between the two dollar
# signs. Same rules as the site: `\( \)` / `\[ \]` become dollar
# delimiters, and a single `$` opens inline math only under Pandoc's
# rules (no space after the opener, none before the closer, no digit
# after the closer, same paragraph); a `$` followed by a plain number
# and a word boundary is always currency. Anything else is escaped.
# Code is never touched.

_CODE_RE = re.compile(r"(```[\s\S]*?(?:```|$)|`[^`\n]+`)")
_DISPLAY_RE = re.compile(r"\\\[([\s\S]+?)\\\]")
_INLINE_RE = re.compile(r"\\\(([\s\S]+?)\\\)")


def prepare_math_markdown(src: str) -> str:
    parts = _CODE_RE.split(src)
    return "".join(p if i % 2 else _normalise(p) for i, p in enumerate(parts))


def _normalise(text: str) -> str:
    text = _DISPLAY_RE.sub(lambda m: f"$${m.group(1)}$$", text)
    text = _INLINE_RE.sub(lambda m: f"${m.group(1)}$", text)
    return _escape_unpaired_dollars(text)


def _escape_unpaired_dollars(text: str) -> str:
    out: list[str] = []
    i, n = 0, len(text)
    while i < n:
        ch = text[i]
        if ch == "\\" and i + 1 < n:
            out.append(text[i:i + 2])
            i += 2
            continue
        if ch != "$":
            out.append(ch)
            i += 1
            continue
        if text[i + 1:i + 2] == "$":
            close = text.find("$$", i + 2)
            end = n if close == -1 else close + 2
            out.append(text[i:end])
            i = end
            continue
        close = _find_inline_close(text, i)
        if close == -1:
            out.append("\\$")
            i += 1
        else:
            out.append(text[i:close + 1])
            i = close + 1
    return "".join(out)


# "$63,790.59 and", "$5." — a plain number followed by a word boundary is
# money, never an opener, even when a real formula closes later in the
# same paragraph.
_CURRENCY_RE = re.compile(r"\$(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?(?=[\s*),.;:!?]|$)")


def _find_inline_close(text: str, open_at: int) -> int:
    first = text[open_at + 1:open_at + 2]
    if not first or first.isspace():
        return -1
    if _CURRENCY_RE.match(text, open_at):
        return -1
    j = open_at + 1
    n = len(text)
    while j < n:
        c = text[j]
        if c == "\\":
            j += 2
            continue
        if c == "\n" and text[j + 1:j + 2] == "\n":
            return -1  # paragraph break
        if c == "$":
            if text[j + 1:j + 2] == "$":
                return -1  # ran into a display span
            before = text[j - 1]
            after = text[j + 1:j + 2]
            if not before.isspace() and not (after and after.isdigit()):
                return j
        j += 1
    return -1


# ── Display shim ──────────────────────────────────────────────────────

_REFRESH_INTERVAL = 0.25  # seconds between live Markdown updates


def _truncate(value, limit: int = 200) -> str:
    if not isinstance(value, str):
        try:
            value = json.dumps(value, ensure_ascii=False, default=str)
        except (TypeError, ValueError):
            value = repr(value)
    return value if len(value) <= limit else value[:limit] + " …"


# Arguments the shim sets itself; a caller's copies must not collide.
_SHIM_OWNED = frozenset({"input", "stream", "stream_events"})


def _run_kwargs(run, kwargs: dict) -> dict:
    """Forward only the print_response kwargs that run() also accepts
    (session_id, user_id, ...); display-only ones like markdown are dropped."""
    try:
        params = inspect.signature(run).parameters
    except (TypeError, ValueError):
        return {}
    kwargs = {k: v for k, v in kwargs.items() if k not in _SHIM_OWNED}
    if any(p.kind is inspect.Parameter.VAR_KEYWORD for p in params.values()):
        return kwargs
    return {k: v for k, v in kwargs.items() if k in params}


def _backend():
    """(display, Markdown) from IPython, or None outside a notebook."""
    try:
        from IPython import get_ipython
        from IPython.display import Markdown, display
    except ImportError:
        return None
    if get_ipython() is None:
        return None
    return display, Markdown


def _make_shim(kind: str, backend):
    display, Markdown = backend

    def shim(self, input=None, *args, **kwargs):
        prompt = input if input is not None else (args[0] if args else "")
        display(Markdown(f"> **{kind.capitalize()} input:** {_truncate(str(prompt), 2000)}"))
        handle = display(Markdown("_running…_"), display_id=True)

        notes: list[str] = []   # tool calls, steps, errors
        content: list[str] = []
        last = [0.0]

        def refresh(force: bool = False) -> None:
            now = time.monotonic()
            if not force and now - last[0] < _REFRESH_INTERVAL:
                return
            last[0] = now
            parts = []
            if notes:
                parts.append("\n".join(notes))
            body = prepare_math_markdown("".join(content))
            if body.strip():
                parts.append(body)
            handle.update(Markdown("\n\n".join(parts) or "_running…_"))

        for ev in self.run(input=prompt, stream=True, stream_events=True,
                           **_run_kwargs(self.run, kwargs)):
            name = str(getattr(ev, "event", "") or type(ev).__name__)
            if name in ("RunContent", "RunIntermediateContent"):
                c = getattr(ev, "content", None)
                if isinstance(c, str):
                    content.append(c)
                    refresh()
            elif name == "ToolCallStarted":
                tool = getattr(ev, "tool", None)
                tool_name = getattr(tool, "tool_name", None) or "tool"
                args_ = getattr(tool, "tool_args", None) or {}
                notes.append(f"🔧 `{tool_name}({_truncate(args_, 160)})`")
                refresh()
            elif name == "ToolCallError":
                notes.append(f"⚠️ tool error: {_truncate(getattr(ev, 'error', None) or '', 300)}")
                refresh()
            elif name == "StepStarted":
                step = getattr(ev, "step_name", None) or "step"
                content.append(f"\n\n---\n\n**Step: {step}**\n\n")
                refresh()
            elif name in ("RunError", "WorkflowError", "StepError"):
                detail = getattr(ev, "content", None) or getattr(ev, "error", None) or "run failed"
                notes.append(f"⚠️ {_truncate(str(detail), 500)}")
                refresh()
        refresh(force=True)

    shim._notebook_display = True  # type: ignore[attr-defined]
    return shim


def install() -> bool:
    """Route Agent/Workflow.print_response through notebook Markdown.

    Returns True when active. Outside IPython (plain `python script.py`)
    it is a no-op, so the same call is safe anywhere.
    """
    backend = _backend()
    if backend is None:
        return False
    from agno.agent import Agent
    from agno.workflow import Workflow

    for cls, kind in ((Agent, "agent"), (Workflow, "workflow")):
        if not getattr(cls.print_response, "_notebook_display", False):
            cls.print_response = _make_shim(kind, backend)
    return True
