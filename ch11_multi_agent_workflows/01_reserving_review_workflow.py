# Agent definitions follow the Chapter 9 and 10 patterns; the Tool
# decorations and the structured-status return shape carry forward unchanged.
# Book reference: Chapter 11, "Code" section.
# Repo notes:
#   - Tool functions "defined elsewhere" in the book live in support.py.
#   - The printed listing has a leading space in the model id
#     (" gemini-3.1-flash-lite"); corrected here. See ERRATA in the
#     root README.
from agno.agent import Agent
from agno.models.google import Gemini
from agno.workflow import Workflow, Step

from support import (
    apply_bornhuetter_ferguson,
    data_quality_agent,
    draft_commentary_paragraph,
    fetch_triangle,
    fit_chain_ladder,
    read_reserving_output,
    reconcile_methods,
)

# Reserving Agent: chain ladder + Bornhuetter-Ferguson + reconciliation.
# Tool functions defined elsewhere; descriptions are the prompts the model sees.
reserving_agent = Agent(
    name="ReservingAgent",
    model=Gemini(id="gemini-3.1-flash-lite"),
    description=(
        "Computes chain ladder and Bornhuetter-Ferguson reserve estimates "
        "on the motor India triangle and reconciles them."
    ),
    tools=[fetch_triangle, fit_chain_ladder,
           apply_bornhuetter_ferguson, reconcile_methods],
    tool_call_limit=8,  # hard cap on tool calls
)

# Commentary Agent: drafts memo paragraphs from the Reserving Agent output.
# No access to the triangle directly — read/write separation per Chapter 10.
commentary_agent = Agent(
    name="CommentaryAgent",
    model=Gemini(id="gemini-3.1-flash-lite"),
    description=(
        "Drafts a three-paragraph reserving commentary citing only "
        "figures present in the reserving output dict."
    ),
    tools=[read_reserving_output, draft_commentary_paragraph],
    tool_call_limit=6,
)

# Workflow: data quality -> reserving -> commentary, fixed path.
# Each Step validates the prior step's status before running.
reserving_review_workflow = Workflow(
    name="ReservingReviewWorkflow",
    steps=[
        Step(name="data_quality", agent=data_quality_agent),
        Step(name="reserving",    agent=reserving_agent),
        Step(name="commentary",   agent=commentary_agent),
    ],
)

if __name__ == "__main__":
    # Run for FY2024 Q3 motor India.
    run_response = reserving_review_workflow.run(
        input={
            "as_of_date": "2024-09-30",
            "line_of_business": "motor_india",
            "triangle_table": "meridian_claims.triangle_motor_india",
            "regulatory_basis": "IRDAI",
        },
    )
    print(run_response.content)
