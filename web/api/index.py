"""Vercel Python function entrypoint: exposes the FastAPI app in server/.

The repo root sits two levels up from this file; server/, the chapter
directories, and data/ are bundled via includeFiles in vercel.json.
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2]))

from server.main import app  # noqa: E402,F401
