# Chapter 14 — Reserving with Reflexion

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/rohanyashraj/agentic-ai-for-actuaries-code/blob/main/notebooks/ch14.ipynb)

| Script | Book listing | Needs API key |
|---|---|---|
| `tools_reserving.py` | meridian_re/tools/reserving.py (Cape Cod tool) | No (direct tool test) |
| `tools_commentary.py` | meridian_re/tools/commentary.py | No (direct tool test) |
| `02_commentary_agent.py` | — (repo demo, not a printed listing) | Yes |
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

## Script summaries and how to run

All commands are run from this folder.

### `tools_reserving.py`
The Cape Cod reserving tool (`@tool`): loads the clean triangle,
derives the expected loss ratio from the data (unlike BF's assumed
a-priori ELR), and returns the Cape Cod ultimate per accident year with
segment weights and provenance. The `__main__` block calls the tool
entrypoint directly.

```bash
uv run python tools_reserving.py
```

### `tools_commentary.py`
The movement-commentary tool: picks the stable or deviation paragraph
template based on the reconciliation status and returns structured
prose where every figure back-traces through a citations field. The
`__main__` block drafts a within-tolerance paragraph from a sample
reconciliation result.

```bash
uv run python tools_commentary.py
```

### `02_commentary_agent.py`
Repo demo (not a printed listing): a simple commentary agent that
imports `draft_movement_commentary` from `tools_commentary.py`, receives
the reconciliation figures in the prompt, and returns the cited
movement paragraph through the tool.

```bash
uv run --env-file ../.env python 02_commentary_agent.py
```

### `01_reserving_reflexion_workflow.py`
The reflexion loop: an "act" step runs the Chapter 11 inner reserving
workflow with Cape Cod added, then an "evaluate" step has a
reconciliation agent compare observed development against the prior
cycle's LDF expectations (1.5% tolerance), with SQLite-backed memory.
Deviations are routed to review, never auto-corrected.

```bash
uv run --env-file ../.env python 01_reserving_reflexion_workflow.py
```
