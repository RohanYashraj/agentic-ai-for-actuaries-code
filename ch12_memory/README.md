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
