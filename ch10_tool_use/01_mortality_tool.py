# ── Tool: mortality lookup (IALM 2012-14 ULP) ───────────────────
# Book reference: Chapter 10, §10.2 "Designing Actuarial Tools"
# Repo note: _ialm_lookup comes from support.py (synthetic table); the
# book describes it as "existing firm library".
from typing import Literal                          # Type hint constraints

from support import _ialm_lookup                    # repo-supplied helper


def lookup_mortality_rate(
    age: int,
    gender: Literal["M", "F"],
    smoker_status: Literal["smoker", "non_smoker"],
) -> dict:
    """Return one-year mortality rate q_x from the IALM 2012-14 ULP table.

    Use for term life and whole life net premium reserve calculations on
    India business. Do not use for annuitant mortality — call
    lookup_annuitant_mortality instead.

    Args:
        age: Attained age in completed years. Valid range 18-99.
        gender: "M" or "F".
        smoker_status: "smoker" or "non_smoker".

    Returns:
        dict with keys:
            mortality_rate: float — q_x value (e.g., 0.00121)
            table_name: str — source table identifier
            table_version: str — version stamp
            status: str — "ok" or "out_of_range"
    """
    if not 18 <= age <= 99:                         # Input validation gate
        return {
            "mortality_rate": None,
            "table_name": "IALM_2012_14_ULP",
            "table_version": "v1.0",
            "status": "out_of_range",
        }
    rate = _ialm_lookup(age, gender, smoker_status) # Existing firm library
    return {
        "mortality_rate": rate,
        "table_name": "IALM_2012_14_ULP",
        "table_version": "v1.0",
        "status": "ok",
    }


if __name__ == "__main__":
    # Direct tool exercise — no agent needed to test a tool in isolation.
    print(lookup_mortality_rate(35, "M", "non_smoker"))
    print(lookup_mortality_rate(105, "M", "non_smoker"))  # out_of_range path
