"""Vercel Python function entrypoint: exposes the FastAPI app in server/.

Locally the repo root sits two levels up from this file. On Vercel the
function bundle cannot include files outside web/, so the prebuild hook
stages a repo-root-layout copy at web/_backend (scripts/bundle_backend.py),
bundled via includeFiles in vercel.json.
"""
import pathlib
import sys

_here = pathlib.Path(__file__).resolve()
for _candidate in (_here.parents[2], _here.parents[1] / "_backend"):
    if (_candidate / "server").is_dir():
        sys.path.insert(0, str(_candidate))
        break

from server.main import app  # noqa: E402,F401
