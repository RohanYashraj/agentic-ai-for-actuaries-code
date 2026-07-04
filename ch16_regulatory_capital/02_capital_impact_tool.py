# capital_impact_tool.py
# Book reference: Chapter 16, "Architecture"
# Repo note: _load_capital_snapshot and _attribute_impact_by_business_line
# live in support.py; snapshots ship in data/capital_snapshots.json.
from agno.agent import Agent
from agno.models.google import Gemini
from agno.tools import tool

from support import _attribute_impact_by_business_line, _load_capital_snapshot


@tool
def assess_capital_impact(
    publication_id: str,
    affected_business_lines: list[str],
    capital_model_snapshot_id: str,
) -> dict:
    """Read the named capital model snapshot; return the SCR module
    breakdown and the impact attribution per affected business line.
    Read-only against snapshot_id; never mutates live state.
    """
    snapshot = _load_capital_snapshot(capital_model_snapshot_id)   # read-only

    # Discrimination surface: which modules drove which movement.
    module_breakdown = {
        "market_risk":               snapshot["scr_market_risk_usd_m"],
        "life_underwriting_risk":    snapshot["scr_life_uw_risk_usd_m"],
        "non_life_underwriting_risk":snapshot["scr_nonlife_uw_risk_usd_m"],
        "health_underwriting_risk":  snapshot["scr_health_uw_risk_usd_m"],
        "default_risk":              snapshot["scr_default_risk_usd_m"],
        "operational_risk":          snapshot["scr_operational_risk_usd_m"],
    }

    impact_by_module = _attribute_impact_by_business_line(
        snapshot, affected_business_lines, publication_id
    )

    return {
        "status": "ok",
        "snapshot_id": capital_model_snapshot_id,
        "snapshot_close_date": snapshot["close_date"],
        "scr_module_breakdown_usd_m": module_breakdown,
        "impact_attribution_by_module_usd_m": impact_by_module,
        "diagnostic_surface": {
            "snapshot_parameter_versions": snapshot["parameter_versions"],
            "prior_cycle_precedent": snapshot["prior_cycle_close_date"],
        },
    }


capital_impact_agent = Agent(
    model=Gemini(id="gemini-3.1-flash-lite"),
    tools=[assess_capital_impact],
    tool_call_limit=6,
)

if __name__ == "__main__":
    capital_impact_agent.print_response(
        "Assess the capital impact of EIOPA-BoS-25-142 on motor_india and "
        "commercial_property against snapshot SNAP-FY2025-Q2."
    )
