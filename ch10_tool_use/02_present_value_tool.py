# ── Tool: present value with structured error handling ───────────────
# Book reference: Chapter 10, §10.4 "Error Handling and Recovery"
from datetime import date


def calculate_present_value(
    cashflows_inr: list[float],
    discount_rate_annual: float,
    valuation_date: str,
) -> dict:
    """Compute the present value of a cashflow stream at a constant rate.

    Args:
        cashflows_inr: per-year cashflow amounts, year 1 onward.
        discount_rate_annual: e.g., 0.06 for 6% per annum.
        valuation_date: ISO date string YYYY-MM-DD.

    Returns:
        dict with present_value_inr, method, status, note.
    """
    try:
        if not 0.0 <= discount_rate_annual <= 0.20:    # Sanity bound
            return {
                "present_value_inr": None,
                "method": "level_pv_v1.2",
                "status": "out_of_range",
                "note": f"Discount rate {discount_rate_annual} outside [0, 0.20]",
            }
        date.fromisoformat(valuation_date)             # Date format check
        pv = sum(
            cf / (1 + discount_rate_annual) ** (year + 1)
            for year, cf in enumerate(cashflows_inr)
        )
        return {
            "present_value_inr": round(pv, 2),
            "method": "level_pv_v1.2",
            "status": "ok",
            "note": None,
        }
    except (ValueError, TypeError) as exc:             # Structured error return
        return {
            "present_value_inr": None,
            "method": "level_pv_v1.2",
            "status": "error",
            "note": f"Input validation failed: {exc}",
        }


if __name__ == "__main__":
    print(calculate_present_value([100000.0] * 5, 0.06, "2025-03-31"))
    print(calculate_present_value([100000.0] * 5, 0.45, "2025-03-31"))   # out_of_range
    print(calculate_present_value([100000.0] * 5, 0.06, "31/03/2025"))   # error path
