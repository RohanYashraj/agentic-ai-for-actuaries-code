# ── ch13_underwriting_agent/support.py ───────────────────────────────
# Runnable synthetic implementations of the helpers the Chapter 13
# listing attributes to "the firm's submission-handling library", plus
# the tools the three agents reference. The COPE parser is a simple
# keyword extractor over the synthetic submission PDF — sufficient for
# the workflow to run end to end; a production extractor would use a
# structured-extraction model call.
import os
import re
import statistics

import pandas as pd
from pypdf import PdfReader

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
COPE_FAMILIES = ["construction", "occupancy", "protection", "exposure"]


def _read_submission_pdf(submission_pdf_path: str) -> str:
    """Extract raw text from the broker's submission PDF."""
    reader = PdfReader(submission_pdf_path)
    return "\n".join(page.extract_text() for page in reader.pages)


def _parse_cope_schema(submission_text: str) -> dict:
    """Parse COPE families out of the submission text (keyword-based)."""
    upper = submission_text.upper()
    cope_data = {}
    for family in COPE_FAMILIES:
        # Take the block between this family heading and the next heading.
        pattern = family.upper() + r"\n(.*?)(?:\n[A-Z][A-Z ()0-9]+\n|\Z)"
        match = re.search(pattern, upper, flags=re.S)
        cope_data[family] = match.group(1).strip() if match else None
    # Pull the TIV out of the exposure block if present.
    tiv_match = re.search(r"TIV\)?: USD ([\d,]+)", submission_text)
    if tiv_match:
        cope_data["tiv_usd"] = float(tiv_match.group(1).replace(",", ""))
    return cope_data


def _has_all_cope_families(cope_data: dict) -> bool:
    """Validation gate: all four COPE families must populate."""
    return all(cope_data.get(family) for family in COPE_FAMILIES)


def parse_loss_summary(submission_pdf_path: str) -> dict:
    """Parse the prior loss history section of a submission PDF.

    Args:
        submission_pdf_path: filesystem path to the broker's submission PDF.

    Returns:
        dict with status and the list of prior losses (year, amount_usd).
    """
    text = _read_submission_pdf(submission_pdf_path)
    losses = [
        {"year": int(year), "amount_usd": float(amount.replace(",", ""))}
        for year, amount in re.findall(r"(20\d\d): USD ([\d,]+)", text)
    ]
    return {"status": "ok", "prior_losses": losses,
            "five_year_incurred_usd": sum(l["amount_usd"] for l in losses)}


def query_internal_loss_db(occupancy: str, min_tiv_usd: float, max_tiv_usd: float) -> dict:
    """Retrieve comparable accounts from the internal loss database.

    Args:
        occupancy: occupancy class to match (e.g., 'warehouse_distribution').
        min_tiv_usd: lower TIV bound for comparables.
        max_tiv_usd: upper TIV bound for comparables.

    Returns:
        dict with status and the matched comparable accounts.
    """
    loss_db = pd.read_csv(os.path.join(DATA_DIR, "internal_loss_db.csv"))
    matches = loss_db[
        (loss_db.occupancy == occupancy)
        & loss_db.tiv_usd.between(min_tiv_usd, max_tiv_usd)
    ]
    return {"status": "ok" if len(matches) else "not_found",
            "comparable_count": len(matches),
            "comparables": matches.to_dict("records")}


def query_marketview_aggregator(occupancy: str) -> dict:
    """Return market benchmark rates from the MarketView aggregator.

    Synthetic stand-in for the third-party market data feed.

    Args:
        occupancy: occupancy class for the benchmark.

    Returns:
        dict with status and the benchmark rate per USD 100 of TIV.
    """
    benchmark_rates = {          # rate per USD 100 TIV, 2025 Q3 vintage
        "warehouse_distribution": 0.185,
        "light_manufacturing": 0.240,
        "office": 0.125,
        "retail": 0.205,
    }
    rate = benchmark_rates.get(occupancy)
    if rate is None:
        return {"status": "not_found", "benchmark_rate_per_100": None}
    return {"status": "ok", "benchmark_rate_per_100": rate,
            "vintage": "marketview_p_2025q3"}


def fetch_emblem_radar_premium(tiv_usd: float, protection_class: int) -> dict:
    """Return the GLM technical premium from the Emblem/Radar pricing model.

    Synthetic stand-in for the firm's rating engine output.

    Args:
        tiv_usd: total insured value in USD.
        protection_class: ISO protection class 1 (best) to 10.

    Returns:
        dict with status and the technical premium in USD.
    """
    base_rate_per_100 = 0.165                       # base warehouse rate
    protection_loading = 1 + 0.04 * (protection_class - 1)
    technical_premium = tiv_usd / 100 * base_rate_per_100 * protection_loading
    return {"status": "ok",
            "emblem_radar_premium_usd": round(technical_premium, 2),
            "model_version": "emblem_radar_v4.2"}


def comparable_median_premium(comparables: list[dict]) -> float:
    """Median annual premium across the matched comparable accounts."""
    return statistics.median(c["annual_premium_usd"] for c in comparables)
