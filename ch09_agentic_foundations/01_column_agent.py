# ── Section purpose: a minimal Agno agent that explains a column name ──
# Book reference: Chapter 9, §9.6 "Your First Agent (Code)"
from agno.agent import Agent              # high-level Agent class
from agno.models.google import Gemini     # Gemini model wrapper for Agno


# Tool the agent can call. Agno turns this Python function into a tool
# definition automatically by reading the type hints and the docstring.
def lookup_column_definitions(column_name: str) -> str:
    """Look up the definition of a claims-triangle column.

    Args:
        column_name (str): The column name to look up.
    """
    definitions = {
        'paid_loss_usd':     'Cumulative paid losses to date, in USD.',
        'reported_loss_usd': 'Cumulative reported losses (paid + case reserve), in USD.',
        'case_reserve_usd':  'Case reserve held on open claims, in USD.',
        'payment_currency':  'ISO currency code of the original payment, free text.',
    }
    return definitions.get(column_name, 'Unknown column.')


# Build the agent. Agno wraps the loop for us; we supply tools and instructions.
column_agent = Agent(
    model=Gemini(id='gemini-3.1-flash-lite'),
    tools=[lookup_column_definitions],
    instructions='Explain claims-triangle columns clearly and concisely.',
    tool_call_limit=5,                   # cap tool calls per run, like an iteration cap
    markdown=True,
)

# Run the agent on a goal. print_response runs the full loop and prints the answer.
agent_goal = "Explain what the column 'payment_currency' means in the motor triangle."
column_agent.print_response(agent_goal, stream=True)
