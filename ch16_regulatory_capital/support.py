# ── ch16_regulatory_capital/support.py ───────────────────────────────
# Synthetic implementations of the helpers the Chapter 16 listings
# reference: _retrieve_from_source (a stand-in for the live regulatory
# feed — no network calls), _load_capital_snapshot, the impact
# attribution helper, and the ORSA paragraph generator.
import json
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


def _retrieve_from_source(source: dict, cycle_window_days: int) -> list[dict]:
    """Return synthetic publications for the cycle window.

    A production implementation fetches the source's publications feed;
    this repo returns a fixed synthetic set so the example runs offline.
    """
    return [
        {
            "publication_id": "EIOPA-BoS-25-142",
            "title": "Consultation on the treatment of long-term guarantees",
            "published_date": "2025-07-01",
            "verbatim_excerpt": (
                "The Authority consults on revisions to the extrapolation of "
                "risk-free interest rates beyond the last liquid point and on "
                "the volatility adjustment mechanics for long-term guarantee "
                "business across member states."
            ),
        },
        {
            "publication_id": "EIOPA-BoS-25-139",
            "title": "Supervisory statement on climate scenario disclosure",
            "published_date": "2025-06-28",
            "verbatim_excerpt": "Insurers should disclose climate scenarios used.",
        },
    ]


def _load_capital_snapshot(capital_model_snapshot_id: str) -> dict:
    """Read the named capital model snapshot (read-only)."""
    with open(os.path.join(DATA_DIR, "capital_snapshots.json")) as f:
        snapshots = json.load(f)
    if capital_model_snapshot_id not in snapshots:
        raise KeyError(f"snapshot {capital_model_snapshot_id} not found")
    return snapshots[capital_model_snapshot_id]


def _attribute_impact_by_business_line(snapshot: dict,
                                       affected_business_lines: list[str],
                                       publication_id: str) -> dict:
    """Attribute the publication's SCR impact per affected line (synthetic)."""
    impact_map = {          # USD m impact per line for the worked example
        "motor_india": {"non_life_underwriting_risk": 4.2},
        "term_life_india": {"life_underwriting_risk": 2.9},
        "uk_annuities": {"life_underwriting_risk": 6.1, "market_risk": 3.4},
        "commercial_property": {"non_life_underwriting_risk": 5.7},
    }
    attribution = {}
    for line in affected_business_lines:
        for module, impact in impact_map.get(line, {}).items():
            attribution[module] = round(attribution.get(module, 0.0) + impact, 1)
    return attribution


def _generate_paragraph(impact_assessment: dict,
                        prior_cycle_orsa_excerpt_id: str) -> str:
    """Assemble the ORSA risk-profile paragraph from named inputs."""
    breakdown = impact_assessment["scr_module_breakdown_usd_m"]
    attribution = impact_assessment["impact_attribution_by_module_usd_m"]
    nl_impact = attribution.get("non_life_underwriting_risk", 0.0)
    nl_base = breakdown["non_life_underwriting_risk"]
    pct = nl_impact / nl_base * 100 if nl_base else 0.0
    return (
        f"Non-life underwriting risk capital increased by USD {nl_impact}m "
        f"({pct:.1f} percent of the module) against snapshot "
        f"{impact_assessment['snapshot_id']} (close "
        f"{impact_assessment['snapshot_close_date']}), attributable to the "
        f"assessed publication. The movement is assessed against the prior "
        f"cycle precedent {prior_cycle_orsa_excerpt_id}."
    )
