"""Resolve Upstash Redis REST credentials from the environment.

Vercel's marketplace injects different variable names depending on which
Upstash product was connected: the standalone Upstash integration sets
UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN, while the Redis (KV)
product sets KV_REST_API_URL / KV_REST_API_TOKEN. Both point at the same
Upstash REST API, so accept either, preferring the UPSTASH_* names.
"""
from __future__ import annotations

import os


def redis_rest_credentials() -> tuple[str | None, str | None]:
    url = os.environ.get("UPSTASH_REDIS_REST_URL") or os.environ.get("KV_REST_API_URL")
    token = os.environ.get("UPSTASH_REDIS_REST_TOKEN") or os.environ.get("KV_REST_API_TOKEN")
    return url, token
