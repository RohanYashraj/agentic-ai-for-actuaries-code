#!/usr/bin/env python3
"""Export server/registry.py to web/lib/agents.generated.json.

Single source of truth: the server registry (the enforcement point for
what may run). The website reads the generated JSON, so its agent list
can never drift from the server's — same philosophy as build_demos.py.

Usage:
  python3 scripts/export_registry.py           # write the JSON
  python3 scripts/export_registry.py --check   # CI: verify only
                                               #   - every registered script exists on disk
                                               #   - the JSON (if present) is current
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
OUT = REPO / "web" / "lib" / "agents.generated.json"

sys.path.insert(0, str(REPO))

from server.registry import AGENTS  # noqa: E402


def entries() -> list[dict]:
    out = []
    for a in AGENTS.values():
        entry = {
            "id": a.id,
            "chapterDir": a.chapter_dir,
            "script": a.script,
            "title": a.title,
            "description": a.description,
            "estSeconds": a.est_seconds,
            "runnable": a.runnable,
        }
        if a.reason:
            entry["reason"] = a.reason
        out.append(entry)
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--check", action="store_true", help="verify only, write nothing")
    ap.add_argument("--out", type=Path, default=OUT)
    args = ap.parse_args()

    errors = []
    for a in AGENTS.values():
        script = REPO / a.chapter_dir / a.script
        if not script.is_file():
            errors.append(f"{a.id}: registered script missing on disk: {script}")
    if errors:
        for e in errors:
            print(f"ERROR: {e}", file=sys.stderr)
        return 1

    payload = json.dumps(entries(), indent=2) + "\n"
    if args.check:
        if args.out.exists() and args.out.read_text() != payload:
            print(f"ERROR: {args.out} is stale — regenerate with scripts/export_registry.py",
                  file=sys.stderr)
            return 1
        print(f"OK: {len(AGENTS)} registry entries verified")
        return 0

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(payload)
    print(f"Wrote {len(AGENTS)} agent entries -> {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
