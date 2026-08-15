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
import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))  # for common/
from common.config import get_model
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
    model=get_model(),
    tools=[reconcile_against_developed_losses, retrieve_prior_cycle],
    db=SqliteDb(db_file="meridian_reserving_memory.db"),  # was: memory=Memory(db=...)
    enable_user_memories=True,
    tool_call_limit=10,
    markdown=True,
    instructions=(
        "First call retrieve_prior_cycle to get the prior cycle's LDF "
        "expectations. Then take the observed 12-24 development factor "
        "from the reserving step's output and call "
        "reconcile_against_developed_losses to compare actual against "
        "expected. Surface deviations exceeding the firm's 1.5 percent "
        "tolerance. Do not revise reserves; route deviations to the "
        "reserving actuary's review queue."
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
    # The input names no tools: it is passed verbatim to the inner
    # workflow's agents, which do not have the reconciliation tools —
    # naming those here makes the inner agents attempt calls to
    # functions they don't own ("Function ... not found"). The evaluate
    # step's tool sequence lives in the reconciliation agent's
    # instructions instead.
    reserving_reflexion_workflow.print_response(
        "Run the FY2024 Q3 motor India reserving cycle and report the "
        "reserve estimates, development factors, and reconciliation.",
        markdown=True,
        stream=True,
    )
