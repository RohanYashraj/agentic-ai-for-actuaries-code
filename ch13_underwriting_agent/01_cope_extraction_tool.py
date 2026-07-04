# Submission extraction tool — focuses on the actuarial domain logic
# of COPE schema validation and the structured status return.
# Book reference: Chapter 13, "The Three-Agent Workflow"
# Repo note: the _read_submission_pdf / _parse_cope_schema /
# _has_all_cope_families helpers live in support.py.
import os

from support import _has_all_cope_families, _parse_cope_schema, _read_submission_pdf

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


def extract_cope_attributes(submission_pdf_path: str) -> dict:
    """Extract COPE attributes from a commercial property submission PDF.

    COPE — Construction, Occupancy, Protection, Exposure — is the locked
    underwriting schema. The extracted attributes feed the rating model
    and the comparable-account search.

    Args:
        submission_pdf_path: filesystem path to the broker's submission PDF.

    Returns:
        Dict with status, cope_data, provenance, and note fields.
    """
    try:
        # Helpers from the firm's submission-handling library
        submission_text = _read_submission_pdf(submission_pdf_path)
        cope_data = _parse_cope_schema(submission_text)

        # Validation gate: all four COPE families must populate
        if not _has_all_cope_families(cope_data):
            return {
                "status": "out_of_range",
                "cope_data": None,
                "provenance": {"source_path": submission_pdf_path},
                "note": "missing one or more COPE families; route to underwriter",
            }

        return {
            "status": "ok",
            "cope_data": cope_data,
            "provenance": {
                "source_path": submission_pdf_path,
                "extraction_method": "gemini_structured_v1",
            },
            "note": None,
        }
    except Exception as exc:
        # Operational exceptions never propagate to the agent runtime;
        # they are caught and returned as an explicit error status.
        return {
            "status": "error",
            "cope_data": None,
            "provenance": {"source_path": submission_pdf_path},
            "note": f"extraction failed: {exc}",
        }


if __name__ == "__main__":
    submission = os.path.join(DATA_DIR, "submissions", "MR-CHI-2025-Q3-018.pdf")
    result = extract_cope_attributes(submission)
    print(result["status"])
    print(result["cope_data"])
