"""Per-run /tmp workspaces for agent script execution.

Every run gets a fresh copy of its chapter directory plus data/ and
common/, preserving the repo's relative layout (scripts resolve
`../data` from their own directory). All state the scripts write —
reserving_output.json, SQLite memory DBs, prior_cycle_record.json —
lands in the run directory and is deleted afterwards, so runs always
start from the committed baseline and the deployed bundle (read-only on
Vercel) is never written to.
"""
from __future__ import annotations

import os
import shutil
import tempfile
from pathlib import Path

# The repo root; overridable for deployments where the function bundle
# places files elsewhere.
REPO_ROOT = Path(os.environ.get("BOOK_REPO_ROOT", Path(__file__).resolve().parent.parent))

_IGNORE = shutil.ignore_patterns("__pycache__", "*.pyc", ".DS_Store")

# Cross-chapter imports: ch14's support.py loads the ch11 reserving helpers
# by relative path, so its sandbox needs that chapter alongside.
_EXTRA_DIRS = {
    "ch14_reserving_reflexion": ["ch11_multi_agent_workflows"],
}


def prepare_workspace(chapter_dir: str) -> tuple[Path, Path]:
    """Copy chapter_dir + data/ + common/ into a fresh temp dir.

    Returns (run_root, script_cwd). Caller must cleanup_workspace(run_root).
    """
    src_chapter = REPO_ROOT / chapter_dir
    if not src_chapter.is_dir():
        raise FileNotFoundError(f"chapter directory not found: {src_chapter}")
    run_root = Path(tempfile.mkdtemp(prefix="agentrun-"))
    shutil.copytree(src_chapter, run_root / chapter_dir, ignore=_IGNORE)
    for extra in _EXTRA_DIRS.get(chapter_dir, []):
        shutil.copytree(REPO_ROOT / extra, run_root / extra, ignore=_IGNORE)
    shutil.copytree(REPO_ROOT / "data", run_root / "data", ignore=_IGNORE)
    if (REPO_ROOT / "common").is_dir():
        shutil.copytree(REPO_ROOT / "common", run_root / "common", ignore=_IGNORE)
    return run_root, run_root / chapter_dir


def cleanup_workspace(run_root: Path) -> None:
    shutil.rmtree(run_root, ignore_errors=True)
