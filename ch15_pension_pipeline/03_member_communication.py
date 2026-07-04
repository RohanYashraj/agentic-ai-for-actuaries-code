# draft_member_communication.py — annual annuity statement with source-tracing.
# Book reference: Chapter 15, "Architecture" and "Results"
# Repo note: fetch_member_record and generate_statement_prose live in
# support.py.
from agno.agent import Agent
from agno.models.google import Gemini
from agno.tools import tool

from support import fetch_member_record, generate_statement_prose


@tool(name="draft_member_communication")
def draft_annual_statement(member_id: str, valuation_date: str, valuation_output: dict) -> dict:
    """Draft an annual annuity statement for a member of a closed UK DB scheme.

    Produces structured prose with a citations field. The citations render
    source data points visible to the member, not only the Fellow reviewer —
    the audience adjustment for consumer-facing output.
    """
    # Read the member record and the scheme-level valuation output from upstream stages.
    member_record = fetch_member_record(member_id, valuation_date)
    scheme_basis  = valuation_output["assumption_basis"]

    pension_paid_in_year = member_record["pension_paid_year_gbp"]
    escalation_index     = scheme_basis["inflation_assumption"]
    pension_next_year    = pension_paid_in_year * (1 + escalation_index)

    statement_text = generate_statement_prose(member_record, pension_next_year, escalation_index)

    # Citations — every numerical claim back-traces to a named source.
    citations = {
        "pension_paid_in_year_gbp": "member_record.pension_paid_year_gbp",
        "escalation_index":         f"scheme_basis.inflation_assumption ({scheme_basis['inflation_basis']})",
        "pension_next_year_gbp":    "computed: pension_paid_in_year * (1 + escalation_index)",
        "mortality_table":          scheme_basis["mortality_table_version"],
    }

    return {
        "status":          "ok",
        "member_id":       member_id,
        "statement_text":  statement_text,
        "citations":       citations,
    }


# The commentary agent runs on Google Gemini and calls the tool above.
commentary_agent = Agent(
    model=Gemini(id="gemini-3.1-flash-lite"),
    tools=[draft_annual_statement],
    tool_call_limit=3,
    markdown=True,
)

if __name__ == "__main__":
    # Build a valuation output by running the Ch 15 valuation tool directly.
    import importlib
    value_scheme = importlib.import_module("01_pension_valuation").value_scheme
    valuation_output = value_scheme.entrypoint("UKDB-MER-001", "2025-03-31")
    print(draft_annual_statement.entrypoint(
        member_id="UKA-00007", valuation_date="2025-03-31",
        valuation_output=valuation_output))
