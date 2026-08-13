# Chapter 16 — Regulatory Monitoring, Capital, ORSA

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/rohanyashraj/agentic-ai-for-actuaries-code/blob/main/notebooks/ch16.ipynb)

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

## Script summaries and how to run

All commands are run from this folder.

### `01_regulatory_monitoring_tool.py`
The regulatory monitoring tool: fetches new publications for a source in
the Group Risk source-of-truth registry (synthetic offline feed —
rejects sources outside the registry), stamps retrieval time, and
truncates verbatim excerpts to 14 words per the copyright discipline.
The agent checks EIOPA and summarises what is relevant to long-term
guarantee business.

```bash
uv run --env-file ../.env python 01_regulatory_monitoring_tool.py
```

### `02_capital_impact_tool.py`
The capital impact tool: reads the named capital model snapshot
(read-only), returns the SCR module breakdown, and attributes the
publication's impact to modules per affected business line. The agent
assesses EIOPA-BoS-25-142 against snapshot SNAP-FY2025-Q2.

```bash
uv run --env-file ../.env python 02_capital_impact_tool.py
```

### `03_orsa_drafting_tool.py`
The ORSA drafting tool: assembles a risk-profile paragraph from a typed
impact assessment with supervisor-audience citations — every
quantitative claim back-traces to a capital model output id, parameter
version, and prior-period precedent. The `__main__` block chains it off
the script 02 tool directly, no agent run needed.

```bash
uv run python 03_orsa_drafting_tool.py
```
