# Chapter 9 — Agentic AI Foundations

| Script | Book listing | Needs API key |
|---|---|---|
| `01_column_agent.py` | §9.6 "Your First Agent (Code)" | Yes |
| `02_data_quality_agent.py` | Case Study "Building a Data Quality Agent" | Yes |

The environment setup commands from §9.5 are reproduced in the root
README. Run from this folder:
`uv run --env-file ../.env python 01_column_agent.py`.

Deviations from print: `02_data_quality_agent.py` reads the triangle
from `../data/meridian_motor_india_triangle.csv` (the book assumes the
CSV sits next to the script). The shipped triangle carries the four
seeded defect types the case study describes: two missing loss values,
one negative case reserve, one reported-below-paid row, and one
claim-count drop.
