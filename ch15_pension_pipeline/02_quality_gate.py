# quality_gate.py — ingestion stage of the fixed-sequence pipeline.
# Book reference: Chapter 15, "Architecture"
# Repo note: the four validators live in support.py. For an agent
# exercising this tool, see 04_ingestion_agent.py.
import os

from agno.tools import tool

from support import (
    check_member_uniqueness,
    check_required_fields,
    check_value_ranges,
    validate_file_format,
)

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


@tool(name="quality_gate")
def check_scheme_data(scheme_id: str, file_path: str) -> dict:
    """Validate scheme member-data file before downstream stages.

    Returns 'ok' or 'needs_review' with a diagnostic naming the failed check.
    Failed schemes route to the manual review queue without blocking the pipeline.
    """
    # Required fields under the practice's standardised member schema.
    required_fields = ["member_id", "dob", "gender", "annual_pension_gbp",
                       "commencement_date", "pension_type", "dependant_indicator"]

    file_check      = validate_file_format(file_path)              # Parse and schema check.
    completeness    = check_required_fields(file_path, required_fields)
    range_check     = check_value_ranges(file_path)                # Plausible ranges on ages, pensions, dates.
    duplicate_check = check_member_uniqueness(file_path)           # No duplicate member_id values.

    if not file_check["valid"]:
        return {"status": "needs_review", "stage": "ingestion",
                "issue": "file_format", "detail": file_check["detail"]}
    if completeness["missing_fields"]:
        return {"status": "needs_review", "stage": "ingestion",
                "issue": "missing_fields", "detail": completeness["missing_fields"]}
    if range_check["out_of_range_count"] > 0:
        return {"status": "needs_review", "stage": "ingestion",
                "issue": "value_ranges", "detail": range_check["out_of_range_count"]}
    if duplicate_check["duplicates_count"] > 0:
        return {"status": "needs_review", "stage": "ingestion",
                "issue": "duplicate_members", "detail": duplicate_check["duplicates_count"]}

    return {"status": "ok", "stage": "ingestion",
            "member_count": completeness["member_count"]}


if __name__ == "__main__":
    members_file = os.path.join(DATA_DIR, "uk_annuity_members.csv")
    print(check_scheme_data.entrypoint("UKDB-MER-001", members_file))
