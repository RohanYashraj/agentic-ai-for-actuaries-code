"""Waitlist signups, stored in the same Upstash Redis used for rate limits.

Storage:
  waitlist:emails  — Redis set of normalized addresses (dedupe)
  waitlist:meta    — Redis hash email -> first-signup ISO date

Locally (no Upstash env), signups land in an in-process store so the form
can be exercised in dev; they vanish with the process. Export with
scripts/export_waitlist.py.
"""
from __future__ import annotations

import os
import re
import time

# Pragmatic format check; the mailbox's existence is confirmed at launch.
_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]{2,}$")

SET_KEY = "waitlist:emails"
META_KEY = "waitlist:meta"


class _MemoryWaitlist:
    def __init__(self) -> None:
        self._meta: dict[str, str] = {}

    def add(self, email: str, date: str) -> None:
        self._meta.setdefault(email, date)

    def count(self) -> int:
        return len(self._meta)


class _UpstashWaitlist:
    def __init__(self, url: str, token: str) -> None:
        from upstash_redis import Redis

        self._redis = Redis(url=url, token=token)

    def add(self, email: str, date: str) -> None:
        self._redis.sadd(SET_KEY, email)
        self._redis.hsetnx(META_KEY, email, date)

    def count(self) -> int:
        return int(self._redis.scard(SET_KEY) or 0)


def _make_store():
    from .redis_env import redis_rest_credentials

    url, token = redis_rest_credentials()
    if url and token:
        try:
            return _UpstashWaitlist(url, token)
        except Exception:
            pass
    return _MemoryWaitlist()


_store = _make_store()


def normalize(email: str) -> str | None:
    """Return the canonical address, or None if the format is invalid."""
    email = email.strip().lower()
    if not email or len(email) > 254 or not _EMAIL_RE.match(email):
        return None
    return email


def signup(email: str) -> None:
    """Record a signup (idempotent). Caller validates via normalize() first."""
    _store.add(email, time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))
