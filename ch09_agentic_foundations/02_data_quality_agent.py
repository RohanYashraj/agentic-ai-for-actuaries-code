# ── Data quality agent: Agno + three actuarial tools ──
# Book reference: Chapter 9, Case Study "Building a Data Quality Agent"
# Repo note: the CSV path points at the repo's data directory; the book
# assumes the file sits alongside the script.
import os

import pandas as pd
from agno.agent import Agent
from agno.models.google import Gemini

# Load the Meridian Re motor India triangle from the warehouse extract.
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
triangle_df = pd.read_csv(os.path.join(DATA_DIR, 'meridian_motor_india_triangle.csv'))


# Tool 1: count missing values in each loss column.
def check_missing_values() -> dict:
    """Count missing values in each loss column of the motor India triangle.

    Returns the count of missing entries per loss column.
    """
    loss_columns = ['paid_loss_usd', 'reported_loss_usd', 'case_reserve_usd']
    return {'missing_by_column': triangle_df[loss_columns].isna().sum().to_dict()}


# Tool 2: find rows with negative case reserves.
def check_negative_reserves() -> dict:
    """Find rows in the motor India triangle with negative case reserves.

    Negative case reserves usually indicate a roll-forward error.
    """
    flagged = triangle_df[triangle_df['case_reserve_usd'] < 0]
    return {
        'negative_reserve_count': len(flagged),
        'rows': flagged[['accident_year', 'dev_period_months', 'case_reserve_usd']].to_dict('records'),
    }


# Tool 3: find rows where reported_loss_usd is lower than paid_loss_usd.
def check_development_consistency() -> dict:
    """Find rows where reported_loss_usd is lower than paid_loss_usd.

    Reported < paid usually indicates recoveries mis-coded as negative payments.
    """
    inconsistent = triangle_df[triangle_df['reported_loss_usd'] < triangle_df['paid_loss_usd']]
    return {
        'inconsistency_count': len(inconsistent),
        'rows': inconsistent[['accident_year', 'dev_period_months',
                               'paid_loss_usd', 'reported_loss_usd']].to_dict('records'),
    }


# Build the data quality agent. The three Python functions become tools
# automatically; their docstrings become the tool descriptions.
data_quality_agent = Agent(
    model=Gemini(id='gemini-3.1-flash-lite'),
    tools=[
        check_missing_values,
        check_negative_reserves,
        check_development_consistency,
    ],
    instructions=(
        'You are a data quality agent for actuarial claims triangles. '
        'Use the three tools available to scan for issues, reason about which '
        'flags are worth raising, and produce a short report with one paragraph '
        'per issue type.'
    ),
    tool_call_limit=10,
    markdown=True,
)

if __name__ == "__main__":
    agent_goal = (
        'Scan the motor India triangle for data quality issues '
        'and produce a short report.'
    )
    data_quality_agent.print_response(agent_goal, stream=True)
