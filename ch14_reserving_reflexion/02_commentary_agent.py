# Repo demo (not a printed listing): a simple commentary agent
# exercising the Chapter 14 draft_movement_commentary tool. The tool
# itself, and its direct test, live in tools_commentary.py — run that
# first to see the raw cited-paragraph dict the agent consumes here.
from agno.agent import Agent
from agno.models.google import Gemini

from tools_commentary import draft_movement_commentary

# The reserving actuary supplies the reconciliation figures; the agent
# drafts the citation-backed movement paragraph through the tool.
commentary_agent = Agent(
    model=Gemini(id="gemini-3.1-flash-lite"),
    tools=[draft_movement_commentary],
    tool_call_limit=3,
    markdown=True,
    instructions=(
        "Draft the reserve-movement commentary by calling "
        "draft_movement_commentary with the reconciliation figures "
        "supplied in the request as the reflexion_output dict (pass "
        "empty dicts for reasoning_trace and prior_cycle_decisions if "
        "none are supplied). Return the paragraph and its citations. "
        "Only call the tools you have been given."
    ),
)

if __name__ == "__main__":
    sample_reflexion = {"status": "ok", "actual_ldf_12_24": 1.56,
                        "expected_ldf_12_24": 1.55, "deviation_pct": 0.65,
                        "tolerance_pct": 1.5}
    commentary_agent.print_response(
        "Draft the movement commentary for this cycle's reconciliation: "
        f"{sample_reflexion}",
        stream=True,
    )
