# Chapter 10 — Designing Actuarial Tools

| Script | Book listing | Needs API key |
|---|---|---|
| `01_mortality_tool.py` | §10.2 mortality lookup tool | No (direct tool test) |
| `02_present_value_tool.py` | §10.4 PV tool with error handling | No (direct tool test) |
| `03_term_life_premium_agent.py` | Illustrative Case Study (Tools 1-3 + agent) | Yes |

Deviations from print: the book attributes `_ialm_lookup` and
`_experience_lookup` to "the firm's existing library". `support.py`
supplies synthetic implementations — the mortality table is a
Gompertz-shaped synthetic (data/ialm_2012_14_ulp.csv), NOT the real
IALM 2012-14 ULP table, and the experience register returns the case
study's 0.95 / TL_EXP_2023 record.

## Script summaries and how to run

All commands are run from this folder.

### `01_mortality_tool.py`
A standalone tool (no agent) that returns the one-year mortality rate
q_x from the synthetic IALM-style table, with an 18–99 age validation
gate and a structured-status return. The `__main__` block exercises
both the `ok` path (age 35) and the `out_of_range` path (age 105).

```bash
uv run python 01_mortality_tool.py
```

### `02_present_value_tool.py`
A present-value tool demonstrating structured error handling: a sanity
bound on the discount rate, an ISO date check, and exceptions converted
into an explicit `error` status instead of propagating. The `__main__`
block exercises the `ok`, `out_of_range`, and `error` paths.

```bash
uv run python 02_present_value_tool.py
```

### `03_term_life_premium_agent.py`
The chapter's case-study agent: combines the mortality lookup, the
experience-study adjustment query, and the present-value tool to compute
the net annual level premium for a 10-year term policy on a 35-year-old
male non-smoker, returning the premium with full tool provenance.

```bash
uv run --env-file ../.env python 03_term_life_premium_agent.py
```
