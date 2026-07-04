# Chapter 13 — Commercial Property Underwriting

| Script | Book listing | Needs API key |
|---|---|---|
| `01_cope_extraction_tool.py` | COPE extraction tool | No (direct tool test) |
| `02_pricing_reconciliation_tool.py` | Pricing reconciliation tool | No (direct tool test) |
| `03_underwriting_workflow.py` | Three-agent fixed-path workflow | Yes |

The synthetic broker submission ships at
`../data/submissions/MR-CHI-2025-Q3-018.pdf`. `support.py` supplies the
"firm's submission-handling library" helpers (pypdf-based text
extraction, a keyword COPE parser), the internal loss database query
(over `../data/internal_loss_db.csv`), a synthetic MarketView
benchmark, and a synthetic Emblem/Radar rating engine.

## Script summaries and how to run

All commands are run from this folder.

### `01_cope_extraction_tool.py`
Extracts the COPE attributes (Construction, Occupancy, Protection,
Exposure) plus TIV from the synthetic broker submission PDF, with a
validation gate requiring all four families to populate and exceptions
converted to a structured `error` status. Prints the status and the
extracted COPE dict.

```bash
uv run python 01_cope_extraction_tool.py
```

### `02_pricing_reconciliation_tool.py`
Reconciles the GLM technical premium against the comparable-account
median with the firm's 10% threshold: within tolerance it recommends the
midpoint premium; above it, the submission routes to a senior
underwriter. The `__main__` block exercises both paths.

```bash
uv run python 02_pricing_reconciliation_tool.py
```

### `03_underwriting_workflow.py`
The three-agent fixed-path workflow: a submission agent (COPE + loss
history extraction), a market data agent (internal comparables +
MarketView benchmark), and a pricing comparison agent (Emblem/Radar
premium vs comparable median) process the submission end to end and
produce a draft recommendation.

```bash
uv run --env-file ../.env python 03_underwriting_workflow.py
```
