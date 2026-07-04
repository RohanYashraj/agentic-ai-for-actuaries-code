# Long-term memory: a file-backed store that survives across runs
# Book reference: Chapter 12, §12.3 "Long-Term Memory"
#
# ⚠ API COMPATIBILITY NOTE (see ERRATA in the root README):
# The printed listing uses `from agno.memory import Memory` and
# `Agent(memory=Memory(db=...))`. That class was removed in later Agno
# 2.x releases. The current equivalent — same behaviour, same SQLite
# persistence keyed to user_id — is `Agent(db=SqliteDb(...),
# enable_user_memories=True)`, used below. This is exactly the
# version-pinning re-test the book's TECHNICAL NOTE anticipates.
from agno.agent import Agent
from agno.db.sqlite import SqliteDb
from agno.models.google import Gemini

# The .db file is the persistence layer; it lives on disk between runs
experience_study_db = SqliteDb(db_file="meridian_xs_memory.db")

# The agent now reads and writes memory keyed to the actuary's user_id
life_valuation_agent = Agent(
    model=Gemini(id="gemini-3.1-flash-lite"),
    db=experience_study_db,          # was: memory=Memory(db=...) in print
    enable_user_memories=True,       # persistent memory across runs
    user_id="mumbai_life_valuation",
    tool_call_limit=10,
    markdown=True,
)

if __name__ == "__main__":
    # First run: give the agent something worth remembering.
    life_valuation_agent.print_response(
        "Remember: the FY2024 Q3 experience adjustment factor for term life "
        "India is 0.95, per study TL_EXP_2023.",
        stream=True,
    )
    # Second run — a NEW process would recall this from the .db file.
    life_valuation_agent.print_response(
        "What adjustment factor applies to term life India this cycle, and "
        "which study governs it?",
        stream=True,
    )
