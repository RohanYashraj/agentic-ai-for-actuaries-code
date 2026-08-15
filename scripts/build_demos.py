#!/usr/bin/env python3
"""Derive browser-safe demo copies from the chapter originals.

Single source of truth: the chapter scripts (ch10_tool_use/… etc.). This
script generates the Pyodide-runnable copies the website serves, so the
website can never drift from the book code. Transformations, all verified
against the AST of the result:

  1. delete `agno` imports (module-level only; entry files never have lazy ones)
  2. delete `@tool` / `@tool(name=...)` decorators
  3. delete module-level `X = Agent(...)` assignments (plus the comment
     lines directly above them)
  4. rewrite `X.entrypoint(` -> `X(`
  5. optionally replace the `if __name__ == "__main__":` block with a
     demo-specific override from scripts/overrides/

Only each demo's *entry* file (and entry files referenced by other demos)
is transformed; support modules are copied verbatim (their agno imports,
where present, are lazy and never reached in the browser).

Usage:
  python3 scripts/build_demos.py --out web/public/demos   # generate
  python3 scripts/build_demos.py --check                  # CI: verify only
"""
from __future__ import annotations

import argparse
import ast
import json
import re
import shutil
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
CONFIG = Path(__file__).resolve().parent / "demos.config.json"
OVERRIDES_DIR = Path(__file__).resolve().parent

ENTRYPOINT_RE = re.compile(r"\b(\w+)\.entrypoint\(")


class TransformError(Exception):
    pass


def _is_agno_import(node: ast.stmt) -> bool:
    if isinstance(node, ast.ImportFrom):
        return (node.module or "").split(".")[0] == "agno"
    if isinstance(node, ast.Import):
        return any(a.name.split(".")[0] == "agno" for a in node.names)
    return False


def _is_agent_assign(node: ast.stmt) -> bool:
    """Module-level `X = Agent(...)` (or Workflow(...))."""
    if not isinstance(node, ast.Assign):
        return False
    v = node.value
    return (
        isinstance(v, ast.Call)
        and isinstance(v.func, ast.Name)
        and v.func.id in ("Agent", "Workflow")
    )


def transform_source(src: str, rel_path: str, main_override: str | None) -> str:
    tree = ast.parse(src)
    lines = src.splitlines(keepends=True)
    kill: set[int] = set()  # 1-based line numbers to delete

    def kill_range(lo: int, hi: int) -> None:
        kill.update(range(lo, hi + 1))

    def kill_preceding_comments(lineno: int) -> None:
        i = lineno - 1
        while i >= 1 and lines[i - 1].lstrip().startswith("#"):
            kill.add(i)
            i -= 1

    for node in ast.walk(tree):
        if isinstance(node, (ast.Import, ast.ImportFrom)) and _is_agno_import(node):
            kill_range(node.lineno, node.end_lineno)
        elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            for dec in node.decorator_list:
                target = dec.func if isinstance(dec, ast.Call) else dec
                if isinstance(target, ast.Name) and target.id == "tool":
                    kill_range(dec.lineno, dec.end_lineno)

    main_start = None
    for node in tree.body:  # module level only
        if _is_agent_assign(node):
            kill_range(node.lineno, node.end_lineno)
            kill_preceding_comments(node.lineno)
        if (
            isinstance(node, ast.If)
            and isinstance(node.test, ast.Compare)
            and isinstance(node.test.left, ast.Name)
            and node.test.left.id == "__name__"
        ):
            main_start = node.lineno

    if main_override is not None:
        if main_start is not None:
            kill.update(range(main_start, len(lines) + 1))
        out_lines = [l for i, l in enumerate(lines, 1) if i not in kill]
        body = "".join(out_lines).rstrip("\n") + "\n\n\n" + main_override.rstrip("\n") + "\n"
    else:
        out_lines = [l for i, l in enumerate(lines, 1) if i not in kill]
        body = "".join(out_lines)

    body = ENTRYPOINT_RE.sub(r"\1(", body)
    body = re.sub(r"\n{4,}", "\n\n\n", body)

    banner = (
        f"# Generated from {rel_path} for in-browser execution.\n"
        f"# Agno agent wiring is removed so the tool runs as a plain function;\n"
        f"# the full version is on GitHub. Do not edit: regenerate with\n"
        f"# scripts/build_demos.py.\n"
    )
    result = banner + body

    # Verification gates: must parse, compile, and contain no trace of agno.
    try:
        out_tree = ast.parse(result)
        compile(result, rel_path, "exec")
    except SyntaxError as e:
        raise TransformError(f"{rel_path}: transformed source no longer parses: {e}")
    for node in ast.walk(out_tree):
        if isinstance(node, (ast.Import, ast.ImportFrom)) and _is_agno_import(node):
            raise TransformError(f"{rel_path}: agno import survived the transform")
        if isinstance(node, ast.Attribute) and node.attr == "entrypoint":
            raise TransformError(f"{rel_path}: .entrypoint call survived the transform")
        if isinstance(node, ast.Name) and node.id in ("Agent", "Workflow", "Gemini", "agno"):
            raise TransformError(f"{rel_path}: reference to {node.id} survived the transform")
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.decorator_list:
            for dec in node.decorator_list:
                if "tool" in ast.dump(dec):
                    raise TransformError(
                        f"{rel_path}: unrecognized tool decorator shape survived "
                        f"the transform (update build_demos.py)"
                    )
    return result


def load_config() -> dict:
    cfg = json.loads(CONFIG.read_text())
    return cfg["demos"]


def build(out_dir: Path, check_only: bool) -> int:
    demos = load_config()
    generated: dict[str, str] = {}   # out-relative path -> content
    data_files: dict[str, Path] = {}  # out-relative path -> source path
    manifest: dict[str, dict] = {}

    # Entry files of any demo get transformed (they may be imported by
    # sibling demos, e.g. ch15-03 imports 01_pension_valuation).
    entry_files = {
        (spec["chapter_dir"], spec["entry"]): spec.get("main_override")
        for spec in demos.values()
    }

    errors: list[str] = []
    for demo_id, spec in demos.items():
        chapter_dir = REPO / spec["chapter_dir"]
        for fname in spec["files"]:
            src_path = chapter_dir / fname
            if not src_path.is_file():
                errors.append(f"{demo_id}: missing source file {src_path}")
                continue
            out_rel = f"{spec['dir']}/{fname}"
            if out_rel in generated:
                continue
            rel = f"{spec['chapter_dir']}/{fname}"
            key = (spec["chapter_dir"], fname)
            try:
                if key in entry_files:
                    override_ref = entry_files[key]
                    override = (
                        (OVERRIDES_DIR / override_ref).read_text()
                        if override_ref
                        else None
                    )
                    generated[out_rel] = transform_source(
                        src_path.read_text(), rel, override
                    )
                else:
                    generated[out_rel] = src_path.read_text()
            except (TransformError, FileNotFoundError) as e:
                errors.append(str(e))
        for dname in spec["data"]:
            dpath = REPO / "data" / dname
            if not dpath.is_file():
                errors.append(f"{demo_id}: missing data file {dpath}")
            else:
                data_files[f"data/{dname}"] = dpath
        manifest[demo_id] = {
            "dir": spec["dir"],
            "chapterDir": spec["chapter_dir"],
            "entry": spec["entry"],
            "files": spec["files"],
            "packages": spec["packages"],
            "data": spec["data"],
            "title": spec["title"],
            "description": spec["description"],
        }

    if errors:
        for e in errors:
            print(f"ERROR: {e}", file=sys.stderr)
        return 1

    if check_only:
        print(f"OK: {len(generated)} demo files + {len(data_files)} data files verified")
        return 0

    if out_dir.exists():
        shutil.rmtree(out_dir)
    for out_rel, content in generated.items():
        p = out_dir / out_rel
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content)
    for out_rel, src in data_files.items():
        p = out_dir / out_rel
        p.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, p)
    (out_dir / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(
        f"Generated {len(generated)} demo files, {len(data_files)} data files, "
        f"manifest with {len(manifest)} demos -> {out_dir}"
    )
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--out", type=Path, default=REPO / "web" / "public" / "demos")
    ap.add_argument("--check", action="store_true", help="verify transforms only, write nothing")
    args = ap.parse_args()
    return build(args.out.resolve(), args.check)


if __name__ == "__main__":
    raise SystemExit(main())
