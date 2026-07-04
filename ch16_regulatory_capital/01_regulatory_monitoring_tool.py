# regulatory_monitoring_tool.py
# Book reference: Chapter 16, "Architecture"
# Repo notes:
#   - _retrieve_from_source lives in support.py (synthetic, offline).
#   - The printed listing's header pins agno==1.0.6 / google-genai==0.8.0 /
#     pinecone-client==4.1.2; the repo pins agno 2.x per the root
#     pyproject.toml. See ERRATA in the root README.
from datetime import datetime, timezone

from agno.agent import Agent
from agno.models.google import Gemini
from agno.tools import tool

from support import _retrieve_from_source

# Source-of-truth registry — owned by Group Risk.
# Authority verification is structural, not runtime.
SOURCE_OF_TRUTH = {
    "iasb": {
        "url_pattern": "https://www.ifrs.org/news-and-events/news/",
        "publication_id_format": "IFRS-YYYY-NN",
        "review_cadence_days": 14,
    },
    "eiopa": {
        "url_pattern": "https://www.eiopa.europa.eu/publications_en",
        "publication_id_format": "EIOPA-BoS-YY-NNN",
        "review_cadence_days": 7,
    },
    "irdai": {
        "url_pattern": "https://irdai.gov.in/circulars",
        "publication_id_format": "IRDAI/REG/CIR/NNN/YYYY-YY",
        "review_cadence_days": 7,
    },
    # ... mas, naic, pra, iais entries follow the same shape
}


@tool
def fetch_regulatory_publications(
    source_id: str,
    cycle_window_days: int = 7,
) -> dict:
    """Return new publications from the named source within the cycle window.
    Authority verification is encoded at the tool layer.
    Verbatim retrievals truncated to <=14 words per copyright discipline.
    """
    if source_id not in SOURCE_OF_TRUTH:                        # authority drift guard
        return {"status": "rejected", "reason": "source_not_in_authority_registry"}

    source = SOURCE_OF_TRUTH[source_id]
    retrieved_at = datetime.now(timezone.utc).isoformat()       # staleness marker
    publications = _retrieve_from_source(source, cycle_window_days)

    for pub in publications:                                    # copyright discipline
        if len(pub["verbatim_excerpt"].split()) > 14:
            pub["paraphrase_required"] = True
            pub["verbatim_excerpt"] = " ".join(
                pub["verbatim_excerpt"].split()[:14]
            ) + " ..."

    return {
        "status": "ok",
        "source_id": source_id,
        "retrieved_at": retrieved_at,
        "publications": publications,
        "diagnostic_surface": {
            "source_authority": source["url_pattern"],
            "publication_id_format": source["publication_id_format"],
            "review_cadence_days": source["review_cadence_days"],
        },
    }


monitoring_agent = Agent(
    model=Gemini(id="gemini-3.1-flash-lite"),
    tools=[fetch_regulatory_publications],
    tool_call_limit=8,
    markdown=True,
)

if __name__ == "__main__":
    monitoring_agent.print_response(
        "Check EIOPA for publications in the last 7 days and summarise "
        "anything relevant to long-term guarantee business.",
        stream=True,
    )
