# Repo demo (not a printed listing): a simple governance agent
# exercising the Chapter 17 monitoring_dashboard tool. The tool itself,
# and its direct test, live in 01_monitoring_dashboard.py — run that
# first to see the raw structured-status dict the agent consumes here.
import importlib

from agno.agent import Agent
from agno.models.google import Gemini

# Numeric module names can't be imported with a plain import statement.
monitoring_dashboard = importlib.import_module(
    "01_monitoring_dashboard").monitoring_dashboard

# The reviewer asks for an agent's operational status in plain language
# and gets the diagnostic surface summarised, with escalation advice
# when out of band.
governance_agent = Agent(
    model=Gemini(id="gemini-3.1-flash-lite"),
    tools=[monitoring_dashboard],
    tool_call_limit=4,
    markdown=True,
    instructions=(
        "Report the operational status of the named agent using the "
        "monitoring_dashboard tool. Summarise any breached thresholds "
        "and recommend escalation when the status is not nominal. "
        "Only call the tools you have been given."
    ),
)

if __name__ == "__main__":
    governance_agent.print_response(
        "Check the 7-day operational status of reserving_agent and "
        "summarise any threshold breaches for the governance committee.",
        stream=True,
    )
