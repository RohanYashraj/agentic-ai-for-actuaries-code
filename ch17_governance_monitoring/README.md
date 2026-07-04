# Chapter 17 — Governance, Monitoring, Observability

| Script | Book listing | Needs API key |
|---|---|---|
| `01_monitoring_dashboard.py` | §17.5 monitoring_dashboard tool | No (direct tool test) |

`support.py` supplies read_thresholds / read_metrics /
check_against_thresholds / aggregate_status over
`../data/metrics_registry.json`. The registry ships with two agents:
`data_quality_agent` (returns nominal) and `reserving_agent` (returns
incident — a schema failure plus latency and escalation breaches), so
both status paths are exercised.

Chapter 18 contains no code by design; the book's Part V closes at the
conceptual level after this chapter's patterns.
