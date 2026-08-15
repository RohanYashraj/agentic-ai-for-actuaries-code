"""Rate limiting for agent runs.

Enforcement: limits apply only when the app is deployed (Vercel sets the
VERCEL env var) or when RATE_LIMIT_ENFORCE=1 is set explicitly. Local dev
runs unlimited with zero configuration.

Windows (fixed-window counters, the pragmatic serverless approach):
  - per IP per minute  (burst guard against scripted spam)
  - per IP per day     (generous: every runnable script ~5 times over)
  - global per day     (site-wide budget; the Gemini quota is the backstop)

Store: Upstash Redis (REST, serverless-safe) when UPSTASH_REDIS_REST_URL
and UPSTASH_REDIS_REST_TOKEN are set, so counts hold across function
instances. Fallback: per-process in-memory counters.
"""
from __future__ import annotations

import hashlib
import os
import time
from dataclasses import dataclass

PER_IP_PER_MINUTE = int(os.environ.get("RATE_LIMIT_PER_IP_MIN", "4"))
PER_IP_PER_DAY = int(os.environ.get("RATE_LIMIT_PER_IP_DAY", "75"))
GLOBAL_PER_DAY = int(os.environ.get("RATE_LIMIT_GLOBAL_DAY", "750"))


def enforced() -> bool:
    return bool(os.environ.get("VERCEL")) or os.environ.get("RATE_LIMIT_ENFORCE") == "1"


@dataclass
class Quota:
    allowed: bool
    per_ip_remaining: int
    global_remaining: int
    # Which window tripped when not allowed: "minute" | "day" | "global" | None
    limited_by: str | None = None


_UNLIMITED = Quota(allowed=True, per_ip_remaining=PER_IP_PER_DAY, global_remaining=GLOBAL_PER_DAY)


def _ip_key(ip: str) -> str:
    return hashlib.sha256(ip.encode()).hexdigest()[:16]


class _MemoryStore:
    def __init__(self) -> None:
        self._counts: dict[str, tuple[int, float]] = {}

    def incr(self, key: str, ttl: int) -> int:
        now = time.time()
        count, expires = self._counts.get(key, (0, now + ttl))
        if now > expires:
            count, expires = 0, now + ttl
        count += 1
        self._counts[key] = (count, expires)
        return count

    def get(self, key: str) -> int:
        count, expires = self._counts.get(key, (0, 0))
        return count if time.time() <= expires else 0


class _UpstashStore:
    def __init__(self, url: str, token: str) -> None:
        from upstash_redis import Redis

        self._redis = Redis(url=url, token=token)

    def incr(self, key: str, ttl: int) -> int:
        count = self._redis.incr(key)
        if count == 1:
            self._redis.expire(key, ttl)
        return count

    def get(self, key: str) -> int:
        v = self._redis.get(key)
        return int(v) if v else 0


def _make_store():
    from .redis_env import redis_rest_credentials

    url, token = redis_rest_credentials()
    if url and token:
        try:
            return _UpstashStore(url, token)
        except Exception:  # missing package / bad creds: degrade, don't die
            pass
    return _MemoryStore()


_store = _make_store()


def store():
    """Shared counter store (also used by the waitlist signup guard)."""
    return _store


def _keys(ip: str) -> tuple[str, str, str]:
    minute = int(time.time() // 60)
    day = time.strftime("%Y-%m-%d", time.gmtime())
    h = _ip_key(ip)
    return f"rl:ip:{h}:m{minute}", f"rl:ip:{h}:d{day}", f"rl:global:{day}"


def _quota(ip_min: int, ip_day: int, global_day: int) -> Quota:
    limited_by = None
    if ip_min > PER_IP_PER_MINUTE:
        limited_by = "minute"
    elif ip_day > PER_IP_PER_DAY:
        limited_by = "day"
    elif global_day > GLOBAL_PER_DAY:
        limited_by = "global"
    return Quota(
        allowed=limited_by is None,
        per_ip_remaining=max(0, PER_IP_PER_DAY - ip_day),
        global_remaining=max(0, GLOBAL_PER_DAY - global_day),
        limited_by=limited_by,
    )


def peek(ip: str) -> Quota:
    if not enforced():
        return _UNLIMITED
    min_key, day_key, global_key = _keys(ip)
    return _quota(
        _store.get(min_key) + 1, _store.get(day_key) + 1, _store.get(global_key) + 1
    )


def check_and_increment(ip: str) -> Quota:
    if not enforced():
        return _UNLIMITED
    quota = peek(ip)
    if not quota.allowed:
        return quota
    min_key, day_key, global_key = _keys(ip)
    ip_min = _store.incr(min_key, 120)
    ip_day = _store.incr(day_key, 172800)
    global_day = _store.incr(global_key, 172800)
    return _quota(ip_min, ip_day, global_day)
