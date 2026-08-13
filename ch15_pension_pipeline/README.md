# Chapter 15 — Multi-Scheme Pension Pipeline

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/rohanyashraj/agentic-ai-for-actuaries-code/blob/main/notebooks/ch15.ipynb)

| Script | Book listing | Needs API key |
|---|---|---|
| `01_pension_valuation.py` | pension_valuation.py | Yes (tool testable without) |
| `02_quality_gate.py` | quality_gate.py | No (direct tool test) |
| `03_member_communication.py` | draft_member_communication.py | No (direct tool test) |
| `04_ingestion_agent.py` | — (repo demo, not a printed listing) | Yes |

`support.py` supplies the assumption-basis object (with the `.shift()`
sensitivity mechanics the listing uses), annuity-certain approximations
of Technical Provisions and the LTFT, the four member-data validators,
and the member-record / statement-prose helpers. Member data ships at
`../data/uk_annuity_members.csv`. The valuation is a deliberately
simple approximation — not a TAS 300-compliant funding valuation.

## Script summaries and how to run

All commands are run from this folder.

### `01_pension_valuation.py`
The funding valuation tool for a closed UK DB scheme: computes base-case
Technical Provisions and the Long-Term Funding Target, plus a six-way
sensitivity panel (discount rate ±100bp, longevity ±25%, inflation
±50bp). The agent runs the tool and summarises the panel for the Scheme
Actuary.

```bash
uv run --env-file ../.env python 01_pension_valuation.py
```

### `02_quality_gate.py`
The pipeline's ingestion gate: validates the member-data file for
parseability, required schema fields, plausible value ranges, and
duplicate member ids, returning `ok` or `needs_review` with a diagnostic
naming the failed check. Runs directly against the shipped member file.

```bash
uv run python 02_quality_gate.py
```

### `03_member_communication.py`
Drafts a member's annual annuity statement: reads the member record and
the scheme valuation output (built by calling the script 01 tool
directly), computes next year's escalated pension, and returns the
statement prose with member-visible citations for every figure.

```bash
uv run python 03_member_communication.py
```

### `04_ingestion_agent.py`
Repo demo (not a printed listing): a simple ingestion agent that
imports the `quality_gate` tool from `02_quality_gate.py`, runs the
gate on scheme UKDB-MER-001's member file, and reports pass / route to
manual review in plain language.

```bash
uv run --env-file ../.env python 04_ingestion_agent.py
```
