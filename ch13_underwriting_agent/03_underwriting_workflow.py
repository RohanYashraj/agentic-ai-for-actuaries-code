# Three-agent underwriting workflow — fixed path.
# Book reference: Chapter 13, "The Three-Agent Workflow"
# Repo note: tools referenced "from the firm's library" live in
# support.py and the sibling listing modules.
import importlib

from agno.agent import Agent
from agno.models.google import Gemini
from agno.workflow import Workflow, Step

from support import (
    fetch_emblem_radar_premium,
    parse_loss_summary,
    query_internal_loss_db,
    query_marketview_aggregator,
)

# Numeric module names can't be imported with a plain import statement.
extract_cope_attributes = importlib.import_module(
    "01_cope_extraction_tool").extract_cope_attributes
compare_to_pricing_model = importlib.import_module(
    "02_pricing_reconciliation_tool").compare_to_pricing_model

# Three specialised agents — each with a narrow, named scope
submission_agent = Agent(
    model=Gemini(id='gemini-3.1-flash-lite'),
    tools=[extract_cope_attributes, parse_loss_summary],
    tool_call_limit=10,  # bound the agent loop; case-study default
    instructions="Extract COPE attributes and prior loss history.",
)

market_data_agent = Agent(
    model=Gemini(id='gemini-3.1-flash-lite'),
    tools=[query_internal_loss_db, query_marketview_aggregator],
    tool_call_limit=10,
    instructions="Retrieve comparable internal claims and market benchmarks.",
)

pricing_comparison_agent = Agent(
    model=Gemini(id='gemini-3.1-flash-lite'),
    tools=[fetch_emblem_radar_premium, compare_to_pricing_model],
    tool_call_limit=10,
    instructions="Compare GLM technical premium against comparable-account median.",
)

# Fixed-path workflow — the sequence is decided in advance, not at runtime
underwriting_workflow = Workflow(
    name="commercial_property_underwriting",
    steps=[
        Step(name="extraction", agent=submission_agent),
        Step(name="market_data", agent=market_data_agent),
        Step(name="pricing_comparison", agent=pricing_comparison_agent),
    ],
)

if __name__ == "__main__":
    # Run the workflow on a single submission
    run_response = underwriting_workflow.run(
        "Process submission ../data/submissions/MR-CHI-2025-Q3-018.pdf "
        "(reference MR-CHI-2025-Q3-018) and produce a draft recommendation."
    )
    print(run_response.content)
