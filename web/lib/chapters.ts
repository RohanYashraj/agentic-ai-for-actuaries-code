/** Chapter metadata and per-script listings for /code pages. */

export interface ScriptEntry {
  file: string;
  description: string;
  /** id in public/demos/manifest.json: runs editable in the browser */
  demoId?: string;
  /** id in lib/agents.ts + server/registry.py: runs live on the server */
  agentId?: string;
}

export interface Chapter {
  slug: string; // "ch09"
  folder: string; // "ch09_agentic_foundations"
  number: number;
  title: string;
  blurb: string;
  scripts: ScriptEntry[];
  extras?: string[]; // shared helper files worth pointing at
}

export const CHAPTERS: Chapter[] = [
  {
    slug: "ch09",
    folder: "ch09_agentic_foundations",
    number: 9,
    title: "What is Agentic AI?",
    blurb:
      "Your first agents: a minimal Agno agent with a single tool, then a data quality agent that scans the defect-seeded motor India claims triangle and reports what it finds.",
    scripts: [
      {
        file: "01_column_agent.py",
        description:
          "A single Gemini agent reasons about which triangle column to trust.",
        agentId: "ch09-01",
      },
      {
        file: "02_data_quality_agent.py",
        description:
          "Profiles the claims triangle and flags the seeded data defects.",
        agentId: "ch09-02",
      },
    ],
  },
  {
    slug: "ch10",
    folder: "ch10_tool_use",
    number: 10,
    title: "Tool Use and Function Calling",
    blurb:
      "Designing actuarial tools: a mortality lookup with a validation gate, a present-value tool with structured error handling, and the term life premium agent that chains them together.",
    scripts: [
      {
        file: "01_mortality_tool.py",
        description:
          "Looks up q(x) from the IALM 2012-14 ULT table, rejecting out-of-range inputs.",
        demoId: "ch10-01",
      },
      {
        file: "02_present_value_tool.py",
        description:
          "Discounts a stream of future cashflows with structured error returns.",
        demoId: "ch10-02",
      },
      {
        file: "03_term_life_premium_agent.py",
        description:
          "The agent chains both tools to price a 10-year term assurance.",
        agentId: "ch10-03",
      },
    ],
    extras: ["support.py"],
  },
  {
    slug: "ch11",
    folder: "ch11_multi_agent_workflows",
    number: 11,
    title: "Multi-Agent Systems and Collaboration",
    blurb:
      "A fixed-path, three-step reserving review: a data quality agent checks the triangle, a reserving agent fits chain ladder and Bornhuetter-Ferguson and reconciles them, and a commentary agent drafts the memo.",
    scripts: [
      {
        file: "01_reserving_review_workflow.py",
        description:
          "The full analyst-and-reviewer workflow over the motor triangle.",
        agentId: "ch11-01",
      },
    ],
    extras: ["support.py"],
  },
  {
    slug: "ch12",
    folder: "ch12_memory",
    number: 12,
    title: "Memory, Planning, and Reasoning",
    blurb:
      "Persistent and semantic memory: an agent that remembers the FY2024 Q3 experience adjustment across processes via SQLite, and a vector store over the synthetic experience study archive.",
    scripts: [
      {
        file: "01_sqlite_memory.py",
        description:
          "Two turns against SQLite-backed memory; the second recalls the first.",
        agentId: "ch12-01",
      },
      {
        file: "02_vector_knowledge.py",
        description:
          "Embeds the experience-study archive into Chroma and answers from it.",
        agentId: "ch12-02",
      },
    ],
  },
  {
    slug: "ch13",
    folder: "ch13_underwriting_agent",
    number: 13,
    title: "Pricing and Underwriting",
    blurb:
      "Commercial property underwriting for Meridian Re: COPE extraction from a broker submission PDF, GLM-vs-comparables premium reconciliation, and the three-agent underwriting workflow.",
    scripts: [
      {
        file: "01_cope_extraction_tool.py",
        description:
          "Extracts COPE fields from the broker submission PDF via pypdf.",
      },
      {
        file: "02_pricing_reconciliation_tool.py",
        description:
          "Reconciles a cedent's proposed rate against internal pricing.",
        demoId: "ch13-02",
      },
      {
        file: "03_underwriting_workflow.py",
        description:
          "Extraction, pricing, and review agents process the submission end to end.",
        agentId: "ch13-03",
      },
    ],
    extras: ["support.py"],
  },
  {
    slug: "ch14",
    folder: "ch14_reserving_reflexion",
    number: 14,
    title: "Reserving and Claims",
    blurb:
      "Reserving with reflexion: a Cape Cod tool that derives its expected loss ratio from the data, movement commentary that cites its sources, and the full reflexion workflow that reconciles against the prior cycle.",
    scripts: [
      {
        file: "tools_reserving.py",
        description:
          "Cape Cod reserve estimate on the Meridian motor triangle.",
        demoId: "ch14-reserving",
      },
      {
        file: "tools_commentary.py",
        description:
          "Drafts movement commentary from a reflexion check's output.",
        demoId: "ch14-commentary",
      },
      {
        file: "01_reserving_reflexion_workflow.py",
        description:
          "The workflow critiques its own diagnostics before concluding.",
        agentId: "ch14-01",
      },
      {
        file: "02_commentary_agent.py",
        description: "An agent exercises the commentary tool end to end.",
        agentId: "ch14-02",
      },
    ],
    extras: ["support.py"],
  },
  {
    slug: "ch15",
    folder: "ch15_pension_pipeline",
    number: 15,
    title: "Life, Health, and Pensions",
    blurb:
      "A multi-scheme pension pipeline for closed UK DB schemes: a quality gate on member data, a funding valuation with a six-way sensitivity panel, and member statements whose every figure carries a citation.",
    scripts: [
      {
        file: "02_quality_gate.py",
        description:
          "Validates scheme member data before the pipeline is allowed to run.",
        demoId: "ch15-02",
      },
      {
        file: "01_pension_valuation.py",
        description:
          "Technical provisions, funding target, and the sensitivity panel.",
        demoId: "ch15-01",
        agentId: "ch15-01",
      },
      {
        file: "03_member_communication.py",
        description:
          "Drafts an annual annuity statement with source-traced citations.",
        demoId: "ch15-03",
        agentId: "ch15-03",
      },
      {
        file: "04_ingestion_agent.py",
        description: "An agent gates the member file through the quality checks.",
        agentId: "ch15-04",
      },
    ],
    extras: ["support.py"],
  },
  {
    slug: "ch16",
    folder: "ch16_regulatory_capital",
    number: 16,
    title: "Risk Management and Compliance",
    blurb:
      "Regulatory monitoring, capital impact, and ORSA drafting: a source-of-truth registry guards authority, capital snapshots are read-only, and every quantitative claim in the draft carries a supervisor-grade citation.",
    scripts: [
      {
        file: "01_regulatory_monitoring_tool.py",
        description:
          "Fetches from an approved source registry and rejects authority drift.",
        demoId: "ch16-01",
      },
      {
        file: "02_capital_impact_tool.py",
        description:
          "Attributes a regulation's capital impact across business lines.",
        demoId: "ch16-02",
      },
      {
        file: "03_orsa_drafting_tool.py",
        description:
          "Drafts an ORSA risk-profile section from a typed impact assessment.",
        demoId: "ch16-03",
      },
    ],
    extras: ["support.py"],
  },
  {
    slug: "ch17",
    folder: "ch17_governance_monitoring",
    number: 17,
    title: "Deploying and Governing Agentic AI in Practice",
    blurb:
      "Governance in production: a monitoring dashboard that scores each agent against the firm's threshold registry, and a governance agent that reads the dashboard and escalates.",
    scripts: [
      {
        file: "01_monitoring_dashboard.py",
        description:
          "Scores agents against thresholds: one nominal run, one tripped incident.",
        demoId: "ch17-01",
      },
      {
        file: "02_governance_agent.py",
        description:
          "Reads the dashboard output and decides whether to escalate.",
        agentId: "ch17-02",
      },
    ],
    extras: ["support.py"],
  },
];

export function getChapter(slug: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.slug === slug);
}
