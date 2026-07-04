# meridian_re/workflows/reserving_reflexion.py
# Book reference: Chapter 14, "Code walkthrough"
#
# ⚠ API COMPATIBILITY NOTE (see ERRATA in the root README):
# The printed listing uses `from agno.memory import Memory` and
# `Agent(memory=Memory(db=SqliteDb(...)))`. Later Agno 2.x releases
# replaced that with `Agent(db=SqliteDb(...), enable_user_memories=True)`,
# used below — the persistence behaviour is unchanged.
from agno.agent import Agent
from agno.db.sqlite import SqliteDb
from agno.models.google import Gemini
from agno.workflow import Workflow, Step

from support import (
    build_reserving_review_workflow,
    reconcile_against_developed_losses,
    retrieve_prior_cycle,
)

# Inner workflow reused from Chapter 11, with Cape Cod added.
inner_workflow = build_reserving_review_workflow(
    include_cape_cod=True
)

# Reconciliation agent: reads next-cycle developed losses, retrieves
# prior cycle's LDF expectations from stored memory, runs the
# reconcile_against_developed_losses tool and returns a structured
# result.
reconciliation_agent = Agent(
    name="reconciliation",
    model=Gemini(id="gemini-3.1-flash-lite"),
    tools=[reconcile_against_developed_losses, retrieve_prior_cycle],
    db=SqliteDb(db_file="meridian_reserving_memory.db"),  # was: memory=Memory(db=...)
    enable_user_memories=True,
    tool_call_limit=10,
    instructions=(
        "Compare next-cycle actual development against prior cycle's "
        "LDF expectations. Surface deviations exceeding the firm's "
        "1.5 percent tolerance. Do not revise reserves; route "
        "deviations to the reserving actuary's review queue."
    ),
)

reserving_reflexion_workflow = Workflow(
    name="ReservingReflexion",
    steps=[
        Step(name="act", workflow=inner_workflow),
        Step(name="evaluate", agent=reconciliation_agent),
    ],
)

if __name__ == "__main__":
    run_response = reserving_reflexion_workflow.run(
        "Run the FY2024 Q3 motor India reserving cycle, then reconcile the "
        "observed 12-24 development factor against the prior cycle's "
        "expectation from retrieve_prior_cycle."
    )
    print(run_response.content)
