/** Concept pages: the eight ideas the book returns to across chapters.
 *
 * A glossary entry defines a term in two sentences. A chapter explains it
 * in the place it happens to arise. Neither does the job of showing how a
 * concept behaves across the whole book — tool use appears in Chapter 10,
 * again in pricing, again in reserving — and that cross-chapter synthesis
 * is what these pages add. Each maps to a glossary term so the two never
 * drift apart, and carries the actuarial framing that a general-purpose
 * definition of the same term would not. */

import type { DomainSlug } from "./domains";

export type Concept = {
  slug: string;
  title: string;
  /** Matches a `term` in GLOSSARY, so the definition stays single-sourced. */
  glossaryTerm: string;
  /** One sentence, used for cards, metadata and JSON-LD description. */
  summary: string;
  /** The body, 3-5 paragraphs. */
  body: string[];
  /** "Why it matters for actuaries", kept separate so it always appears. */
  whyItMatters: string;
  chapters: number[];
  domains: DomainSlug[];
  /** /code/[slug] pages that demonstrate the concept. */
  codeSlugs: string[];
  related: string[];
};

export const CONCEPTS: Concept[] = [
  {
    slug: "agentic-ai",
    title: "Agentic AI",
    glossaryTerm: "Agentic AI",
    summary:
      "The architectural pattern in which a language model is the reasoning engine inside a system that perceives, plans, acts through tools, and remembers.",
    body: [
      "An agent takes a goal, decomposes it into actions, executes those actions using tools, observes the results, and adapts its plan as it proceeds. Three properties separate that from everything simpler: autonomy, in that the agent decides what to do next within constraints its designers set; goal-directed behaviour, in that its actions are evaluated against a stated objective rather than a fixed sequence; and environmental interaction, in that it acts through tools and receives feedback that shapes its next action.",
      "The distinction is easiest to see by what it excludes. A chatbot responds and waits; it holds no goal across interactions. A retrieval-augmented question-answering system runs a fixed pipeline, however useful. A robotic process automation script follows a pre-specified sequence reliably and inflexibly. None of the three adapts when the situation departs from what was anticipated — which is the case that matters, because a script producing a development triangle halts the moment a column arrives renamed, and an agent notices, reasons about what the column likely contains, and reports what it changed.",
      "Underneath, the cognitive loop has five stages: perception of the current state, reasoning about it, planning a sequence toward the goal, action through a tool, and memory that carries what happened into later decisions. The result of each action becomes the next perception. Three design patterns dominate practice — ReAct, which alternates reasoning and action and is the simplest; Plan-and-Execute, which separates planning from execution and scales better to multi-step work; and Reflexion, which adds self-evaluation at the cost of extra model calls.",
      "The judgement an actuary has to make is not how to build an agent but whether the task warrants one. Linear, well-defined workflows — extract from a known document type, perform a known calculation, file the result — are usually better served by an orchestrated pipeline, because an agent's autonomy buys nothing there and its failure modes are harder to govern. Agents earn their cost on heterogeneous inputs: broker submissions in inconsistent formats, claims notes with idiosyncratic structure, regulatory queries spanning several frameworks.",
    ],
    whyItMatters:
      "Agents inherit every failure mode of the underlying model and add their own: selecting the wrong tool and producing a wrong result fluently, misreading a tool's output and compounding the error downstream, or looping on an action that fails for a reason they cannot diagnose. The remedies are architectural rather than clever — explicit step limits, monitoring for repeated failures, structured logging of every tool call, and human review wherever an error would be consequential. Human-in-the-loop agentic AI is the only pattern that has worked in regulated actuarial processes so far.",
    chapters: [9, 10, 11, 12],
    domains: ["pricing", "reserving", "life-health-pensions", "risk-compliance"],
    codeSlugs: ["ch09", "ch10"],
    related: ["tool-use-function-calling", "multi-agent-system", "agent-memory"],
  },

  {
    slug: "tool-use-function-calling",
    title: "Tool use and function calling",
    glossaryTerm: "Function calling",
    summary:
      "The mechanism that lets an agent act: a function with a defined name, input schema and output, which the model invokes by emitting a structured request.",
    body: [
      "A tool is a function with a defined name, a specified input schema, and a specified output. The model is given descriptions of the tools available and, when it determines one should be called, emits a structured request to invoke it. The tool runs in code the team controls and returns a result the agent folds into its next reasoning step. Current model APIs support this natively.",
      "The conceptual shift is larger than the mechanism suggests. Without tools, a model asked for the net premium reserve on a ten-year term policy produces a plausible number from its training data with no way to verify it. With a mortality-table lookup, a discount function and a present-value calculation available as tools, the same agent retrieves the correct rates, applies the correct discount, and reports a number reproducible from the tools' outputs. Reliability now rests on the tools rather than on the model's parametric memory — which is the difference between a demonstration and a production component.",
      "Designing actuarial tools is partly familiar work: wrap an existing calculation, lookup or query behind a clear interface. What is unfamiliar is that the consumer is an agent, not a human, so the description matters as much as the implementation. A tool named `lookup_mortality` with no further explanation will be called less reliably, and on less appropriate inputs, than one described as returning the qx rate for a given sex, age, smoker status and standard table, with a note on when to use it. That writing is not documentation; it is part of the system's behaviour.",
      "Two failure modes recur. Tool selection failure — calling the wrong tool, calling the right one with wrong arguments, or failing to call any — is mitigated by keeping the tool set small (five to ten beats fifty), writing distinctive descriptions, and catching selection errors at validation rather than execution. Error handling is the other: a naive agent retries a failing call, fails again, and loops. Tools should return structured errors with codes and recommended next steps, so the agent can retry, fall back, ask for clarification, or escalate.",
    ],
    whyItMatters:
      "Sandboxing is where this becomes an actuarial governance question rather than an engineering one. An agent with read access to a claims database is useful; one with write access is dangerous, because a single misinterpreted instruction can corrupt records that downstream processes depend on. Tools should grant the minimum capability the task requires, and consequential operations — writing to a system of record, sending external communications, executing code — should require human approval, dry-run modes, audit logging and explicit reversibility. The blast radius of a tool should be understood before it is wired into an agent.",
    chapters: [10, 13],
    domains: ["pricing", "reserving"],
    codeSlugs: ["ch10", "ch13"],
    related: ["agentic-ai", "execution-and-evidence-traces", "hallucination"],
  },

  {
    slug: "multi-agent-system",
    title: "Multi-agent systems",
    glossaryTerm: "Multi-agent system",
    summary:
      "Coordinated arrangements of specialised agents, and the reasons a workflow beats a team wherever the output is subject to regulatory scrutiny.",
    body: [
      "A reserving review needs three things in sequence: someone to examine the triangles for anomalies, someone to apply chain ladder and Bornhuetter-Ferguson, and someone to synthesise the findings into a memorandum. A single agent can do all three, slowly and with frequent context loss. Three specialised agents coordinated by a supervisor do each with focus and pass results between them in structured form. The structure mirrors how human teams work, for the same reason it works for human teams: specialisation produces better output in narrow domains, and the cognitive load on any one agent scales badly with task complexity.",
      "Four patterns recur. The sequential pipeline passes output from agent to agent and is the easiest to debug. The parallel fan-out runs agents simultaneously on independent sub-tasks where wall-clock time is the bottleneck. Hierarchical delegation has a top-level agent decompose a task and integrate the results. The debate pattern has agents argue opposing positions, with a third agent or a human deciding between them.",
      "The distinction that matters most for actuarial work is between workflows and teams. A workflow is a fixed sequence of agent calls with predefined inputs and outputs, its orchestration encoded by the designer. A team is autonomous: agents communicate, negotiate, and allocate work among themselves, and the orchestration emerges from their interaction. Workflows are predictable, debuggable and governable. Teams are flexible and hard to reason about. For anything subject to regulatory scrutiny, workflows are the right starting point, and teams belong in research and prototyping.",
      "Communication between agents needs structure, because free-form text is fluent and lossy. Agents passing natural-language messages drift, and the original goal is gradually distorted across handoffs. Structured handoffs — objects with explicit fields for the goal, the data, the constraints and the expected output — allow validation at each boundary. A status field attached to every message, recording what was attempted, what was produced, what failed and with what confidence, becomes the basis for alerting, quality monitoring and post-hoc audit.",
    ],
    whyItMatters:
      "More components mean more places to fail, more handoffs mean more opportunities for drift, and more autonomy means harder governance. When agents disagree — one recommending a rate increase on loss experience, another recommending stability on competitive pressure — the available mechanisms are voting, authority hierarchies, arbitration by a supervisor, or escalation to a human. For decisions with regulatory or financial consequences, escalation is usually the right answer. The agents do the analytical work; the human does the judgment.",
    chapters: [11, 14],
    domains: ["reserving", "pricing"],
    codeSlugs: ["ch11", "ch14"],
    related: ["agentic-ai", "ai-governance", "execution-and-evidence-traces"],
  },

  {
    slug: "agent-memory",
    title: "Agent memory",
    glossaryTerm: "Agent",
    summary:
      "Short-term, long-term and episodic memory as three distinct mechanisms, and why continuity is what makes an agent useful for ongoing actuarial work.",
    body: [
      "Without memory, an agent asked to update last quarter's mortality study re-derives every parameter from scratch, and may reach different methodological choices than the prior run. With persistent memory of the prior parameters, methods and judgement calls, it retrieves that context, applies the same approach, highlights what has changed in the data, and flags deviations for review. The continuity is what makes an agent useful for ongoing actuarial work rather than only for one-off analyses.",
      "Three horizons are best treated as distinct mechanisms rather than one capability. Short-term memory holds the current task's context and is bounded by the model's context window. It is the easiest to provide and the easiest to mismanage: retaining everything exhausts the window and degrades performance, while summarising costs its own model calls and introduces its own failure modes. The discipline is to summarise at consistent boundaries — the completion of a sub-task, the closing of a tool-use loop — rather than at arbitrary intervals.",
      "Long-term memory persists across tasks and takes three forms. A vector store retrieves semantically similar prior content. A structured database retrieves definite values: assumption tables, methodology choices, historical results. A knowledge graph encodes relationships between entities. Most production systems combine structured storage for definite values with vector storage for unstructured context, and for actuarial work structured storage is generally the better first step, because the decisions worth remembering across runs are themselves structured.",
      "Episodic memory records specific past events — a failure mode encountered last quarter, a methodology choice that resolved an ambiguity, a human correction to a draft — and retrieves them when a similar situation recurs. It produces agents that improve over time in a limited sense without retraining the underlying model. It is also the youngest of the three in production, and its limitation is real: retrieval depends on imperfect similarity search, and the wrong lesson applied to a superficially similar situation degrades performance rather than improving it.",
    ],
    whyItMatters:
      "Memory is what turns an agent from a system that produces outputs into one that supports a recurring actuarial cycle. It is also where institutional knowledge accumulates outside anyone's head: the assumptions used in a prior reserving cycle, the conventions adopted across a project, the corrections a reviewer made last quarter. That makes memory content a governance object in its own right — it needs the same versioning, review and documentation as any other input to an actuarial process, because an agent that remembers a superseded assumption will apply it confidently.",
    chapters: [12, 15],
    domains: ["reserving", "life-health-pensions"],
    codeSlugs: ["ch12", "ch15"],
    related: ["agentic-ai", "retrieval-augmented-generation", "ai-governance"],
  },

  {
    slug: "retrieval-augmented-generation",
    title: "Retrieval-augmented generation",
    glossaryTerm: "RAG",
    summary:
      "The architectural response to hallucination: retrieve authoritative documents at query time and require the model to answer from them.",
    body: [
      "Ask a chatbot about the contractual service margin under a specific IFRS 17 transition method and it may produce a confident answer citing a paragraph number that does not exist. A retrieval-augmented system searches a curated index of the standard first, locates the relevant paragraphs, and asks the model to answer using only those passages. The second answer is correct, traceable, and refusable when the retrieved context is insufficient — and that last property is what makes the pattern viable under regulatory scrutiny.",
      "The architecture separates two concerns: knowing the documents is a retrieval problem, and producing fluent prose grounded in them is a generation problem. The pipeline has three stages — retrieval returns the chunks most relevant to the query, augmentation inserts them into the prompt, generation produces the answer from that context. Retrieval is where the substantive engineering sits. Keyword search works when actuarial terminology is precise and queries match document language, but fails across synonyms: 'expected loss' against 'ultimate loss', 'Bornhuetter-Ferguson' against 'BF method'. Vector search embeds queries and documents so semantic similarity becomes proximity. Hybrid search combines both and is generally more robust for actuarial documents, where exact-match terms like regulation numbers sit alongside conceptual content.",
      "Chunking is the unglamorous decision that determines whether any of it works. Documents must be split for indexing, and naive fixed-token splitting handles prose adequately while failing badly on actuarial material. A formula split mid-line is uninterpretable. A table split between header and body is misleading. A cross-reference whose target chunk is never retrieved produces an answer citing an absent document. Structural chunking that respects document hierarchy and keeps tables intact is the remedy.",
      "Evaluation has to cover both stages separately, because a poor answer can come from either and the fixes differ. Retrieval is measured by recall at k and mean reciprocal rank; generation by faithfulness to the retrieved context, answer relevance, and context relevance. The named failure modes follow the same split: retrieval failure, where the model falls back on parametric memory; generation failure, where the answer contradicts or selectively quotes the context; and stale-context failure, where the answer is right against an outdated index.",
    ],
    whyItMatters:
      "What to index is an actuarial governance question, not an IT one. Regulatory documents are the obvious candidates, with the caveat that updates are frequent and stale content is a liability. Internal material is higher-value precisely because no public model has seen it: methodology notes, peer review templates, prior reports, historical experience studies and assumption documents are the institutional memory that distinguishes one insurer's practice from another. The value of RAG in actuarial work is rarely the model's fluency — it is the retrieval layer that makes an answer citable.",
    chapters: [6, 16],
    domains: ["risk-compliance", "pricing"],
    codeSlugs: ["ch12", "ch16"],
    related: ["hallucination", "agent-memory", "ai-governance"],
  },

  {
    slug: "hallucination",
    title: "Hallucination",
    glossaryTerm: "Hallucination",
    summary:
      "Confident, fluent output that is factually wrong — a structural consequence of the training objective, not a defect awaiting a patch.",
    body: [
      "A large language model will produce a citation to a regulation that does not exist, a figure that is plausible and wrong, a fabricated quotation, an invented procedural step. These are not random errors. They follow from the training objective: the model is optimised to produce text resembling its training data, so plausibility is the design criterion, not truth. Nothing in the architecture flags when the model is generating from a region where its training data was sparse or wrong.",
      "The property is compounded by fluency. Output reads as though written by a competent professional, which makes drafts usable as starting points and makes errors invisible to the reader's usual defences. Awkward phrasing normally signals uncertainty in human writing; here it does not. A model that defends an indefensible reserving assumption with confident prose is a documented production risk, not a hypothetical one.",
      "Because the property is structural, the responses are containment rather than cure. Grounding, through retrieval-augmented generation, replaces parametric recall with retrieved passages and allows refusal when context is insufficient. Structured output validation constrains the answer to a schema that can be checked mechanically. Tool use moves calculation out of the model entirely, so numbers come from code rather than from prediction. Human review is placed wherever an error would be consequential. None of these removes the underlying property; together they bound its impact.",
      "The related organisational failure is over-reliance: fluent output taken at face value, with errors propagating downstream, made worse by confirmation bias when the prompt steers the model toward an expected answer. The model has no incentive to disagree. The remedy is structural too — separate generation from validation, build evaluation harnesses that check outputs against ground truth on a sample, and treat model output as a draft requiring review rather than a finished product.",
    ],
    whyItMatters:
      "For actuarial work, hallucination is what makes validating AI output a professional skill rather than a technical chore. The actuary who learned spreadsheets in 1990 gained a tool that did not produce confident, plausible, occasionally wrong results; this one does. Reliability varies sharply across techniques — a rule-based check is predictable, a gradient-boosted tree is reliable on data resembling its training set, a language model is none of those — so matching the technique to the reliability the application demands is the first design decision, and the one that most often goes unmade.",
    chapters: [4, 6, 5],
    domains: ["pricing", "risk-compliance"],
    codeSlugs: ["ch14", "ch16"],
    related: [
      "retrieval-augmented-generation",
      "execution-and-evidence-traces",
      "ai-governance",
    ],
  },

  {
    slug: "execution-and-evidence-traces",
    title: "Execution and evidence traces",
    glossaryTerm: "Execution trace",
    summary:
      "What an agent recorded doing, as distinct from what it says it was thinking — and why only the first is audit evidence.",
    body: [
      "A regulatory tribunal asking how a particular decision was reached needs a record: the inputs consumed, the model calls made, the tools invoked with their arguments and returned values, and the human approvals given at each checkpoint. That record is the execution trace. It is emitted by the system as it runs, it is structured, and it can be reconstructed independently of the model that produced the output.",
      "A reasoning trace is a different artefact. It is the natural-language sequence of intermediate steps a model produces before committing to an answer, and it is genuinely useful: a reviewer can read it, find the step where the argument went wrong, and redirect the agent at that step rather than only at the final output. But it is narration generated alongside the answer, by the same model, with the same failure modes. A trace that is fluently produced and logically flawed is still flawed. Treating it as evidence of how a decision was reached means accepting the model's account of itself.",
      "The practical distinction is what each artefact can support. Reasoning traces support review — peer review, error diagnosis, and correction during development. Execution traces support audit, reproduction and accountability, because they record events rather than describing them. A number accompanied by an explicit derivation is easier to defend in peer review than a bare number; a number accompanied by the tool calls that computed it is a different and stronger claim.",
      "Designing for the execution record from the beginning, rather than retrofitting it, is what separates agentic systems that can be deployed in regulated functions from those that cannot. In practice that means structured logging of every tool call and its result, status fields on every agent message recording what was attempted and with what confidence, explicit limits on the steps an agent may take, and a record of where a human approved and on what evidence.",
    ],
    whyItMatters:
      "Professional accountability does not move. The Appointed Actuary in India, the Actuarial Function Holder under Solvency II, and the signing actuary in the United States each bear personal liability that no software absorbs, and each may have to explain a decision after the fact. What they can explain is bounded by what the system recorded. An agentic deployment that produced good answers but kept no execution record has not made its outputs defensible — it has only made them fast.",
    chapters: [12, 16, 17],
    domains: ["risk-compliance", "reserving"],
    codeSlugs: ["ch17", "ch14"],
    related: ["ai-governance", "multi-agent-system", "agentic-ai"],
  },

  {
    slug: "ai-governance",
    title: "AI governance for actuarial work",
    glossaryTerm: "Workflow",
    summary:
      "The five convergent requirements the actuarial bodies have settled on, and why agentic AI is governed under the existing framework rather than a new one.",
    body: [
      "Guidance from the Actuarial Standards Board in the United States, the Institute and Faculty of Actuaries in the United Kingdom, the International Actuarial Association, and the Casualty Actuarial Society has converged on five elements: documented assumptions about what the system does and how; validation evidence that it performs as intended on representative inputs; ongoing monitoring of performance in production; clear professional accountability for the outputs; and proportionality, so the rigour applied scales with materiality. A regulatory monitoring agent supporting research carries lighter governance than a pricing agent contributing to filed rates.",
      "The professional codes apply without modification. An actuary who deploys an agentic system is responsible for its outputs to the same standard as work produced by hand; the code does not lower its standards in proportion to the level of automation. Bias and fairness are acute here, because a system reflecting historical patterns of unfair discrimination will perpetuate or amplify them unless explicit measures are taken, and the legal regimes governing discrimination apply to AI-supported decisions exactly as they apply to any other.",
      "Human-in-the-loop design is the architectural pattern that made agentic AI deployable in regulated contexts at all. The principle is to identify the points in a workflow where an error would be consequential and require approval at those points before the workflow proceeds. It works because most agentic errors are detectable by a qualified reviewer when surfaced; the failures happen when they are not surfaced. Designing the checkpoints requires explicit thought about what the human is verifying, what evidence the agent must present, and how the decision is recorded.",
      "Monitoring extends testing into production, and the quantities worth tracking are specific: latency at each step, error rates by category, agent step counts (rising counts often mean the agent is struggling with a class of input), tool failure rates, token consumption, and quality metrics where measurable. Drift in any of them is a leading indicator. The failure that ends pilots is rarely dramatic — it is quiet degradation, where a data format shifted, a provider updated a model, a prompt was edited for an unrelated reason, and nobody connected the pieces.",
    ],
    whyItMatters:
      "The structural constraint underneath all of this does not move with the technology. Insurance regulation requires a named, qualified individual to sign opinions and certifications, and that person bears personal professional liability no software system can absorb. No AI system can sign a Statement of Actuarial Opinion, and no model can be called before a tribunal to explain its reasoning under oath. Governance frameworks are not a brake on adoption; they are the precondition for deploying any of this in a regulated actuarial function.",
    chapters: [17, 16, 8],
    domains: ["risk-compliance", "pricing", "reserving", "life-health-pensions"],
    codeSlugs: ["ch17", "ch16"],
    related: [
      "execution-and-evidence-traces",
      "hallucination",
      "multi-agent-system",
    ],
  },
];

export function getConcept(slug: string): Concept | undefined {
  return CONCEPTS.find((c) => c.slug === slug);
}

export function conceptPath(slug: string): string {
  return `/concepts/${slug}`;
}
