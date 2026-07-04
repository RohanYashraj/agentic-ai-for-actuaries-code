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
