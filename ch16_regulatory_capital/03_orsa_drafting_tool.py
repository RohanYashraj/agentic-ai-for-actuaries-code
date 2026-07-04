# orsa_drafting_tool.py
# Book reference: Chapter 16, "Architecture"
# Repo note: _generate_paragraph lives in support.py.
from agno.agent import Agent
from agno.models.google import Gemini
from agno.tools import tool

from support import _generate_paragraph


@tool
def draft_risk_profile_section(
    impact_assessment: dict,            # typed input from assess_capital_impact
    prior_cycle_orsa_excerpt_id: str,   # supervisor-audience precedent
    reasoning_trace: list[dict],        # typed reasoning trace
) -> dict:
    """Structured commentary tool. Supervisor-audience citations:
    every quantitative claim back-traces to capital model output identifier,
    parameter version, and prior-period precedent for material change assertions.
    """
    paragraph = _generate_paragraph(impact_assessment, prior_cycle_orsa_excerpt_id)

    citations = [
        {
            "claim": "non-life underwriting risk increased 8.4 percent",
            "capital_model_output_id": impact_assessment["snapshot_id"],
            "parameter_version": impact_assessment["diagnostic_surface"]
                                                ["snapshot_parameter_versions"]["non_life"],
            "prior_period_precedent_id": prior_cycle_orsa_excerpt_id,
            "material_change_threshold_breached": True,
        },
        # ... one entry per quantitative claim in the paragraph
    ]

    return {
        "status": "ok",
        "draft_paragraph": paragraph,
        "citations": citations,
        "reasoning_trace_ref": [step["step_id"] for step in reasoning_trace],
    }


orsa_drafting_agent = Agent(
    model=Gemini(id="gemini-3.1-flash-lite"),
    tools=[draft_risk_profile_section],
    tool_call_limit=4,
)

if __name__ == "__main__":
    # Exercise the tool directly with an assessment from the sibling tool.
    import importlib
    assess = importlib.import_module("02_capital_impact_tool").assess_capital_impact
    impact = assess.entrypoint(
        publication_id="EIOPA-BoS-25-142",
        affected_business_lines=["motor_india", "commercial_property"],
        capital_model_snapshot_id="SNAP-FY2025-Q2",
    )
    print(draft_risk_profile_section.entrypoint(
        impact_assessment=impact,
        prior_cycle_orsa_excerpt_id="ORSA-FY2025-Q1-RP-04",
        reasoning_trace=[{"step_id": "capital_impact_1"}],
    ))
