# ── ch14_reserving_reflexion/support.py ──────────────────────────────
# Synthetic implementations of the helpers the Chapter 14 listings
# attribute to the firm's reserving library: load_triangle,
# compute_cape_cod_elr, apply_cape_cod_blend, the reconciliation and
# prior-cycle tools, the paragraph drafters, and the Chapter 11 inner
# workflow builder. Didactic implementations — not production code.
import json
import os

import pandas as pd

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
DEV_PERIODS = [12, 24, 36, 48, 60, 72]

# Synthetic earned premium per accident year (matches Ch 11 support).
EARNED_PREMIUM = {ay: 12_000_000 * (1.06 ** (ay - 2018)) for ay in range(2018, 2024)}


def load_triangle(triangle_table: str, accident_year_start: int,
                  accident_year_end: int) -> pd.DataFrame:
    """Load the named triangle, restricted to the accident-year range."""
    triangle_df = pd.read_csv(
        os.path.join(DATA_DIR, "meridian_motor_india_triangle_clean.csv")
    )
    in_scope = triangle_df.accident_year.between(accident_year_start, accident_year_end)
    return triangle_df[in_scope].reset_index(drop=True)


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


def _cdf_to_ultimate(factors: dict, latest_dev: int) -> float:
    """Cumulative development factor from the latest observed period."""
    cdf = 1.0
    for i in range(DEV_PERIODS.index(latest_dev), len(DEV_PERIODS) - 1):
        cdf *= factors[f"{DEV_PERIODS[i]}-{DEV_PERIODS[i + 1]}"]
    return cdf


def compute_cape_cod_elr(triangle_df: pd.DataFrame) -> tuple[float, dict]:
    """Derive the Cape Cod expected loss ratio from the data.

    ELR = sum(latest paid) / sum(used-up premium), where used-up premium
    is earned premium × expected percentage reported. Weights are each
    accident year's share of used-up premium.
    """
    factors = _development_factors(triangle_df)
    total_paid, total_used_up, used_up_by_ay = 0.0, 0.0, {}
    for accident_year, group in triangle_df.groupby("accident_year"):
        latest_dev = group.dev_period_months.max()
        latest_paid = group.loc[group.dev_period_months == latest_dev, "paid_loss_usd"].iloc[0]
        pct_reported = 1 / _cdf_to_ultimate(factors, latest_dev)
        used_up = EARNED_PREMIUM[accident_year] * pct_reported
        total_paid += latest_paid
        total_used_up += used_up
        used_up_by_ay[int(accident_year)] = used_up
    derived_elr = total_paid / total_used_up
    weights = {str(ay): float(round(v / total_used_up, 2)) for ay, v in used_up_by_ay.items()}
    return float(round(derived_elr, 4)), weights


def apply_cape_cod_blend(triangle_df: pd.DataFrame, derived_elr: float) -> dict:
    """Cape Cod ultimate per accident year: paid + ELR × unreported premium."""
    factors = _development_factors(triangle_df)
    ultimates = {}
    for accident_year, group in triangle_df.groupby("accident_year"):
        latest_dev = group.dev_period_months.max()
        latest_paid = group.loc[group.dev_period_months == latest_dev, "paid_loss_usd"].iloc[0]
        pct_unreported = 1 - 1 / _cdf_to_ultimate(factors, latest_dev)
        ultimates[int(accident_year)] = float(round(
            latest_paid + EARNED_PREMIUM[accident_year] * derived_elr * pct_unreported, 0
        ))
    return ultimates


# ── Reconciliation-stage tools ───────────────────────────────────────
PRIOR_CYCLE_PATH = os.path.join(os.path.dirname(__file__), "prior_cycle_record.json")

# Seed a prior-cycle record on first import so retrieve_prior_cycle
# has something to return on a fresh clone.
if not os.path.exists(PRIOR_CYCLE_PATH):
    with open(PRIOR_CYCLE_PATH, "w") as f:
        json.dump({
            "cycle": "FY2024_Q2",
            "expected_ldf_12_24": 1.55,
            "expected_ldf_24_36": 1.28,
            "selected_ultimate_total": 61_400_000,
            "decisions": "Chain ladder selected for mature years; "
                         "Cape Cod for 2022-2023.",
        }, f, indent=2)


def retrieve_prior_cycle(cycle: str = "FY2024_Q2") -> dict:
    """Retrieve the stored prior-cycle LDF expectations and decisions.

    Args:
        cycle: prior cycle identifier.

    Returns:
        dict with status and the stored prior-cycle record.
    """
    with open(PRIOR_CYCLE_PATH) as f:
        record = json.load(f)
    return {"status": "ok", "prior_cycle": record}


def reconcile_against_developed_losses(
    actual_ldf_12_24: float,
    expected_ldf_12_24: float,
    tolerance_pct: float = 1.5,
) -> dict:
    """Compare actual next-cycle development against prior expectations.

    Args:
        actual_ldf_12_24: observed 12-24 month development factor.
        expected_ldf_12_24: prior cycle's expected 12-24 factor.
        tolerance_pct: the firm's deviation tolerance (default 1.5%).

    Returns:
        dict with status and the deviation detail. Deviations above
        tolerance return out_of_range and route to the review queue.
    """
    deviation_pct = abs(actual_ldf_12_24 - expected_ldf_12_24) / expected_ldf_12_24 * 100
    within = deviation_pct <= tolerance_pct
    return {
        "status": "ok" if within else "out_of_range",
        "actual_ldf_12_24": actual_ldf_12_24,
        "expected_ldf_12_24": expected_ldf_12_24,
        "deviation_pct": round(deviation_pct, 2),
        "tolerance_pct": tolerance_pct,
        "note": None if within else
                "deviation above tolerance; route to reserving actuary review queue",
    }


# ── Commentary paragraph drafters ────────────────────────────────────
def draft_stable_paragraph(reasoning_trace: dict, reflexion_output: dict,
                           prior_cycle_decisions: dict) -> dict:
    """Template for the within-tolerance commentary paragraph."""
    paragraph = (
        "Reserve movement this cycle is within the prior cycle's expected "
        f"development envelope: the observed 12-24 factor of "
        f"{reflexion_output.get('actual_ldf_12_24')} deviates "
        f"{reflexion_output.get('deviation_pct')}% from the expected "
        f"{reflexion_output.get('expected_ldf_12_24')}, inside the "
        f"{reflexion_output.get('tolerance_pct')}% tolerance."
    )
    citations = {"actual_ldf_12_24": "reflexion_output.actual_ldf_12_24",
                 "expected_ldf_12_24": "prior_cycle_decisions.expected_ldf_12_24",
                 "deviation_pct": "reflexion_output.deviation_pct"}
    return {"status": "ok", "paragraph": paragraph,
            "citations": citations, "note": None}


def draft_deviation_paragraph(reasoning_trace: dict, reflexion_output: dict,
                              prior_cycle_decisions: dict) -> dict:
    """Template for the out-of-tolerance deviation paragraph."""
    paragraph = (
        "Observed development deviates from prior expectations: the 12-24 "
        f"factor of {reflexion_output.get('actual_ldf_12_24')} is "
        f"{reflexion_output.get('deviation_pct')}% from the expected "
        f"{reflexion_output.get('expected_ldf_12_24')}, above the "
        f"{reflexion_output.get('tolerance_pct')}% tolerance. The deviation "
        "has been routed to the reserving actuary's review queue; no "
        "reserve revision has been made by the agent."
    )
    citations = {"actual_ldf_12_24": "reflexion_output.actual_ldf_12_24",
                 "expected_ldf_12_24": "prior_cycle_decisions.expected_ldf_12_24",
                 "deviation_pct": "reflexion_output.deviation_pct"}
    return {"status": "ok", "paragraph": paragraph,
            "citations": citations,
            "note": "deviation paragraph; review required"}


def build_reserving_review_workflow(include_cape_cod: bool = True):
    """Rebuild the Chapter 11 inner workflow, optionally adding Cape Cod."""
    from agno.workflow import Workflow, Step
    # Import the Chapter 11 module explicitly by path — a plain
    # `import support` would collide with this file (both are named
    # support.py).
    import importlib.util
    ch11_path = os.path.join(os.path.dirname(__file__), "..",
                             "ch11_multi_agent_workflows", "support.py")
    spec = importlib.util.spec_from_file_location("ch11_support", ch11_path)
    ch11 = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(ch11)

    from agno.agent import Agent
    from agno.models.google import Gemini

    tools = [ch11.fetch_triangle, ch11.fit_chain_ladder,
             ch11.apply_bornhuetter_ferguson, ch11.reconcile_methods]
    if include_cape_cod:
        # cape_cod is defined in tools_reserving.py alongside this module.
        from tools_reserving import cape_cod
        tools.append(cape_cod)

    reserving_agent = Agent(
        name="ReservingAgent",
        model=Gemini(id="gemini-3.1-flash-lite"),
        description="Computes CL, BF, and Cape Cod estimates and reconciles them.",
        tools=tools,
        tool_call_limit=10,
        markdown=True,
        instructions=(
            "Run the reserving methods with the tools you have been "
            "given (fetch_triangle, fit_chain_ladder, "
            "apply_bornhuetter_ferguson, reconcile_methods, and "
            "cape_cod if available) and report the estimates and the "
            "reconciliation. Only call these tools; do not invent "
            "others."
        ),
    )
    return Workflow(
        name="ReservingReviewWorkflow",
        steps=[Step(name="data_quality", agent=ch11.data_quality_agent),
               Step(name="reserving", agent=reserving_agent)],
    )
