# Chapter 15 — Multi-Scheme Pension Pipeline

| Script | Book listing | Needs API key |
|---|---|---|
| `01_pension_valuation.py` | pension_valuation.py | Yes (tool testable without) |
| `02_quality_gate.py` | quality_gate.py | No (direct tool test) |
| `03_member_communication.py` | draft_member_communication.py | No (direct tool test) |

`support.py` supplies the assumption-basis object (with the `.shift()`
sensitivity mechanics the listing uses), annuity-certain approximations
of Technical Provisions and the LTFT, the four member-data validators,
and the member-record / statement-prose helpers. Member data ships at
`../data/uk_annuity_members.csv`. The valuation is a deliberately
simple approximation — not a TAS 300-compliant funding valuation.
