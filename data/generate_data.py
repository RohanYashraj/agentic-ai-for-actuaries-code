# ── data/generate_data.py ────────────────────────────────────────────
# Regenerates every synthetic dataset used by the chapter examples.
# All figures are synthetic and deterministic (fixed random seed), so a
# fresh clone reproduces the shipped CSV files byte for byte.
#
# Datasets (per the Meridian Re Company Bible, "Sample Data" section):
#   meridian_motor_india_triangle.csv        Ch 9 — with seeded defects
#   meridian_motor_india_triangle_clean.csv  Ch 11, 14 — defect-free
#   term_life_india_policies.csv             Ch 12 — meridian_policy.term_life_india
#   uk_annuity_members.csv                   Ch 15 — meridian_policy.uk_annuity_members
#   ialm_2012_14_ulp.csv                     Ch 10 — synthetic mortality table
#   internal_loss_db.csv                     Ch 13 — comparable-account claims
#   capital_snapshots.json                   Ch 16 — capital model snapshots
#   metrics_registry.json                    Ch 17 — monitoring thresholds/metrics
#   xs_reports/fy2024/*.txt                  Ch 12 — experience study archive

import json
import math
import os
import random

import pandas as pd

random.seed(2024)  # deterministic output
HERE = os.path.dirname(os.path.abspath(__file__))


# ── Motor India claims triangle (CODE-04 spec) ───────────────────────
# Accident years 2018–2023, dev periods 12–72 months, cumulative USD.
def build_motor_triangle() -> pd.DataFrame:
    accident_years = range(2018, 2024)
    dev_periods = [12, 24, 36, 48, 60, 72]
    # Age-to-age development pattern for cumulative paid losses.
    paid_pattern = [1.00, 1.55, 1.28, 1.12, 1.05, 1.02]
    rows = []
    for ay_index, accident_year in enumerate(accident_years):
        # Ultimate exposure grows ~6% per year with mild noise.
        base_paid = 4_200_000 * (1.06 ** ay_index) * random.uniform(0.96, 1.04)
        cumulative_paid = base_paid
        base_claims = int(1150 * (1.03 ** ay_index) * random.uniform(0.97, 1.03))
        # Only development periods observed as at 31 Dec 2023 exist.
        observed = 6 - ay_index
        for dev_index in range(observed):
            if dev_index > 0:
                cumulative_paid *= paid_pattern[dev_index]
            # Case reserves run off as the accident year matures.
            reserve_ratio = max(0.42 - 0.08 * dev_index, 0.01)
            case_reserve = cumulative_paid * reserve_ratio * random.uniform(0.9, 1.1)
            rows.append({
                "accident_year": accident_year,
                "dev_period_months": [12, 24, 36, 48, 60, 72][dev_index],
                "paid_loss_usd": round(cumulative_paid, 0),
                "reported_loss_usd": round(cumulative_paid + case_reserve, 0),
                "case_reserve_usd": round(case_reserve, 0),
                "claim_count": base_claims + dev_index * random.randint(8, 20),
            })
    return pd.DataFrame(rows)


def seed_defects(triangle_df: pd.DataFrame) -> pd.DataFrame:
    """Seed the four defect types the Ch 9 case study describes."""
    flawed = triangle_df.copy()
    # 1. Missing values in the loss columns.
    flawed.loc[3, "paid_loss_usd"] = None
    flawed.loc[8, "case_reserve_usd"] = None
    # 2. A negative case reserve (roll-forward error).
    flawed.loc[12, "case_reserve_usd"] = -48_500.0
    # 3. Reported < paid (recoveries mis-coded as negative payments).
    flawed.loc[15, "reported_loss_usd"] = flawed.loc[15, "paid_loss_usd"] - 120_000
    # 4. A claim count that drops between development periods.
    ay_2019 = flawed["accident_year"] == 2019
    dev_48 = flawed["dev_period_months"] == 48
    flawed.loc[ay_2019 & dev_48, "claim_count"] -= 60
    return flawed


# ── Term life India policy dataset (Bible: meridian_policy.term_life_india) ──
def build_term_life_policies(n: int = 500) -> pd.DataFrame:
    rows = []
    for i in range(n):
        age_at_entry = random.randint(22, 58)
        rows.append({
            "policy_id": f"TLI-{2018 + i % 6}-{i:05d}",
            "age_at_entry": age_at_entry,
            "gender": random.choice(["M", "F"]),
            "sum_assured_inr": random.choice([1_000_000, 2_500_000, 5_000_000, 10_000_000]),
            "policy_term_years": random.choice([10, 15, 20, 25]),
            "premium_frequency": random.choice(["annual", "monthly"]),
            "smoker_status": random.choices(["non_smoker", "smoker"], weights=[0.82, 0.18])[0],
            "issue_date": f"{2018 + i % 6}-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}",
            "lapse_indicator": random.choices([0, 1], weights=[0.9, 0.1])[0],
        })
    return pd.DataFrame(rows)


# ── UK annuity member data (Bible: meridian_policy.uk_annuity_members) ──
def build_uk_annuity_members(n: int = 300) -> pd.DataFrame:
    rows = []
    for i in range(n):
        birth_year = random.randint(1938, 1960)
        rows.append({
            "member_id": f"UKA-{i:05d}",
            "dob": f"{birth_year}-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}",
            "gender": random.choice(["M", "F"]),
            "annual_pension_gbp": round(random.uniform(2_500, 38_000), 2),
            "commencement_date": f"{random.randint(1998, 2023)}-{random.randint(1, 12):02d}-01",
            "pension_type": random.choices(["level", "escalating"], weights=[0.4, 0.6])[0],
            "dependant_indicator": random.choices([0, 1], weights=[0.35, 0.65])[0],
        })
    return pd.DataFrame(rows)


# ── Synthetic IALM 2012-14 ULP style mortality table (Ch 10) ─────────
# NOT the real IALM table — a Gompertz-style synthetic with the same
# shape, sufficient for the tool-design examples to run end to end.
def build_ialm_table() -> pd.DataFrame:
    rows = []
    for age in range(18, 100):
        base_qx = 0.00028 * math.exp(0.088 * (age - 18))  # Gompertz-style
        for gender, g_mult in [("M", 1.00), ("F", 0.78)]:
            for smoker, s_mult in [("non_smoker", 1.00), ("smoker", 1.85)]:
                rows.append({
                    "age": age,
                    "gender": gender,
                    "smoker_status": smoker,
                    "mortality_rate": round(min(base_qx * g_mult * s_mult, 1.0), 6),
                })
    return pd.DataFrame(rows)


# ── Internal loss database — comparable accounts (Ch 13) ─────────────
def build_internal_loss_db(n: int = 60) -> pd.DataFrame:
    constructions = ["fire_resistive", "non_combustible", "joisted_masonry", "frame"]
    occupancies = ["warehouse_distribution", "light_manufacturing", "office", "retail"]
    rows = []
    for i in range(n):
        tiv = random.uniform(8, 120) * 1_000_000  # total insured value USD
        rows.append({
            "account_id": f"MR-COMP-{i:04d}",
            "construction": random.choice(constructions),
            "occupancy": random.choice(occupancies),
            "protection_class": random.randint(1, 6),
            "tiv_usd": round(tiv, 0),
            "annual_premium_usd": round(tiv * random.uniform(0.0011, 0.0032), 0),
            "five_year_incurred_usd": round(tiv * random.uniform(0.0, 0.008), 0),
        })
    return pd.DataFrame(rows)


# ── Capital model snapshots (Ch 16) ──────────────────────────────────
def build_capital_snapshots() -> dict:
    return {
        "SNAP-FY2025-Q2": {
            "close_date": "2025-06-30",
            "scr_market_risk_usd_m": 412.6,
            "scr_life_uw_risk_usd_m": 188.3,
            "scr_nonlife_uw_risk_usd_m": 276.9,
            "scr_health_uw_risk_usd_m": 74.1,
            "scr_default_risk_usd_m": 41.8,
            "scr_operational_risk_usd_m": 66.4,
            "parameter_versions": {
                "market": "MKT-2025.2", "life": "LIFE-2025.1",
                "non_life": "NL-2025.2", "health": "HLT-2025.1",
            },
            "prior_cycle_close_date": "2025-03-31",
        },
        "SNAP-FY2025-Q1": {
            "close_date": "2025-03-31",
            "scr_market_risk_usd_m": 405.1,
            "scr_life_uw_risk_usd_m": 186.0,
            "scr_nonlife_uw_risk_usd_m": 255.4,
            "scr_health_uw_risk_usd_m": 73.2,
            "scr_default_risk_usd_m": 40.9,
            "scr_operational_risk_usd_m": 65.7,
            "parameter_versions": {
                "market": "MKT-2025.1", "life": "LIFE-2025.1",
                "non_life": "NL-2025.1", "health": "HLT-2025.1",
            },
            "prior_cycle_close_date": "2024-12-31",
        },
    }


# ── Monitoring metrics registry (Ch 17) ──────────────────────────────
def build_metrics_registry() -> dict:
    return {
        "registry_version": "MON-REG-2025.3",
        "agents": {
            "data_quality_agent": {
                "thresholds": {
                    "tool_error_rate": 0.02, "avg_tool_calls_per_run": 8,
                    "p95_latency_seconds": 45, "escalation_rate": 0.15,
                    "output_schema_failures": 0, "cost_per_run_usd": 0.05,
                },
                "metrics_7d": {
                    "tool_error_rate": 0.011, "avg_tool_calls_per_run": 6.2,
                    "p95_latency_seconds": 31, "escalation_rate": 0.09,
                    "output_schema_failures": 0, "cost_per_run_usd": 0.021,
                },
            },
            "reserving_agent": {
                "thresholds": {
                    "tool_error_rate": 0.02, "avg_tool_calls_per_run": 8,
                    "p95_latency_seconds": 90, "escalation_rate": 0.20,
                    "output_schema_failures": 0, "cost_per_run_usd": 0.12,
                },
                "metrics_7d": {
                    "tool_error_rate": 0.034, "avg_tool_calls_per_run": 7.8,
                    "p95_latency_seconds": 112, "escalation_rate": 0.22,
                    "output_schema_failures": 1, "cost_per_run_usd": 0.096,
                },
            },
        },
    }


# ── Experience study archive (Ch 12 vector knowledge) ────────────────
XS_REPORTS = {
    "fy2024_q1_term_life_india.txt": (
        "Meridian Re — Term Life India Experience Study, FY2024 Q1.\n"
        "Actual-to-expected mortality on IALM 2012-14 ULP base: 0.96 overall.\n"
        "Smoker segment A/E 1.04, driven by ages 45-54. Non-smoker A/E 0.93.\n"
        "Lapse experience: 8.7% annualised in policy year 2, above the 7.5% "
        "assumption; concentrated in monthly-premium business.\n"
        "Recommendation: hold the 0.95 adjustment factor; revisit smoker "
        "loading at the FY2024 year-end study.\n"
    ),
    "fy2024_q2_term_life_india.txt": (
        "Meridian Re — Term Life India Experience Study, FY2024 Q2.\n"
        "Actual-to-expected mortality 0.95 overall, consistent with Q1.\n"
        "Smoker segment A/E eased to 1.01. Lapse in policy year 2 at 8.2%.\n"
        "Data note: 312 policies re-mapped from whole_life to term_life after "
        "the Q2 admin-system migration; prior-quarter comparatives restated.\n"
        "Recommendation: maintain adjustment factor 0.95 (study TL_EXP_2023 "
        "remains the governing study until year-end).\n"
    ),
    "fy2024_q3_term_life_india.txt": (
        "Meridian Re — Term Life India Experience Study, FY2024 Q3.\n"
        "Actual-to-expected mortality 0.97 overall. Adverse quarter in the "
        "smoker 55-64 cell (A/E 1.12) on low exposure; not credible alone.\n"
        "Lapse year-2 rate 7.9%, trending back toward assumption.\n"
        "Recommendation: no in-quarter change; flag smoker 55-64 cell for "
        "the year-end credibility-weighted review.\n"
    ),
}


def main() -> None:
    clean_triangle = build_motor_triangle()
    clean_triangle.to_csv(
        os.path.join(HERE, "meridian_motor_india_triangle_clean.csv"), index=False
    )
    seed_defects(clean_triangle).to_csv(
        os.path.join(HERE, "meridian_motor_india_triangle.csv"), index=False
    )
    build_term_life_policies().to_csv(
        os.path.join(HERE, "term_life_india_policies.csv"), index=False
    )
    build_uk_annuity_members().to_csv(
        os.path.join(HERE, "uk_annuity_members.csv"), index=False
    )
    build_ialm_table().to_csv(os.path.join(HERE, "ialm_2012_14_ulp.csv"), index=False)
    build_internal_loss_db().to_csv(
        os.path.join(HERE, "internal_loss_db.csv"), index=False
    )
    with open(os.path.join(HERE, "capital_snapshots.json"), "w") as f:
        json.dump(build_capital_snapshots(), f, indent=2)
    with open(os.path.join(HERE, "metrics_registry.json"), "w") as f:
        json.dump(build_metrics_registry(), f, indent=2)
    os.makedirs(os.path.join(HERE, "xs_reports", "fy2024"), exist_ok=True)
    for name, text in XS_REPORTS.items():
        with open(os.path.join(HERE, "xs_reports", "fy2024", name), "w") as f:
            f.write(text)
    print("All synthetic datasets written to", HERE)


if __name__ == "__main__":
    main()
