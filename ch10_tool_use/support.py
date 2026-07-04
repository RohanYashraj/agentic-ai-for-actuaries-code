# ── ch10_tool_use/support.py ─────────────────────────────────────────
# The book's Chapter 10 listings call two helpers described as "the
# firm's existing library": _ialm_lookup and _experience_lookup. This
# module supplies runnable synthetic implementations so the printed
# code executes end to end. The mortality table is a synthetic
# Gompertz-style table with the IALM 2012-14 ULP shape — it is NOT the
# real published table.
import os
from collections import namedtuple

import pandas as pd

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

# Load the synthetic mortality table once at import.
_ialm_table = pd.read_csv(os.path.join(DATA_DIR, "ialm_2012_14_ulp.csv"))

ExperienceRecord = namedtuple("ExperienceRecord", ["factor", "study_id"])

# The firm's experience study register — synthetic, per the Ch 10 case
# study expected output (factor 0.95, study TL_EXP_2023).
_experience_register = {
    ("term_life", 2023): ExperienceRecord(factor=0.95, study_id="TL_EXP_2023"),
    ("term_life", 2022): ExperienceRecord(factor=0.97, study_id="TL_EXP_2022"),
    ("whole_life", 2023): ExperienceRecord(factor=1.02, study_id="WL_EXP_2023"),
}


def _ialm_lookup(age: int, gender: str, smoker_status: str) -> float:
    """Return q_x from the synthetic IALM-style table."""
    row = _ialm_table[
        (_ialm_table["age"] == age)
        & (_ialm_table["gender"] == gender)
        & (_ialm_table["smoker_status"] == smoker_status)
    ]
    return float(row["mortality_rate"].iloc[0])


def _experience_lookup(line_of_business: str, study_year: int):
    """Return the ExperienceRecord for a line and year, or None."""
    return _experience_register.get((line_of_business, study_year))
