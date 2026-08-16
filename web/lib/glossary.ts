/** The book's glossary. Definitions emphasise the actuarial reading where
 * AI and actuarial usage diverge, and are the site's canonical wording:
 * /glossary and llms.txt both render from here, so answer engines quote
 * these definitions rather than paraphrasing them. Keep any change here
 * consistent with the chapter summaries in chapter-content.ts. */

export type GlossaryTerm = { term: string; definition: string };

/** URL fragment for a term, e.g. "#reasoning-trace". */
export function glossarySlug(term: string): string {
  return term
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    term: "Agent",
    definition:
      "System that takes a goal, plans, executes actions via tools, and adapts. Distinguished from a chatbot by autonomy and tool use.",
  },
  {
    term: "Agentic AI",
    definition:
      "Architectural pattern in which a language model serves as the reasoning engine inside a system that perceives, plans, acts, and remembers.",
  },
  {
    term: "API",
    definition:
      "Application Programming Interface. Structured contract by which one component requests services from another; the access mechanism for modern AI models.",
  },
  {
    term: "Attention",
    definition:
      "Mechanism, introduced in 2017, that lets a model weight different parts of its input differently when producing each part of its output.",
  },
  {
    term: "Chain-of-thought",
    definition:
      "Prompting technique in which the model reasons step by step before producing its final answer, generally improving accuracy on multi-step problems.",
  },
  {
    term: "Chunking",
    definition:
      "Splitting documents into shorter passages for indexing and retrieval. Quality affects RAG performance materially.",
  },
  {
    term: "Drift",
    definition:
      "Degradation of model performance over time, typically because the production data distribution has moved away from the training distribution.",
  },
  {
    term: "Embedding",
    definition:
      "Numerical vector representation of text or image such that semantically similar items have similar vectors. Underpins vector search.",
  },
  {
    term: "Execution trace",
    definition:
      "Record of what an agent actually did: the tools it called, the arguments it passed, the values they returned, and the human approvals given. Unlike a reasoning trace it is emitted by the system rather than narrated by the model, which is what makes it usable as audit evidence.",
  },
  {
    term: "Few-shot prompting",
    definition:
      "Prompting that includes a small number of completed examples of the task to guide the model's response format and style.",
  },
  {
    term: "Fine-tuning",
    definition:
      "Continuing the training of a pre-trained model on a smaller, task-specific dataset to bias outputs toward the patterns in that dataset.",
  },
  {
    term: "Function calling",
    definition:
      "Mechanism by which a language model invokes external tools by emitting a structured request to a named function with typed arguments.",
  },
  {
    term: "Grounding",
    definition:
      "Basing model outputs on retrieved authoritative documents rather than the model's parametric memory, reducing hallucination.",
  },
  {
    term: "Hallucination",
    definition:
      "Confident, fluent model output that is factually wrong. A structural property of LLMs, not a bug to be patched.",
  },
  {
    term: "LLM",
    definition:
      "Large Language Model. Neural network trained on large text corpora to predict tokens, capable of generating fluent text from natural-language instructions.",
  },
  {
    term: "LoRA",
    definition:
      "Low-Rank Adaptation. Parameter-efficient fine-tuning method updating only a small fraction of a model's weights.",
  },
  {
    term: "Model",
    definition:
      "In actuarial usage, a mathematical structure for a process. In ML, a function with parameters fit to data. Context disambiguates.",
  },
  {
    term: "Multi-agent system",
    definition:
      "Arrangement of specialised agents that collaborate on tasks too complex or heterogeneous for a single agent to handle reliably.",
  },
  {
    term: "Overfitting",
    definition:
      "Training performance good, out-of-sample performance poor. The ML analogue of an actuarial assumption set that fits history but fails to project.",
  },
  {
    term: "Prompt",
    definition:
      "Instruction, often combined with context and examples, sent to a language model to elicit a desired response.",
  },
  {
    term: "RAG",
    definition:
      "Retrieval-Augmented Generation. Pattern in which authoritative documents are retrieved at query time and used to ground the model's response.",
  },
  {
    term: "ReAct",
    definition:
      "Agent design pattern alternating reasoning steps with action steps, the model producing both an explanation and an action at each step.",
  },
  {
    term: "Reasoning trace",
    definition:
      "Natural-language sequence of intermediate steps a model produces before its final answer. It makes an output reviewable and correctable, because a reader can find the step where the argument went wrong. It is model-generated narration rather than a record of computation, so it is a review aid and not audit evidence; the execution trace is what withstands audit.",
  },
  {
    term: "Sandboxing",
    definition:
      "Restriction of what tools can do, particularly for tools that affect systems of record or execute arbitrary code. Essential for production safety.",
  },
  {
    term: "Supervised learning",
    definition:
      "ML approach that learns to map inputs to outputs from labelled training examples. The dominant ML approach in actuarial applications.",
  },
  {
    term: "Token",
    definition:
      "Subword unit produced by a tokeniser. Models read and write in tokens; cost and context-window limits are measured in tokens.",
  },
  {
    term: "Tool",
    definition:
      "Callable function the model can invoke through structured requests. Tools provide the agent's capacity to act on its environment.",
  },
  {
    term: "Transformer",
    definition:
      "Neural network architecture introduced in 2017, foundation of modern LLMs, using attention rather than recurrence to process sequences.",
  },
  {
    term: "Workflow",
    definition:
      "Predefined sequence of agent or tool calls. Contrasted with a team in which agents decide autonomously how to coordinate. Workflows are easier to govern.",
  },
];
