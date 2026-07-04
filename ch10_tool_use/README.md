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
