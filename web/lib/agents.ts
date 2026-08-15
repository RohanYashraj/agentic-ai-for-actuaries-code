/** Agent scripts runnable on the server, mirrored from server/registry.py.
 *
 * Kept as static data so chapter pages render without a backend round
 * trip; the server registry remains the enforcement point (it only runs
 * ids it knows). `script` paths are read from the repo at build time.
 */

export interface AgentEntry {
  id: string;
  chapterDir: string;
  script: string;
  title: string;
  description: string;
  estSeconds: number;
  runnable: boolean;
  reason?: string;
}

export const AGENT_SCRIPTS: AgentEntry[] = [
  {
    id: "ch09-01",
    chapterDir: "ch09_agentic_foundations",
    script: "01_column_agent.py",
    title: "Column-profiling agent",
    description:
      "A single Gemini agent reasons about which triangle column to trust.",
    estSeconds: 20,
    runnable: true,
  },
  {
    id: "ch09-02",
    chapterDir: "ch09_agentic_foundations",
    script: "02_data_quality_agent.py",
    title: "Data quality agent",
    description:
      "Profiles the Meridian motor triangle and flags data quality issues.",
    estSeconds: 30,
    runnable: true,
  },
  {
    id: "ch10-03",
    chapterDir: "ch10_tool_use",
    script: "03_term_life_premium_agent.py",
    title: "Term life premium agent",
    description:
      "Prices a term assurance by calling the mortality and present-value tools.",
    estSeconds: 30,
    runnable: true,
  },
  {
    id: "ch11-01",
    chapterDir: "ch11_multi_agent_workflows",
    script: "01_reserving_review_workflow.py",
    title: "Reserving review workflow",
    description:
      "An analyst agent and a reviewer agent hand off through a fixed workflow.",
    estSeconds: 60,
    runnable: true,
  },
  {
    id: "ch12-01",
    chapterDir: "ch12_memory",
    script: "01_sqlite_memory.py",
    title: "Session memory agent",
    description:
      "Two turns against SQLite-backed memory: the second recalls the first.",
    estSeconds: 45,
    runnable: true,
  },
  {
    id: "ch12-02",
    chapterDir: "ch12_memory",
    script: "02_vector_knowledge.py",
    title: "Vector knowledge agent",
    description:
      "Answers from an embedded index of experience-study reports.",
    estSeconds: 90,
    runnable: false,
    reason:
      "Builds a Chroma vector index with embedding calls at import, so it runs in Colab rather than here.",
  },
  {
    id: "ch13-03",
    chapterDir: "ch13_underwriting_agent",
    script: "03_underwriting_workflow.py",
    title: "Underwriting workflow",
    description:
      "Extraction, pricing and review agents process a reinsurance submission PDF.",
    estSeconds: 90,
    runnable: true,
  },
  {
    id: "ch14-01",
    chapterDir: "ch14_reserving_reflexion",
    script: "01_reserving_reflexion_workflow.py",
    title: "Reserving reflexion workflow",
    description:
      "A reserving run that critiques its own diagnostics before concluding.",
    estSeconds: 90,
    runnable: true,
  },
  {
    id: "ch14-02",
    chapterDir: "ch14_reserving_reflexion",
    script: "02_commentary_agent.py",
    title: "Commentary agent",
    description: "Drafts reserve movement commentary via the commentary tool.",
    estSeconds: 30,
    runnable: true,
  },
  {
    id: "ch15-01",
    chapterDir: "ch15_pension_pipeline",
    script: "01_pension_valuation.py",
    title: "Pension valuation agent",
    description:
      "Runs the scheme funding valuation tool and summarises the sensitivity panel.",
    estSeconds: 30,
    runnable: true,
  },
  {
    id: "ch15-03",
    chapterDir: "ch15_pension_pipeline",
    script: "03_member_communication.py",
    title: "Member communication agent",
    description:
      "Drafts a member's annual statement with source-traced citations.",
    estSeconds: 30,
    runnable: true,
  },
  {
    id: "ch15-04",
    chapterDir: "ch15_pension_pipeline",
    script: "04_ingestion_agent.py",
    title: "Ingestion agent",
    description: "Gates scheme member data through the data-quality checks.",
    estSeconds: 30,
    runnable: true,
  },
  {
    id: "ch17-02",
    chapterDir: "ch17_governance_monitoring",
    script: "02_governance_agent.py",
    title: "Governance agent",
    description:
      "Reads the monitoring dashboard and decides whether to escalate.",
    estSeconds: 30,
    runnable: true,
  },
];

export function agentsForChapter(chapter: string): AgentEntry[] {
  return AGENT_SCRIPTS.filter((a) => a.chapterDir.startsWith(chapter));
}
