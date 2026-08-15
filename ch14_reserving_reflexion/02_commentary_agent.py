# Repo demo (not a printed listing): a simple commentary agent
# exercising the Chapter 14 draft_movement_commentary tool. The tool
# itself, and its direct test, live in tools_commentary.py — run that
# first to see the raw cited-paragraph dict the agent consumes here.
import os

from agno.agent import Agent
from agno.models.google import Gemini

from tools_commentary import draft_movement_commentary

# The reserving actuary supplies the reconciliation figures; the agent
# drafts the citation-backed paragraph through the tool. The prompt and
# instructions deliberately avoid echoing the tool's name in prose:
# "reserve-movement commentary" phrasing adjacent to the identifier once
# primed Gemini into calling a non-existent
# draft_movement_movement_commentary. tool_choice="validated" (a
# Gemini-only function-calling mode; other providers would reject it)
# additionally constrains the model to the declared tool names.
commentary_agent = Agent(
    model=Gemini(id="gemini-3.1-flash-lite"),
    tools=[draft_movement_commentary],
    tool_call_limit=3,
    markdown=True,
    tool_choice="validated" if os.getenv("MODEL_PROVIDER", "google") == "google" else None,
    instructions=(
        "Call draft_movement_commentary once, passing the reconciliation "
        "figures from the request as the reflexion_output dict (use empty "
        "dicts for reasoning_trace and prior_cycle_decisions if none are "
        "supplied). Return the tool's paragraph and citations verbatim. "
        "Only call the tools you have been given."
    ),
)

if __name__ == "__main__":
    sample_reflexion = {"status": "ok", "actual_ldf_12_24": 1.56,
                        "expected_ldf_12_24": 1.55, "deviation_pct": 0.65,
                        "tolerance_pct": 1.5}
    commentary_agent.print_response(
        f"Reconciliation figures for this cycle: {sample_reflexion}. "
        "Produce the cited paragraph with the tool.",
        stream=True,
    )
