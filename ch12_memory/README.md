# Chapter 12 — Memory

| Script | Book listing | Needs API key |
|---|---|---|
| `01_sqlite_memory.py` | §12.3 SQLite long-term memory | Yes |
| `02_vector_knowledge.py` | §12.3 semantic memory (vector store) | Yes |

⚠ API compatibility: the printed listings use `from agno.memory import
Memory`, removed in later Agno 2.x releases. These scripts use the
current equivalent `Agent(db=SqliteDb(...), enable_user_memories=True)`
— behaviour is unchanged. See ERRATA in the root README.

`02_vector_knowledge.py` indexes the synthetic experience study archive
in `../data/xs_reports/fy2024/` into a local ChromaDB collection
(`./xs_index/`, gitignored). Delete `xs_index/` and the `.db` files to
reset state between runs.

## Script summaries and how to run

All commands are run from this folder.

### `01_sqlite_memory.py`
Persistent long-term memory backed by SQLite: the agent is told the
FY2024 Q3 experience adjustment factor in one run, then asked to recall
it in a second. Memories are keyed to the `mumbai_life_valuation`
user id and survive across processes in `meridian_xs_memory.db`
(gitignored) — rerun the script and it recalls the fact from disk.

```bash
uv run --env-file ../.env python 01_sqlite_memory.py
```

### `02_vector_knowledge.py`
Semantic memory over documents: indexes the synthetic FY2024 experience
study reports into a local ChromaDB collection (`./xs_index/`,
gitignored), then answers a question about smoker mortality by
retrieving from the archive. Indexing runs once at startup; delete
`xs_index/` to reset.

```bash
uv run --env-file ../.env python 02_vector_knowledge.py
```
