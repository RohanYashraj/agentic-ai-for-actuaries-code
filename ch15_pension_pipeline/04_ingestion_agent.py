# Repo demo (not a printed listing): a simple ingestion agent
# exercising the Chapter 15 quality_gate tool. The tool itself, and its
# direct test, live in 02_quality_gate.py — run that first to see the
# raw structured-status dict the agent consumes here.
import importlib
import os

from agno.agent import Agent
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))  # for common/
from common.config import get_model

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

# Numeric module names can't be imported with a plain import statement.
check_scheme_data = importlib.import_module(
    "02_quality_gate").check_scheme_data

# The administrator names a scheme and file; the agent runs the gate
# and reports pass / route to manual review.
ingestion_agent = Agent(
    model=get_model(),
    tools=[check_scheme_data],
    tool_call_limit=3,
    markdown=True,
    instructions=(
        "Run the quality_gate tool on the named scheme and member-data "
        "file, then report whether the scheme passes ingestion or "
        "routes to the manual review queue, naming any failed check. "
        "Only call the tools you have been given."
    ),
)

if __name__ == "__main__":
    members_file = os.path.join(DATA_DIR, "uk_annuity_members.csv")
    ingestion_agent.print_response(
        f"Run the ingestion quality gate for scheme UKDB-MER-001 on the "
        f"member file {members_file} and report the result.",
        stream=True,
    )
