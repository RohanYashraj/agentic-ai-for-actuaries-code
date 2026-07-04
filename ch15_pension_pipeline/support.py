# ── ch15_pension_pipeline/support.py ─────────────────────────────────
# Synthetic implementations of the scheme-valuation helpers the
# Chapter 15 listings reference: the assumption basis object, the
# Technical Provisions / LTFT calculators, the member-data validators,
# and the member-record / statement-prose helpers. Deliberately simple
# annuity-certain approximations — not a compliant funding valuation.
import os

import pandas as pd

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
MEMBERS_CSV = os.path.join(DATA_DIR, "uk_annuity_members.csv")


class AssumptionBasis:
    """Scheme assumption basis loaded from the prior cycle's signed report."""

    def __init__(self, discount_rate: float, longevity_multiplier: float,
                 inflation_assumption: float):
        self.discount_rate = discount_rate                    # p.a.
        self.longevity_multiplier = longevity_multiplier      # on expected term
        self.inflation_assumption = inflation_assumption      # p.a. escalation
        self.mortality_table_version = "S3PxA_CMI_2023_1.25pct"
        self.inflation_basis = "CPI_max_5pct"

    def shift(self, assumption: str, amount) -> "AssumptionBasis":
        """Return a shifted copy for the sensitivity panel.

        'dr' / 'inf' shifts are in basis points; 'long' is a proportion.
        """
        shifted = AssumptionBasis(self.discount_rate, self.longevity_multiplier,
                                  self.inflation_assumption)
        if assumption == "dr":
            shifted.discount_rate += amount / 10_000
        elif assumption == "long":
            shifted.longevity_multiplier *= (1 + amount)
        elif assumption == "inf":
            shifted.inflation_assumption += amount / 10_000
        return shifted

    def as_dict(self) -> dict:
        return {
            "discount_rate": round(self.discount_rate, 4),
            "longevity_multiplier": round(self.longevity_multiplier, 4),
            "inflation_assumption": round(self.inflation_assumption, 4),
            "mortality_table_version": self.mortality_table_version,
            "inflation_basis": self.inflation_basis,
        }


def load_scheme_basis(scheme_id: str, effective_date: str) -> AssumptionBasis:
    """Load the scheme's assumption basis (synthetic: one basis per scheme)."""
    return AssumptionBasis(discount_rate=0.045, longevity_multiplier=1.0,
                           inflation_assumption=0.028)


def _annuity_value(members_df: pd.DataFrame, basis: AssumptionBasis) -> float:
    """Escalating-annuity-certain approximation of scheme liabilities."""
    expected_term_years = 22 * basis.longevity_multiplier     # crude expected term
    total = 0.0
    for _, member in members_df.iterrows():
        escalation = basis.inflation_assumption if member.pension_type == "escalating" else 0.0
        net_rate = (1 + basis.discount_rate) / (1 + escalation) - 1
        n = expected_term_years
        annuity_factor = (1 - (1 + net_rate) ** -n) / net_rate
        total += member.annual_pension_gbp * annuity_factor
    return round(total, 0)


def compute_technical_provisions(scheme_id: str, basis: AssumptionBasis) -> float:
    """Base-case Technical Provisions under the TPR Funding Code 2024."""
    members_df = pd.read_csv(MEMBERS_CSV)
    return _annuity_value(members_df, basis)


def compute_long_term_funding_target(scheme_id: str, basis: AssumptionBasis) -> float:
    """LTFT on a low-dependency basis (discount rate less 75bp here)."""
    low_dependency = basis.shift("dr", -75)
    members_df = pd.read_csv(MEMBERS_CSV)
    return _annuity_value(members_df, low_dependency)


# ── Member-data quality-gate helpers ─────────────────────────────────
def validate_file_format(file_path: str) -> dict:
    """Parse and schema check on the member-data file."""
    try:
        pd.read_csv(file_path)
        return {"valid": True, "detail": None}
    except Exception as exc:
        return {"valid": False, "detail": str(exc)}


def check_required_fields(file_path: str, required_fields: list) -> dict:
    """Completeness check against the standardised member schema."""
    members_df = pd.read_csv(file_path)
    missing = [f for f in required_fields if f not in members_df.columns]
    return {"missing_fields": missing, "member_count": len(members_df)}


def check_value_ranges(file_path: str) -> dict:
    """Plausible ranges on ages, pensions, dates."""
    members_df = pd.read_csv(file_path)
    out_of_range = int((members_df.annual_pension_gbp <= 0).sum()
                       + (members_df.annual_pension_gbp > 250_000).sum())
    return {"out_of_range_count": out_of_range}


def check_member_uniqueness(file_path: str) -> dict:
    """No duplicate member_id values."""
    members_df = pd.read_csv(file_path)
    return {"duplicates_count": int(members_df.member_id.duplicated().sum())}


# ── Member communication helpers ─────────────────────────────────────
def fetch_member_record(member_id: str, valuation_date: str) -> dict:
    """Read one member's record; pension paid in year from the data file."""
    members_df = pd.read_csv(MEMBERS_CSV)
    member = members_df[members_df.member_id == member_id]
    if member.empty:
        raise KeyError(f"member {member_id} not found")
    row = member.iloc[0]
    return {"member_id": member_id,
            "pension_paid_year_gbp": float(row.annual_pension_gbp),
            "pension_type": row.pension_type,
            "dependant_indicator": int(row.dependant_indicator)}


def generate_statement_prose(member_record: dict, pension_next_year: float,
                             escalation_index: float) -> str:
    """Assemble the statement text deterministically from named inputs."""
    return (
        f"Your pension of GBP {member_record['pension_paid_year_gbp']:,.2f} "
        f"was paid this scheme year. From the next scheme year it will "
        f"increase by {escalation_index:.1%} to "
        f"GBP {pension_next_year:,.2f}, in line with the scheme's "
        f"escalation basis."
    )
