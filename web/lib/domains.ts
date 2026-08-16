/** The four actuarial practice domains of Part IV.
 *
 * Chapters 13-16 map to them one-for-one, and each domain page pulls
 * together the chapter that covers it, the supporting chapters that
 * supply its machinery, the concepts it leans on, and the runnable code.
 * The intros and workflow lists are condensed from the Part IV chapters. */

export type DomainSlug =
  | "pricing"
  | "reserving"
  | "life-health-pensions"
  | "risk-compliance";

export type DomainWorkflow = {
  title: string;
  blurb: string;
  /** Where the agent stops and the qualified professional takes over. */
  humanRetains: string;
};

export type Domain = {
  slug: DomainSlug;
  /** Short label, used on chapter and code cards. */
  name: string;
  /** Page headline. */
  headline: string;
  /** Sentence describing the domain, used on listings and in metadata. */
  blurb: string;
  intro: string[];
  /** The Part IV chapter that covers this domain in the book. */
  chapter: number;
  /** Chapters that supply the machinery this domain depends on. */
  supportingChapters: number[];
  conceptSlugs: string[];
  /** /code/[slug] pages that demonstrate this domain. */
  codeSlugs: string[];
  workflows: DomainWorkflow[];
  questions: { question: string; answer: string }[];
};

export const DOMAINS: Domain[] = [
  {
    slug: "pricing",
    name: "Pricing and underwriting",
    headline: "Agentic AI for pricing and underwriting",
    blurb:
      "Rating, underwriting triage, competitive intelligence, and model validation, with human review at the point pricing decisions are committed.",
    intro: [
      "Pricing and underwriting cycles share a structure across product lines and geographies: gather information about the risk, assess it against the relevant rating framework, produce an indication, negotiate, and bind. The variation across submissions has been large enough that fully deterministic automation has rarely worked at scale — the tasks are heterogeneous, the documents are messy, and the judgment required at the margin is precisely the value the underwriter adds.",
      "Agentic AI fits this profile because it absorbs heterogeneity in input format while preserving structure in output. A commercial property submission arrives as an exposure schedule, free-text broker correspondence, prior loss runs in varying formats, and supplementary documents; an agent extracts each into its expected schema and feeds the rating model. The rating model itself — a generalised linear model, a decision tree, a gradient-boosted variant — remains the actuarial control point throughout.",
      "The bound worth stating plainly is that agents perform well on extraction and structured-output tasks and less well where the relevant considerations are not in the documents. They handle volume; they do not remove the need for judgment on the unusual case.",
    ],
    chapter: 13,
    supportingChapters: [5, 6, 9, 10],
    conceptSlugs: [
      "tool-use-function-calling",
      "agentic-ai",
      "ai-governance",
      "hallucination",
    ],
    codeSlugs: ["ch13", "ch10"],
    workflows: [
      {
        title: "Automated rating and pricing",
        blurb:
          "Extract each input from a heterogeneous submission into its expected schema, apply the existing rating model, and produce a draft indication.",
        humanRetains: "The rating logic and the committed price",
      },
      {
        title: "Underwriting triage",
        blurb:
          "Pre-screen submissions against underwriting authority, flag those that fall outside it, identify missing information, and route the remainder.",
        humanRetains: "The underwriting decision",
      },
      {
        title: "Competitive intelligence",
        blurb:
          "Monitor public rate filings, competitor product announcements, broker market reports and industry press, and assess relevance to the portfolio.",
        humanRetains: "Whether and how to respond",
      },
      {
        title: "Dynamic pricing",
        blurb:
          "Refresh pricing assumptions and adjustments weekly or daily rather than monthly or quarterly, in response to mix shifts and loss-cost trends.",
        humanRetains: "Approval of the recommended adjustment",
      },
      {
        title: "Model validation",
        blurb:
          "Run back-tests on schedule, produce sensitivity analyses against pre-specified scenarios, and generate a structured report for review.",
        humanRetains: "The validation conclusion",
      },
      {
        title: "Rate filing compliance",
        blurb:
          "Check proposed filings against jurisdiction-specific requirements, flag non-compliant elements, and cite the source provisions.",
        humanRetains: "Responsibility for the filing",
      },
    ],
    questions: [
      {
        question: "Does an agent set the price?",
        answer:
          "No. The rating model remains the actuarial control point. The agent assembles and normalises the inputs the model consumes, and flags deviations between the modelled and the proposed premium for a human to resolve.",
      },
      {
        question: "What regulatory requirements does an agent inherit?",
        answer:
          "The same ones the pricing model carries. Pricing in regulated jurisdictions — the UK Financial Conduct Authority for personal lines, the IRDAI product approval framework, the state insurance commissioners in the United States — requires documented assumptions, validation, monitoring for drift, and clear professional accountability. An agentic system participating in pricing inherits all of them.",
      },
      {
        question: "Where does agentic AI pay off first in pricing?",
        answer:
          "On the high-volume extraction tasks, where submissions arrive in inconsistent formats and manual normalisation consumes underwriting time. Judgement-intensive work where the relevant considerations are not in the documents is where returns fall off.",
      },
    ],
  },
  {
    slug: "reserving",
    name: "Reserving and claims",
    headline: "Agentic AI for reserving and claims",
    blurb:
      "Reserve estimation across methods, claims triage, loss development monitoring, and reserving commentary drafted for actuarial review.",
    intro: [
      "Reserving sits at the intersection of analytical rigour and professional accountability that defines the actuarial profession. The work is high-stakes, time-bound and judgement-intensive, with regulatory consequences that follow the actuary individually. Agentic AI is therefore approached carefully here and, where deployed, supports rather than substitutes for the appointed actuary's judgement.",
      "The structural change is rhythm rather than method. The traditional cycle is episodic: data freezes at month-end, analysis runs over the following weeks, results are presented quarterly. An agentic monitor observing development continuously turns that into a weekly cadence, with deviations flagged in near-real-time, so the quarterly close becomes a confirmation rather than a discovery exercise. The methods do not change — they remain those of the actuarial syllabus.",
      "What an agent cannot do is bear the professional liability the regulatory framework places on the appointed actuary. That constraint shapes every deployment pattern in this domain.",
    ],
    chapter: 14,
    supportingChapters: [2, 11, 12],
    conceptSlugs: [
      "multi-agent-system",
      "agent-memory",
      "execution-and-evidence-traces",
      "ai-governance",
    ],
    codeSlugs: ["ch14", "ch11"],
    workflows: [
      {
        title: "Automated reserve estimation",
        blurb:
          "Apply chain ladder, Bornhuetter-Ferguson, Cape Cod and frequency-severity approaches to the same triangle, and summarise where they agree and diverge.",
        humanRetains: "Method selection and the booked estimate",
      },
      {
        title: "Loss development monitoring",
        blurb:
          "Observe monthly development against historical patterns and prior expectations, and flag segments that move materially off pattern.",
        humanRetains: "Whether a deviation is benign or substantive",
      },
      {
        title: "Claims triage and routing",
        blurb:
          "Classify new claims against routing criteria, extract the relevant facts from free-text notes, and route to the appropriate handler.",
        humanRetains: "The claims decision",
      },
      {
        title: "Fraud investigation leads",
        blurb:
          "Reason across claims notes, prior claims by the same claimant, and permitted external data to surface patterns single-source models miss.",
        humanRetains: "Adjudication and legal determination",
      },
      {
        title: "Reserving commentary",
        blurb:
          "Draft period commentary from the current results, the prior period's narrative and the supporting analyses, flagging items that need attention.",
        humanRetains: "Review, editing and sign-off",
      },
      {
        title: "Regulatory reporting",
        blurb:
          "Assemble prescribed exhibits and draft prose against the required structure for Statements of Actuarial Opinion and their equivalents.",
        humanRetains: "The signing actuary's opinion",
      },
    ],
    questions: [
      {
        question: "Can an agent select the reserving method?",
        answer:
          "No. The agent applies several methods and presents the estimates, ranges, and the agreement or disagreement between them. Selecting the method and booking the estimate is the actuary's judgement.",
      },
      {
        question: "What changes about the quarterly close?",
        answer:
          "The timing rather than the technique. Continuous monitoring surfaces material deviations during the quarter instead of at the close, so the close confirms findings already investigated rather than discovering them under deadline.",
      },
      {
        question: "Is agent-drafted commentary usable?",
        answer:
          "As a draft. It reflects the actual movements in the triangle, references the methods applied, and flags items needing narrative attention. It is rarely final and rarely useless; the compression of drafting time is the measurable gain.",
      },
    ],
  },
  {
    slug: "life-health-pensions",
    name: "Life, health, and pensions",
    headline: "Agentic AI for life, health, and pensions",
    blurb:
      "Experience studies, pension valuations at portfolio scale, health utilisation analytics, and policyholder communication.",
    intro: [
      "Life insurance, health insurance and pensions share a structural feature that makes them hospitable to agentic AI: the calculations are well-defined, the data flows repeatable, and the variation across cases sits in the parameters and policy terms rather than in the methods. The professional value lies in assumption-setting, judgement on emerging experience, and communication with stakeholders. The clerical and analytical assembly surrounding those activities is what agentic AI compresses.",
      "Pension valuations have produced the cleanest efficiency gains in deployed systems. A consulting firm running valuations across a portfolio of schemes faces work that is identical in shape and idiosyncratic in detail — high-volume, structured and time-bound. An agentic pipeline that ingests member data, applies the valuation method, runs the standard sensitivities against discount rate, mortality improvement and salary growth, and produces draft reports lets the actuary's review concentrate on the schemes that actually require judgement.",
      "Privacy and consent are more demanding here than anywhere else in the book. Health information is among the most sensitive data the industry handles, and deployments typically sit inside the insurer's own infrastructure or under contracts prohibiting secondary use.",
    ],
    chapter: 15,
    supportingChapters: [2, 8, 12],
    conceptSlugs: ["agent-memory", "agentic-ai", "ai-governance"],
    codeSlugs: ["ch15", "ch12"],
    workflows: [
      {
        title: "Pension scheme valuation",
        blurb:
          "Ingest member data, apply the relevant valuation method, run the prescribed sensitivities, and produce a draft report per scheme.",
        humanRetains: "Signing the valuation",
      },
      {
        title: "Experience studies",
        blurb:
          "Conduct the standard mortality or morbidity study against published tables, and flag segments deviating materially from expected experience.",
        humanRetains: "The assumption recommendation",
      },
      {
        title: "Product development support",
        blurb:
          "Run profit tests across assumption combinations, produce sensitivity tables, and draft the supporting documentation.",
        humanRetains: "Which assumptions to test and how to act on results",
      },
      {
        title: "Health utilisation analytics",
        blurb:
          "Monitor utilisation against expected patterns, identify emerging treatment cost and frequency trends, and support case-mix adjustments.",
        humanRetains: "Rate adjustments and clinical interpretation",
      },
      {
        title: "Asset-liability analysis",
        blurb:
          "Construct scenarios, run the projections, and synthesise results into a richer basis for the investment strategy review.",
        humanRetains: "The strategic decision",
      },
      {
        title: "Policyholder communication",
        blurb:
          "Draft annual statements, benefit illustrations and disclosure documents against each policyholder's data and the regulatory requirements.",
        humanRetains: "Template approval and compliance spot checks",
      },
    ],
    questions: [
      {
        question: "Why do pension valuations suit agentic pipelines so well?",
        answer:
          "Because the work is high-volume, structured and time-bound, with a common set of methods applied across schemes that differ in benefit structure and data format. Routine cases pass through with confirmation rather than reconstruction, concentrating review on the schemes that need judgement.",
      },
      {
        question: "How is sensitive health data handled?",
        answer:
          "GDPR in Europe, HIPAA in the United States and the Digital Personal Data Protection Act in India impose specific requirements. Deployments typically run within the insurer's own infrastructure or under data-processing contracts prohibiting secondary use, with identifiable elements redacted before processing where the analytical task does not need them.",
      },
      {
        question: "Does this change the actuarial governance of a valuation?",
        answer:
          "No. Signed valuations, documented assumptions, peer review and the actuarial function holder's accountability remain exactly as they were. The technology supports production of the valuation; the professional architecture is unchanged.",
      },
    ],
  },
  {
    slug: "risk-compliance",
    name: "Risk management and compliance",
    headline: "Agentic AI for risk management and compliance",
    blurb:
      "Regulatory monitoring, capital modelling support, stress testing, ORSA drafting, and model risk management.",
    intro: [
      "Risk and compliance face a structural challenge that intensifies year by year: the volume and velocity of regulatory change, combined with the complexity of the business being regulated, has outgrown the capacity of any reasonable team to monitor manually. The risk function has therefore been among the earliest sustained adopters of agentic AI in insurance, in roles combining document handling, structured analysis and continuous monitoring at a scale that had not yielded to earlier automation.",
      "Regulatory monitoring is the canonical application. Solvency II, IFRS 17, Long-Duration Targeted Improvements under ASC 944, IRDAI circulars and the publications of the International Association of Insurance Supervisors each emit substantial document flows. An agent that identifies material changes, summarises them in structured form and maps them to the company's existing processes produces a brief that previously consumed dedicated analyst time.",
      "Auditability is the distinctive design concern when agentic systems operate inside the risk function itself. A regulatory tribunal asking how a decision was reached needs a record of the inputs, the model calls, the tool invocations and the human approvals — emitted by the system as it runs, and designed in from the beginning rather than retrofitted.",
    ],
    chapter: 16,
    supportingChapters: [8, 17],
    conceptSlugs: [
      "ai-governance",
      "execution-and-evidence-traces",
      "retrieval-augmented-generation",
      "hallucination",
    ],
    codeSlugs: ["ch16", "ch17"],
    workflows: [
      {
        title: "Regulatory monitoring",
        blurb:
          "Track regulatory sources, identify material changes, summarise them in structured form, and assess relevance to existing processes.",
        humanRetains: "The response and its prioritisation",
      },
      {
        title: "Capital modelling support",
        blurb:
          "Assist with parameter assembly, scenario specification, and production of analytical exhibits, compressing the model run cycle.",
        humanRetains: "Methodology, assumptions and validation",
      },
      {
        title: "Stress testing and scenario analysis",
        blurb:
          "Design stress scenarios against pre-specified principles, run the models, and analyse results against risk appetite.",
        humanRetains: "Scenario choice and interpretation",
      },
      {
        title: "ORSA and board reporting",
        blurb:
          "Draft sections of the ORSA, assemble the supporting analyses, and produce a complete package for risk function review.",
        humanRetains: "The view of risk profile and capital adequacy",
      },
      {
        title: "Model risk management",
        blurb:
          "Assist with model documentation, validation evidence assembly, and maintenance of a model inventory that outgrows the function's headcount.",
        humanRetains: "The substantive validation review",
      },
      {
        title: "Audit trail and explainability",
        blurb:
          "Emit structured logs and status fields recording inputs, model calls, tool invocations and approvals, so a decision can be reconstructed.",
        humanRetains: "Accountability for the decision",
      },
    ],
    questions: [
      {
        question: "What makes an agentic system auditable?",
        answer:
          "The execution record the system emits as it runs: the inputs consumed, the model calls made, the tools invoked with their arguments and returned values, and the human approvals given. That is a different artefact from the model's narration of its own reasoning, which supports review rather than serving as evidence.",
      },
      {
        question: "Does agentic AI need a new governance framework?",
        answer:
          "No. Guidance from the Actuarial Standards Board, the Institute and Faculty of Actuaries, the International Actuarial Association and the Casualty Actuarial Society converges on documented assumptions, validation evidence, ongoing monitoring, clear accountability, and proportionality. Agentic AI is governed under the existing framework rather than a new one.",
      },
      {
        question: "Who is accountable for an agent's output?",
        answer:
          "The chief risk officer, the actuarial function holder, and the named professionals who sign the reports. No agent can absorb that accountability, and the systems deployed successfully support those professionals without substituting for their judgement.",
      },
    ],
  },
];

export function getDomain(slug: string): Domain | undefined {
  return DOMAINS.find((d) => d.slug === slug);
}

export function domainForChapter(n: number): Domain | undefined {
  return DOMAINS.find((d) => d.chapter === n);
}

export function domainPath(slug: DomainSlug): string {
  return `/actuarial-ai/${slug}`;
}
