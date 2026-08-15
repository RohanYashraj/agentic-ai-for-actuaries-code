"""Stage the agent-run backend inside web/ for Vercel deployment.

Vercel's function bundler cannot include files outside the project's
Root Directory (web/), so `includeFiles: "../server/**"` silently adds
nothing. This script copies everything the FastAPI backend needs —
server/, the chapter folders, common/, and data/ — into web/_backend/,
preserving the repo-root layout the server resolves paths against.
It runs from web/'s prebuild hook, like build_demos.py, so the staged
copy is derived at build time and cannot drift from the repo code.

Usage: python3 scripts/bundle_backend.py --out web/_backend
"""
from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

BACKEND_DIRS = [
    "server",
    "common",
    "data",
    "ch09_agentic_foundations",
    "ch10_tool_use",
    "ch11_multi_agent_workflows",
    "ch12_memory",
    "ch13_underwriting_agent",
    "ch14_reserving_reflexion",
    "ch15_pension_pipeline",
    "ch16_regulatory_capital",
    "ch17_governance_monitoring",
]

_IGNORE = shutil.ignore_patterns(
    "__pycache__", "*.pyc", "*.db", ".venv", ".ipynb_checkpoints",
    "xs_index", "reserving_output.json", "prior_cycle_record.json",
)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", required=True, help="Target directory (e.g. web/_backend)")
    args = parser.parse_args()

    out = Path(args.out).resolve()
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)

    for name in BACKEND_DIRS:
        src = REPO_ROOT / name
        if not src.is_dir():
            print(f"error: missing {src}", file=sys.stderr)
            return 1
        shutil.copytree(src, out / name, ignore=_IGNORE)

    n_files = sum(1 for p in out.rglob("*") if p.is_file())
    print(f"Staged backend ({len(BACKEND_DIRS)} dirs, {n_files} files) -> {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
