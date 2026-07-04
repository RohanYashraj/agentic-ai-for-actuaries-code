# Chapter 16 — Regulatory Monitoring, Capital, ORSA

| Script | Book listing | Needs API key |
|---|---|---|
| `01_regulatory_monitoring_tool.py` | regulatory_monitoring_tool.py | Yes (tool testable without) |
| `02_capital_impact_tool.py` | capital_impact_tool.py | Yes (tool testable without) |
| `03_orsa_drafting_tool.py` | orsa_drafting_tool.py | No (direct tool test) |

`support.py` supplies `_retrieve_from_source` (a fixed synthetic
publication set — no live network calls to regulator sites),
`_load_capital_snapshot` (over `../data/capital_snapshots.json`), the
impact attribution helper, and the ORSA paragraph generator.

Note the printed listing header pins `agno==1.0.6`; the repo follows
Chapter 14's `agno>=2.0,<3.0` pin instead. See ERRATA in the root README.
