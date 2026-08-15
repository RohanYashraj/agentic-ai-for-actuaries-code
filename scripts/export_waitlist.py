#!/usr/bin/env python3
"""Export the launch waitlist from Upstash Redis as CSV on stdout.

Usage (reads UPSTASH_REDIS_REST_URL/TOKEN from the repo-root .env):

    uv run --env-file .env python scripts/export_waitlist.py > waitlist.csv
"""
from __future__ import annotations

import csv
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from server.waitlist import META_KEY, SET_KEY  # noqa: E402


def main() -> int:
    url = os.environ.get("UPSTASH_REDIS_REST_URL")
    token = os.environ.get("UPSTASH_REDIS_REST_TOKEN")
    if not url or not token:
        print(
            "UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set. "
            "Add them to .env (same values as the Vercel project).",
            file=sys.stderr,
        )
        return 1
    from upstash_redis import Redis

    redis = Redis(url=url, token=token)
    emails = sorted(redis.smembers(SET_KEY) or [])
    meta = redis.hgetall(META_KEY) or {}
    writer = csv.writer(sys.stdout)
    writer.writerow(["email", "signed_up_at"])
    for email in emails:
        writer.writerow([email, meta.get(email, "")])
    print(f"{len(emails)} signups", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
