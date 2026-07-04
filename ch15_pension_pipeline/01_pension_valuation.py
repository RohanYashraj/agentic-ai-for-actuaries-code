# pension_valuation.py — funding valuation tool that returns the method's internals.
# Book reference: Chapter 15, "Architecture"
# Repo note: load_scheme_basis, compute_technical_provisions and
# compute_long_term_funding_target live in support.py.
from agno.agent import Agent
from agno.models.google import Gemini
from agno.tools import tool

from support import (
    compute_long_term_funding_target,
    compute_technical_provisions,
    load_scheme_basis,
)


@tool(name="pension_valuation")
def value_scheme(scheme_id: str, effective_date: str) -> dict:
    """Run a funding valuation on a closed UK DB scheme.

    Returns Technical Provisions and Long-Term Funding Target plus the
    sensitivity panel required under FRC TAS 300.
    """
    # Load scheme-specific assumption basis from the prior cycle's signed report.
    basis = load_scheme_basis(scheme_id, effective_date)

    # Base-case Technical Provisions and LTFT under the TPR Funding Code 2024.
    tp_base   = compute_technical_provisions(scheme_id, basis)
    ltft_base = compute_long_term_funding_target(scheme_id, basis)

    # Sensitivity panel — the method internals the Scheme Actuary reviews.
    sensitivity_panel = {
        "discount_rate_+100bp": compute_technical_provisions(scheme_id, basis.shift("dr", +100)),
        "discount_rate_-100bp": compute_technical_provisions(scheme_id, basis.shift("dr", -100)),
        "longevity_+25pct":     compute_technical_provisions(scheme_id, basis.shift("long", +0.25)),
        "longevity_-25pct":     compute_technical_provisions(scheme_id, basis.shift("long", -0.25)),
        "inflation_+50bp":      compute_technical_provisions(scheme_id, basis.shift("inf", +50)),
        "inflation_-50bp":      compute_technical_provisions(scheme_id, basis.shift("inf", -50)),
    }

    return {
        "status":                       "ok",
        "technical_provisions_gbp":     tp_base,
        "long_term_funding_target_gbp": ltft_base,
        "sensitivity_panel":            sensitivity_panel,
        "assumption_basis":             basis.as_dict(),  # mortality table version, scale id, etc.
    }


# The valuation agent runs on Google Gemini and calls the tool above.
valuation_agent = Agent(
    model=Gemini(id="gemini-3.1-flash-lite"),
    tools=[value_scheme],
    tool_call_limit=3,
    markdown=True,
)

if __name__ == "__main__":
    valuation_agent.print_response(
        "Run the funding valuation for scheme UKDB-MER-001 effective "
        "2025-03-31 and summarise the sensitivity panel for the Scheme Actuary."
    )
