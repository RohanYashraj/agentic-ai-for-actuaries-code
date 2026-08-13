# Chapter 11 — Multi-Agent Coordination

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/rohanyashraj/agentic-ai-for-actuaries-code/blob/main/notebooks/ch11.ipynb)

| Script | Book listing | Needs API key |
|---|---|---|
| `01_reserving_review_workflow.py` | "Code" section: three-agent fixed-path workflow | Yes |

Deviations from print: the book notes "tool functions defined
elsewhere" — `support.py` supplies didactic chain ladder,
Bornhuetter-Ferguson, and reconciliation implementations on the clean
triangle, plus the Chapter 9 data quality agent for the first step.
The printed model id contains a leading space (see root README ERRATA);
corrected here. Steps hand results forward via a JSON scratch file to
preserve the read/write separation the chapter discusses.

## Script summaries and how to run

### `01_reserving_review_workflow.py`
A fixed-path, three-step Agno workflow: the Chapter 9 data quality agent
checks the triangle, a reserving agent fits chain ladder and
Bornhuetter-Ferguson and reconciles them (5% tolerance), and a
commentary agent drafts a memo citing only figures from the reserving
output. Steps hand results forward through a JSON scratch file
(`reserving_output.json`, gitignored) to preserve read/write separation.

```bash
uv run --env-file ../.env python 01_reserving_review_workflow.py
```
