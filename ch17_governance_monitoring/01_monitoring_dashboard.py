# Monitoring dashboard tool.
# Book reference: Chapter 17, §17.5 "Monitoring and Observability"
# Repo note: read_thresholds, read_metrics, check_against_thresholds and
# aggregate_status live in support.py; the registry ships in
# data/metrics_registry.json. For an agent exercising this tool, see
# 02_governance_agent.py.
from agno.tools import tool

from support import (
    aggregate_status,
    check_against_thresholds,
    read_metrics,
    read_thresholds,
)


@tool
def monitoring_dashboard(
    agent_name: str,
    window_days: int = 7,
) -> dict:
    """Return operational metrics for the named agent over the window.

    Read-only against the operational metrics store. Returns a
    structured-status dict. Threshold values come from the firm's
    monitoring configuration registry, not from the agent's runtime
    state.
    """
    # Read pinned thresholds from the operational metrics registry.
    thresholds = read_thresholds(agent_name)            # firm-maintained
    metrics    = read_metrics(agent_name, window_days)  # rolling window

    # Threshold check produces the diagnostic surface (cells out of band).
    diagnostic = check_against_thresholds(metrics, thresholds)

    # Status is the worst case across the six metrics.
    status = aggregate_status(diagnostic)
    # Status values: nominal, degraded, out_of_range, incident.

    return {
        "status":     status,
        "data":       metrics,
        "diagnostic": diagnostic,
        "version":    thresholds["registry_version"],
    }


if __name__ == "__main__":
    # data_quality_agent runs nominal; reserving_agent trips thresholds.
    print(monitoring_dashboard.entrypoint("data_quality_agent"))
    print(monitoring_dashboard.entrypoint("reserving_agent"))
