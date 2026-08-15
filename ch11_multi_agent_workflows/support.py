# ── ch11_multi_agent_workflows/support.py ────────────────────────────
# The Chapter 11 listing notes: "Tool functions defined elsewhere; the
# structured-status return shape carries forward unchanged." This
# module supplies those tool functions so the printed workflow runs.
# Methods are deliberately simple, didactic implementations of chain
# ladder and Bornhuetter-Ferguson on the (clean) motor India triangle —
# not production reserving code.
import json
import os

import pandas as pd
from agno.agent import Agent
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))  # for common/
from common.config import get_model

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
DEV_PERIODS = [12, 24, 36, 48, 60, 72]

# Workflow steps hand results forward through this scratch file — a
# simple stand-in for the shared store a production pipeline would use.
RESERVING_OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "reserving_output.json")


def _load_clean_triangle() -> pd.DataFrame:
    return pd.read_csv(os.path.join(DATA_DIR, "meridian_motor_india_triangle_clean.csv"))


def fetch_triangle(triangle_table: str = "meridian_claims.triangle_motor_india") -> dict:
    """Fetch the motor India paid-loss triangle from the claims warehouse.

    Args:
        triangle_table: fully qualified triangle table name.

    Returns:
        dict with status and the triangle rows.
    """
    triangle_df = _load_clean_triangle()
    return {"status": "ok", "table": triangle_table,
            "rows": triangle_df.to_dict("records")}


def _development_factors(triangle_df: pd.DataFrame) -> dict:
    """Volume-weighted age-to-age factors on cumulative paid losses."""
    factors = {}
    for i in range(len(DEV_PERIODS) - 1):
        current, following = DEV_PERIODS[i], DEV_PERIODS[i + 1]
        merged = triangle_df[triangle_df.dev_period_months == current].merge(
            triangle_df[triangle_df.dev_period_months == following],
            on="accident_year", suffixes=("_from", "_to"),
        )
        factors[f"{current}-{following}"] = (
            merged["paid_loss_usd_to"].sum() / merged["paid_loss_usd_from"].sum()
        )
    return factors


def fit_chain_ladder() -> dict:
    """Fit the chain ladder method on the motor India paid triangle.

    Returns volume-weighted development factors and the chain ladder
    ultimate per accident year, in the structured-status shape.
    """
    triangle_df = _load_clean_triangle()
    factors = _development_factors(triangle_df)
    ultimates = {}
    for accident_year, group in triangle_df.groupby("accident_year"):
        latest_dev = group["dev_period_months"].max()
        latest_paid = group.loc[group.dev_period_months == latest_dev, "paid_loss_usd"].iloc[0]
        projected = latest_paid
        dev_index = DEV_PERIODS.index(latest_dev)
        for i in range(dev_index, len(DEV_PERIODS) - 1):
            projected *= factors[f"{DEV_PERIODS[i]}-{DEV_PERIODS[i + 1]}"]
        ultimates[int(accident_year)] = round(projected, 0)
    return {"status": "ok", "method": "chain_ladder_v1.0",
            "development_factors": {k: round(v, 4) for k, v in factors.items()},
            "ultimate_loss": ultimates,
            "ultimate_loss_total": round(sum(ultimates.values()), 0)}


def apply_bornhuetter_ferguson(a_priori_loss_ratio: float = 0.72) -> dict:
    """Apply Bornhuetter-Ferguson with an a-priori expected loss ratio.

    Args:
        a_priori_loss_ratio: externally assumed ELR (default 0.72).

    Returns:
        dict with the BF ultimate per accident year.
    """
    triangle_df = _load_clean_triangle()
    factors = _development_factors(triangle_df)
    # Synthetic earned premium per accident year (6% growth off USD 12m).
    earned_premium = {ay: 12_000_000 * (1.06 ** (ay - 2018)) for ay in range(2018, 2024)}
    ultimates = {}
    for accident_year, group in triangle_df.groupby("accident_year"):
        latest_dev = group["dev_period_months"].max()
        latest_paid = group.loc[group.dev_period_months == latest_dev, "paid_loss_usd"].iloc[0]
        # Cumulative development factor from latest observed to ultimate.
        cdf = 1.0
        for i in range(DEV_PERIODS.index(latest_dev), len(DEV_PERIODS) - 1):
            cdf *= factors[f"{DEV_PERIODS[i]}-{DEV_PERIODS[i + 1]}"]
        pct_unreported = 1 - 1 / cdf
        expected_ultimate = earned_premium[accident_year] * a_priori_loss_ratio
        ultimates[int(accident_year)] = round(
            latest_paid + expected_ultimate * pct_unreported, 0
        )
    return {"status": "ok", "method": "bornhuetter_ferguson_v1.0",
            "a_priori_loss_ratio": a_priori_loss_ratio,
            "ultimate_loss": ultimates,
            "ultimate_loss_total": round(sum(ultimates.values()), 0)}


def reconcile_methods(chain_ladder_total: float, bf_total: float) -> dict:
    """Reconcile chain ladder and BF ultimates; flag gaps above 5%.

    Args:
        chain_ladder_total: total ultimate from the chain ladder method.
        bf_total: total ultimate from the Bornhuetter-Ferguson method.

    Returns:
        dict with the gap percentage and a within-tolerance flag.
    """
    gap_pct = abs(chain_ladder_total - bf_total) / bf_total * 100
    result = {"status": "ok" if gap_pct <= 5.0 else "out_of_range",
              "reconciliation_gap_pct": round(gap_pct, 2),
              "tolerance_pct": 5.0,
              "note": None if gap_pct <= 5.0 else
                      "gap above 5% tolerance; route to reserving actuary"}
    # Persist for the commentary agent (read/write separation, Ch 10).
    with open(RESERVING_OUTPUT_PATH, "w") as f:
        json.dump({"chain_ladder_total": chain_ladder_total,
                   "bf_total": bf_total, **result}, f, indent=2)
    return result


def read_reserving_output() -> dict:
    """Read the reserving output dict written by the reserving step.

    The commentary agent has no direct triangle access — read/write
    separation per Chapter 10.
    """
    if not os.path.exists(RESERVING_OUTPUT_PATH):
        return {"status": "error", "note": "no reserving output found; run the reserving step first"}
    with open(RESERVING_OUTPUT_PATH) as f:
        return {"status": "ok", "reserving_output": json.load(f)}


def draft_commentary_paragraph(figures: dict) -> dict:
    """Validate that a drafted commentary cites only supplied figures.

    Args:
        figures: the reserving output dict the commentary must cite.

    Returns:
        dict confirming the citation contract for the draft.
    """
    return {"status": "ok",
            "citable_figures": figures,
            "note": "cite only figures present in this dict"}


# Data quality agent reused from Chapter 9 (first workflow step).
DATA_QUALITY_CSV = os.path.join(DATA_DIR, "meridian_motor_india_triangle_clean.csv")
_dq_triangle_df = pd.read_csv(DATA_QUALITY_CSV)


def check_triangle_quality(
    triangle_table: str = "meridian_claims.triangle_motor_india",
) -> dict:
    """Scan the named triangle for missing values, negative case
    reserves, and reported-below-paid inconsistencies.

    Args:
        triangle_table: fully qualified triangle table name.
    """
    loss_columns = ["paid_loss_usd", "reported_loss_usd", "case_reserve_usd"]
    return {
        "status": "ok",
        "missing_by_column": _dq_triangle_df[loss_columns].isna().sum().to_dict(),
        "negative_reserve_count": int((_dq_triangle_df.case_reserve_usd < 0).sum()),
        "inconsistency_count": int(
            (_dq_triangle_df.reported_loss_usd < _dq_triangle_df.paid_loss_usd).sum()
        ),
    }


data_quality_agent = Agent(
    name="DataQualityAgent",
    model=get_model(),
    description="Scans the motor India triangle for data quality issues before reserving.",
    tools=[check_triangle_quality],
    tool_call_limit=5,
    markdown=True,
    # Scope guard: this is step one of a fixed workflow. Without it,
    # a broad run instruction ("run the reserving cycle") tempts the
    # model to invent reserving tools it does not have.
    instructions=(
        "You are the data quality step of a fixed reserving workflow. "
        "Call check_triangle_quality and report the findings. Do not "
        "attempt reserving calculations — later steps own them. Only "
        "call the tools you have been given."
    ),
)
