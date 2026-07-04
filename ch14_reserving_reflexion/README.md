# Chapter 14 — Reserving with Reflexion

| Script | Book listing | Needs API key |
|---|---|---|
| `tools_reserving.py` | meridian_re/tools/reserving.py (Cape Cod tool) | No (direct tool test) |
| `tools_commentary.py` | meridian_re/tools/commentary.py | No (direct tool test) |
| `01_reserving_reflexion_workflow.py` | meridian_re/workflows/reserving_reflexion.py | Yes |

⚠ API compatibility: the printed workflow uses `Memory(db=SqliteDb(...))`;
this repo uses the current `Agent(db=..., enable_user_memories=True)`
equivalent. See ERRATA in the root README.

`support.py` supplies load_triangle / compute_cape_cod_elr /
apply_cape_cod_blend (didactic Cape Cod on the clean triangle with
synthetic earned premium), the reconciliation tools with the chapter's
1.5% tolerance, the stable/deviation paragraph templates, and
`build_reserving_review_workflow` (rebuilding the Chapter 11 inner
workflow with Cape Cod added). A prior-cycle record is seeded on first
run so `retrieve_prior_cycle` has something to return.
