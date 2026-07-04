# ── Chapter 10 Illustrative Case Study: term life net premium agent ──
# Book reference: Chapter 10, "Illustrative Case Study" (Tools 1-3 + agent)
# Repo note: _ialm_lookup and _experience_lookup come from support.py.
from typing import Literal

from agno.agent import Agent
from agno.models.google import Gemini

from support import _experience_lookup, _ialm_lookup


# ── Tool 1: mortality lookup (IALM 2012-14 ULP, India) ─────────────
def lookup_mortality_rate(
    age: int,
    gender: Literal["M", "F"],
    smoker_status: Literal["smoker", "non_smoker"],
) -> dict:
    """Return one-year mortality rate q_x from IALM 2012-14 ULP.

    Use for term life net premium reserve calculations on India business.
    Do not use for annuitant mortality.

    Args:
        age: Attained age in completed years. Range 18-99.
        gender: "M" or "F".
        smoker_status: "smoker" or "non_smoker".

    Returns:
        dict with mortality_rate, table_name, table_version, status.
    """
    if not 18 <= age <= 99:
        return {"mortality_rate": None, "table_name": "IALM_2012_14_ULP",
                "table_version": "v1.0", "status": "out_of_range"}
    rate = _ialm_lookup(age, gender, smoker_status)   # firm's library
    return {"mortality_rate": rate, "table_name": "IALM_2012_14_ULP",
            "table_version": "v1.0", "status": "ok"}


# ── Tool 2: experience adjustment query ───────────────────────
def query_experience_study(
    line_of_business: Literal["term_life", "whole_life"],
    study_year: int,
) -> dict:
    """Return the firm's experience adjustment factor for a line and year.

    Adjustment is multiplicative on base table rates: 1.00 = no adjustment,
    0.95 = actual experience 95% of table.

    Args:
        line_of_business: "term_life" or "whole_life".
        study_year: Year of the experience study (e.g., 2023).

    Returns:
        dict with adjustment_factor, study_id, status.
    """
    record = _experience_lookup(line_of_business, study_year)
    if record is None:
        return {"adjustment_factor": None, "study_id": None,
                "status": "not_found"}
    return {"adjustment_factor": record.factor,
            "study_id": record.study_id, "status": "ok"}


# ── Tool 3: present value of cashflows ────────────────────────
def calculate_present_value(
    cashflows_inr: list[float],
    discount_rate_annual: float,
) -> dict:
    """Discount a stream of annual cashflows at a constant rate.

    Args:
        cashflows_inr: per-year cashflow amounts, year 1 onward.
        discount_rate_annual: annual rate, e.g., 0.06 for 6%.

    Returns:
        dict with present_value_inr, method, status.
    """
    if not 0.0 <= discount_rate_annual <= 0.20:
        return {"present_value_inr": None, "method": "level_pv_v1.2",
                "status": "out_of_range"}
    pv = sum(cf / (1 + discount_rate_annual) ** (yr + 1)
             for yr, cf in enumerate(cashflows_inr))
    return {"present_value_inr": round(pv, 2),
            "method": "level_pv_v1.2", "status": "ok"}


# ── Agent: term life net premium calculator ──────────────────
term_life_agent = Agent(
    model=Gemini(id="gemini-3.1-flash-lite"),
    tools=[
        lookup_mortality_rate,
        query_experience_study,
        calculate_present_value,
    ],
    description=(
        "Calculate the net annual level premium for a term life policy "
        "using IALM 2012-14 ULP mortality, the firm's experience adjustment, "
        "and a stated discount rate. Return the premium with full provenance."
    ),
    instructions=[
        "Look up mortality rates for each policy year from issue age to "
        "issue age + term - 1.",
        "Apply the term_life experience adjustment from the most recent "
        "available study year.",
        "Compute the expected present value of death benefits and the "
        "premium annuity using the supplied discount rate.",
        "Return the net annual level premium with the tool calls used.",
    ],
    tool_call_limit=10,
)

if __name__ == "__main__":
    result = term_life_agent.run(
        "Compute the net annual level premium for a 10-year term policy on a "
        "35-year-old male non-smoker, INR 50,00,000 sum assured, 6% discount rate."
    )
    print(result.content)
