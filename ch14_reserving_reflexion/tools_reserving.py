# meridian_re/tools/reserving.py
# Book reference: Chapter 14, "Code walkthrough"
# Repo note: load_triangle, compute_cape_cod_elr, apply_cape_cod_blend
# live in support.py (the book attributes them to the standard helper
# library used across CL/BF tools).
from agno.tools import tool

from support import apply_cape_cod_blend, compute_cape_cod_elr, load_triangle


@tool
def cape_cod(
    triangle_table: str = "meridian_claims.triangle_motor_india",
    accident_year_start: int = 2018,
    accident_year_end: int = 2023,
) -> dict:
    """Run the Cape Cod method on the motor India triangle.

    Returns the Cape Cod ultimate, the data-derived expected loss
    ratio, and the segment weights used in the credibility blend.
    The data-derived ELR distinguishes Cape Cod from BF, which
    relies on an externally assumed a-priori ELR.

    Args:
        triangle_table: Fully qualified triangle table name.
        accident_year_start: First AY in scope (inclusive).
        accident_year_end: Last AY in scope (inclusive).

    Returns:
        dict with status, ultimate_loss, derived_elr, segment_weights,
        provenance metadata, and note.
    """
    try:
        # Standard helper used across CL/BF tools.
        triangle_df = load_triangle(
            triangle_table, accident_year_start, accident_year_end
        )
        # Cape Cod blend: derive ELR from data, weight by exposure.
        derived_elr, weights = compute_cape_cod_elr(triangle_df)
        ultimate_loss = apply_cape_cod_blend(triangle_df, derived_elr)
        return {
            "status": "ok",
            "ultimate_loss": ultimate_loss,
            "derived_elr": derived_elr,
            "segment_weights": weights,
            "method": "cape_cod_v1.0",
            "table": triangle_table,
            "accident_years": (accident_year_start, accident_year_end),
            "note": None,
        }
    except Exception as caught_exception:
        # Operational exceptions converted to a structured result;
        # never propagate to the agent runtime.
        return {
            "status": "error",
            "ultimate_loss": None,
            "derived_elr": None,
            "segment_weights": None,
            "method": "cape_cod_v1.0",
            "table": triangle_table,
            "accident_years": (accident_year_start, accident_year_end),
            "note": str(caught_exception),
        }


if __name__ == "__main__":
    # Exercise the tool function directly (bypassing the agent).
    print(cape_cod.entrypoint())
