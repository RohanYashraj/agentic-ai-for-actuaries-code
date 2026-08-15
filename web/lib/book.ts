/** Substantive content distilled from the book itself: the concepts each
 * chapter introduces, and the positions the book actually argues for.
 *
 * This exists for answer engines and readers who want to know what the
 * book *says*, not just what it covers. Keyed by chapter number against
 * OUTLINE; CHAPTER_CONCEPTS is also rendered on the code chapter pages,
 * so anything added here must be true of the printed chapter. */

export const CHAPTER_CONCEPTS: Record<number, string[]> = {
  1: [
    "The four waves of AI: symbolic systems, statistical learning, deep learning, transformers",
    "Rule-based, supervised, unsupervised, reinforcement, deep, generative, and agentic AI as distinct reliability profiles",
    "Why no AI system can sign a Statement of Actuarial Opinion or bear professional liability",
    "The partnership model: AI handles mechanical work, the actuary bears accountability",
  ],
  2: [
    "Supervised, unsupervised, and reinforcement learning framed through actuarial problems",
    "The ML pipeline as the actuarial control cycle: features, training, validation, deployment, monitoring",
    "Overfitting and the bias-variance trade-off",
    "Precision, recall, AUC, and calibration — why accuracy misleads on imbalanced claims data",
    "Why GLMs remain the production standard in regulated pricing",
  ],
  3: [
    "Layers, weights, activations, and gradient descent by backpropagation",
    "Feedforward, convolutional, and recurrent architectures, and where each fits actuarial data",
    "The attention mechanism and the 2017 transformer architecture",
    "Deep learning's characteristic limits: data hunger, compute cost, and opacity to regulators",
  ],
  4: [
    "Pre-training, and why transformers replaced task-specific NLP models",
    "Generality, emergent abilities, and fluency as the three properties that matter",
    "Hallucination as a structural consequence of the training objective, not a bug",
    "Text-to-structured-data conversion as the highest-value insurance application",
  ],
  5: [
    "The six elements of a prompt: role, context, instruction, format, constraints, examples",
    "Zero-shot, few-shot, chain-of-thought, self-consistency, and tree-of-thought prompting",
    "Actuarial prompt patterns for reserving commentary, experience studies, and regulatory response",
    "Structured output against a schema as the backbone of agent architectures",
    "Prompt chaining as the bridge from prompting to agents",
    "Prompt drift across model versions, and versioning prompts like actuarial assumptions",
  ],
  6: [
    "Retrieval, augmentation, generation — and refusal when context is insufficient",
    "Keyword, vector, and hybrid search over actuarial documents",
    "Chunking that respects tables, formulas, and cross-references",
    "Evaluating retrieval and generation separately: recall@k, MRR, faithfulness, relevance",
    "Retrieval, generation, and stale-context failure modes",
  ],
  7: [
    "When fine-tuning beats prompting and retrieval: style at scale, vocabulary, cost and latency",
    "Transfer learning economics — hundreds of examples, not billions",
    "Full fine-tuning versus parameter-efficient LoRA and QLoRA",
    "Catastrophic forgetting, bias amplification, and overfitting the fine-tuning set",
    "Fine-tuned models as custom models under actuarial model governance",
  ],
  8: [
    "The gap between a working notebook and a production actuarial system",
    "APIs, data pipelines, and orchestration as the three architectural layers",
    "Security, privacy, and data residency constraints that precede the AI design",
    "Cost control through caching, semantic caching, tiered routing, and prompt compression",
    "Reproducibility, monitoring, versioning, human checkpoints, and rollback",
  ],
  9: [
    "Autonomy, goal-directed behaviour, and environmental interaction as the three defining properties",
    "The five-stage cognitive loop: perception, reasoning, planning, action, memory",
    "ReAct, Plan-and-Execute, and Reflexion design patterns",
    "Why heterogeneous inputs favour agents and uniform inputs favour deterministic pipelines",
    "Agentic failure modes: wrong tool selection, compounding misinterpretation, and loops",
  ],
  10: [
    "A tool as a named function with a specified input schema and output",
    "Why tool descriptions drive reliability more than prompt engineering does",
    "Tool selection failure, and keeping the tool set to five to ten tools",
    "Structured errors that let an agent retry, fall back, or escalate",
    "Sandboxing, least capability, and the blast radius of a tool call",
    "Code execution tools as the highest-power, highest-risk case",
  ],
  11: [
    "Sequential pipeline, parallel fan-out, hierarchical delegation, and debate patterns",
    "Workflows versus teams — and why workflows come first under regulatory scrutiny",
    "The supervisor pattern as the workhorse of production multi-agent systems",
    "Structured handoffs with schemas, instead of lossy free-form text between agents",
    "The status field as the basis for alerting, quality monitoring, and audit",
    "Conflict resolution by voting, authority, arbitration, or escalation to a human",
  ],
  12: [
    "Short-term, long-term, and episodic memory as distinct mechanisms",
    "Context window management and summarisation at task boundaries",
    "Vector stores, structured databases, and knowledge graphs for long-term memory",
    "Planning versus reasoning, and hierarchical task decomposition",
    "Reasoning traces as auditable and correctable evidence",
    "Self-reflection before committing to an output",
  ],
  13: [
    "Automated rating with the rating model retained as the actuarial control point",
    "Underwriting triage against underwriting authority",
    "Competitive intelligence from public rate filings and market reports",
    "Dynamic pricing cycles compressed from quarterly to weekly",
    "Continuous model validation, back-testing, and sensitivity analysis",
    "Rate filing compliance checks with citations to source provisions",
  ],
  14: [
    "Multiple reserving methods applied to one triangle, with agreement and disagreement surfaced",
    "Claims triage and routing from free-text notes",
    "Fraud detection that produces investigative leads, not adjudications",
    "Continuous loss development monitoring against prior expectations",
    "Narrative generation for reserving memoranda",
    "The shift from an episodic quarterly close to continuous monitoring",
  ],
  15: [
    "Life product development: profit testing, sensitivities, and documentation",
    "Mortality and morbidity experience studies against IALM, CMI, and SOA tables",
    "Health analytics: utilisation, treatment cost trends, and case-mix adjustment",
    "High-volume pension scheme valuations with per-scheme benefit structures",
    "Asset-liability management and scenario expansion",
    "Personalised policyholder communication at scale under GDPR, HIPAA, and DPDP",
  ],
  16: [
    "Regulatory monitoring across Solvency II, IFRS 17, LDTI, IRDAI, and IAIS document flows",
    "Capital modelling support: parameter assembly, scenario specification, exhibits",
    "Stress testing and scenario analysis against risk appetite",
    "ORSA and board risk reporting assembly",
    "Model risk management for an inventory growing faster than headcount",
    "Designing for audit trail and explainability from the start, not retrofitting it",
  ],
  17: [
    "Quiet degradation: the drift failure that triggers no alarm",
    "Reliability engineering: retries, circuit breakers, fallbacks, graceful degradation",
    "Testing non-deterministic systems: unit, integration, statistical, and adversarial",
    "Human-in-the-loop checkpoints designed around what the reviewer must verify",
    "Monitoring latency, error rates, step counts, tool failures, tokens, and quality",
    "Converging governance from the ASB, IFoA, IAA, and CAS, applied proportionately",
    "Change management: deployments that succeed technically and fail organisationally",
  ],
  18: [
    "Multimodal models, reasoning models, and computer-use agents",
    "The actuarial skill set: technical core, AI competencies, and stakeholder judgement",
    "New roles: actuarial AI engineer, AI-focused model risk specialist, chief data and analytics officer",
    "Three scenarios for 2035: the augmented actuary, the platform actuary, the diminished actuary",
    "Build literacy, engage with governance, mentor the next generation",
  ],
};

/** The positions the book argues, stated plainly. These are the claims a
 * reader — or an answer engine — would want attributed to the book. */
export const CORE_POSITIONS = [
  "AI will not replace actuaries, for a structural rather than a predictive reason: insurance regulation requires a named, qualified individual to sign actuarial opinions, and no algorithm can bear professional liability or be called before a tribunal under oath.",
  "Hallucination is a structural property of large language models, not a bug awaiting a patch: the training objective optimises for plausibility, not truth.",
  "The professional judgment required to validate AI outputs is itself a new actuarial skill, and it is the central subject of the book.",
  "Agents earn their cost where inputs are heterogeneous and the response depends on judgment; uniform inputs with fixed responses are better served by deterministic pipelines.",
  "Tool descriptions and tool engineering determine agent reliability more than prompt engineering does.",
  "For actuarial work under regulatory scrutiny, start with workflows — fixed sequences of agent calls — rather than autonomous teams, because workflows are predictable, debuggable, and governable.",
  "Most actuarial tasks do not need fine-tuning; prompting and retrieval handle the bulk of practical applications.",
  "The gap between a pilot and a production system is architecture, monitoring, and governance — not technical sophistication — and it is responsible for most agentic AI projects that work in demos and fail in operations.",
  "Agentic AI is governed under the existing actuarial framework rather than a new one, with rigour proportionate to the materiality of the application.",
  "The profession is not at risk from agentic AI; it is at risk only from the failure to adapt to it.",
];
