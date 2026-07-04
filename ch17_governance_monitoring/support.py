# ── ch17_governance_monitoring/support.py ────────────────────────────
# Synthetic implementations of the monitoring helpers the Chapter 17
# listing references: read_thresholds, read_metrics,
# check_against_thresholds, aggregate_status. Thresholds and metrics
# ship in data/metrics_registry.json.
import json
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


def _registry() -> dict:
    with open(os.path.join(DATA_DIR, "metrics_registry.json")) as f:
        return json.load(f)


def read_thresholds(agent_name: str) -> dict:
    """Read pinned thresholds from the operational metrics registry."""
    registry = _registry()
    thresholds = dict(registry["agents"][agent_name]["thresholds"])
    thresholds["registry_version"] = registry["registry_version"]
    return thresholds


def read_metrics(agent_name: str, window_days: int) -> dict:
    """Read the rolling-window metrics for the named agent."""
    return dict(_registry()["agents"][agent_name]["metrics_7d"])


def check_against_thresholds(metrics: dict, thresholds: dict) -> dict:
    """Diagnostic surface: which metric cells sit out of band."""
    diagnostic = {}
    for metric_name, observed in metrics.items():
        limit = thresholds.get(metric_name)
        if limit is None:
            continue
        diagnostic[metric_name] = {
            "observed": observed,
            "threshold": limit,
            "in_band": observed <= limit,
        }
    return diagnostic


def aggregate_status(diagnostic: dict) -> str:
    """Worst case across the metric cells.

    nominal   — all metrics in band
    degraded  — one metric out of band
    out_of_range — two or more out of band
    incident  — schema failures out of band (hard governance breach)
    """
    breaches = [name for name, cell in diagnostic.items() if not cell["in_band"]]
    if "output_schema_failures" in breaches:
        return "incident"
    if len(breaches) >= 2:
        return "out_of_range"
    if len(breaches) == 1:
        return "degraded"
    return "nominal"
