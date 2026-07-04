# meridian_re/tools/commentary.py
# Book reference: Chapter 14, "Code walkthrough"
# Repo note: draft_deviation_paragraph and draft_stable_paragraph live
# in support.py. For an agent exercising this tool, see
# 02_commentary_agent.py.
from agno.tools import tool

from support import draft_deviation_paragraph, draft_stable_paragraph


@tool
def draft_movement_commentary(
    reasoning_trace: dict,
    reflexion_output: dict,
    prior_cycle_decisions: dict,
) -> dict:
    """Draft a structured reserve-movement commentary paragraph.

    Every numerical claim in the output traces to one of the three
    inputs through the citations field. The Fellow reviews the
    paragraph against the trace, not against surface fluency.

    Args:
        reasoning_trace: Inner workflow trace (inputs/outputs/rationale).
        reflexion_output: Reconciliation result with deviation detail.
        prior_cycle_decisions: Stored record from prior cycle.

    Returns:
        dict with status, paragraph, citations, and note.
    """
    if reflexion_output.get("status") != "ok":
        # Out-of-range deviations get a deviation paragraph template
        # that surfaces the deviation detail explicitly.
        return draft_deviation_paragraph(
            reasoning_trace, reflexion_output, prior_cycle_decisions
        )
    return draft_stable_paragraph(
        reasoning_trace, reflexion_output, prior_cycle_decisions
    )


if __name__ == "__main__":
    sample_reflexion = {"status": "ok", "actual_ldf_12_24": 1.56,
                        "expected_ldf_12_24": 1.55, "deviation_pct": 0.65,
                        "tolerance_pct": 1.5}
    print(draft_movement_commentary.entrypoint(
        reasoning_trace={}, reflexion_output=sample_reflexion,
        prior_cycle_decisions={}))
