# Pricing reconciliation tool — GLM technical premium vs comparable median.
# Book reference: Chapter 13, "The Three-Agent Workflow"


def compare_to_pricing_model(
    emblem_radar_premium_usd: float,
    comparable_median_premium_usd: float,
    target_loss_ratio: float,
) -> dict:
    """Reconcile the GLM technical premium against the comparable-account median.

    A reconciliation gap above the firm's 10% threshold flags the submission
    for senior underwriter review before the recommendation enters Sophie
    Laurent's queue. Below threshold, the agent produces a draft with both
    anchors visible.

    Args:
        emblem_radar_premium_usd: technical premium from the GLM (USD).
        comparable_median_premium_usd: median of three comparable accounts (USD).
        target_loss_ratio: portfolio target for the renewal cycle.

    Returns:
        Dict with status, reconciliation_gap_pct, recommended_premium_usd,
        provenance, and note fields.
    """
    # Compute the percentage gap between the two technical-premium anchors
    gap_pct = abs(emblem_radar_premium_usd - comparable_median_premium_usd) \
              / comparable_median_premium_usd * 100

    # Threshold encodes the firm's reconciliation tolerance
    if gap_pct > 10.0:
        return {
            "status": "out_of_range",
            "reconciliation_gap_pct": round(gap_pct, 2),
            "recommended_premium_usd": None,
            "provenance": {
                "glm_method": "emblem_radar_v4.2",
                "comparable_method": "marketview_p_2025q3",
            },
            "note": "gap above 10% threshold; route to senior underwriter",
        }

    # Within tolerance — return midpoint as the draft anchor
    midpoint_premium = (emblem_radar_premium_usd + comparable_median_premium_usd) / 2

    return {
        "status": "ok",
        "reconciliation_gap_pct": round(gap_pct, 2),
        "recommended_premium_usd": round(midpoint_premium, 2),
        "provenance": {
            "glm_method": "emblem_radar_v4.2",
            "comparable_method": "marketview_p_2025q3",
            "target_loss_ratio": target_loss_ratio,
        },
        "note": None,
    }


if __name__ == "__main__":
    print(compare_to_pricing_model(86_000.0, 82_500.0, 0.62))   # within tolerance
    print(compare_to_pricing_model(86_000.0, 71_000.0, 0.62))   # out_of_range path
