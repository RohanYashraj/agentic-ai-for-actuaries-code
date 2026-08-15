if __name__ == "__main__":
    # Exercise the tool directly with an assessment from the sibling tool.
    import importlib
    assess = importlib.import_module("02_capital_impact_tool").assess_capital_impact
    impact = assess(
        publication_id="EIOPA-BoS-25-142",
        affected_business_lines=["motor_india", "commercial_property"],
        capital_model_snapshot_id="SNAP-FY2025-Q2",
    )
    result = draft_risk_profile_section(
        impact_assessment=impact,
        prior_cycle_orsa_excerpt_id="ORSA-FY2025-Q1-RP-04",
        reasoning_trace=[{"step_id": "capital_impact_1"}],
    )
    print(f"status: {result['status']}")
    print(f"draft_paragraph: {result['draft_paragraph']}")
    print(f"citations: {result['citations']}")
    print(f"reasoning_trace_ref: {result['reasoning_trace_ref']}")
