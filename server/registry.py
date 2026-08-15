"""Fixed registry of agent scripts the API may execute.

The server only ever runs these exact repo scripts by id — request bodies
carry no code and no prompts. Anything not listed here cannot be run.
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class AgentScript:
    id: str
    chapter_dir: str
    script: str
    title: str
    description: str
    est_seconds: int
    runnable: bool = True
    reason: str = ""

    @property
    def chapter(self) -> str:
        return self.chapter_dir.split("_")[0]  # "ch11"

    @property
    def colab_url(self) -> str:
        return (
            "https://colab.research.google.com/github/RohanYashraj/"
            f"agentic-ai-for-actuaries-code/blob/main/notebooks/{self.chapter}.ipynb"
        )

    @property
    def github_url(self) -> str:
        return (
            "https://github.com/RohanYashraj/agentic-ai-for-actuaries-code/"
            f"blob/main/{self.chapter_dir}/{self.script}"
        )


_SCRIPTS = [
    AgentScript("ch09-01", "ch09_agentic_foundations", "01_column_agent.py",
                "Column-profiling agent",
                "A single Gemini agent reasons about which triangle column to trust.", 20),
    AgentScript("ch09-02", "ch09_agentic_foundations", "02_data_quality_agent.py",
                "Data quality agent",
                "Profiles the Meridian motor triangle and flags data quality issues.", 30),
    AgentScript("ch10-03", "ch10_tool_use", "03_term_life_premium_agent.py",
                "Term life premium agent",
                "Prices a term assurance by calling the mortality and present-value tools.", 30),
    AgentScript("ch11-01", "ch11_multi_agent_workflows", "01_reserving_review_workflow.py",
                "Reserving review workflow",
                "An analyst agent and a reviewer agent hand off through a fixed workflow.", 60),
    AgentScript("ch12-01", "ch12_memory", "01_sqlite_memory.py",
                "Session memory agent",
                "Two turns against SQLite-backed memory: the second recalls the first.", 45),
    AgentScript("ch12-02", "ch12_memory", "02_vector_knowledge.py",
                "Vector knowledge agent",
                "Answers from an embedded index of experience-study reports.", 90,
                runnable=False, reason="Builds a Chroma index with embedding calls at import; run it in Colab."),
    AgentScript("ch13-03", "ch13_underwriting_agent", "03_underwriting_workflow.py",
                "Underwriting workflow",
                "Extraction, pricing and review agents process a reinsurance submission PDF.", 90),
    AgentScript("ch14-01", "ch14_reserving_reflexion", "01_reserving_reflexion_workflow.py",
                "Reserving reflexion workflow",
                "A reserving run that critiques its own diagnostics before concluding.", 90),
    AgentScript("ch14-02", "ch14_reserving_reflexion", "02_commentary_agent.py",
                "Commentary agent",
                "Drafts reserve movement commentary via the commentary tool.", 30),
    AgentScript("ch15-01", "ch15_pension_pipeline", "01_pension_valuation.py",
                "Pension valuation agent",
                "Runs the scheme funding valuation tool and summarises the sensitivity panel.", 30),
    AgentScript("ch15-03", "ch15_pension_pipeline", "03_member_communication.py",
                "Member communication agent",
                "Drafts a member's annual statement with source-traced citations.", 30),
    AgentScript("ch15-04", "ch15_pension_pipeline", "04_ingestion_agent.py",
                "Ingestion agent",
                "Gates scheme member data through the data-quality checks.", 30),
    AgentScript("ch17-02", "ch17_governance_monitoring", "02_governance_agent.py",
                "Governance agent",
                "Reads the monitoring dashboard and decides whether to escalate.", 30),
]

AGENTS: dict[str, AgentScript] = {s.id: s for s in _SCRIPTS}
RUNNABLE: dict[str, AgentScript] = {s.id: s for s in _SCRIPTS if s.runnable}
