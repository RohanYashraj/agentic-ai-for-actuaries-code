/** The book's structure: 5 parts, 18 chapters, paraphrased from the
 * detailed outline. Chapters 9-17 link to their companion-code pages.
 *
 * This module is the skeleton the book pages hang from. Reading material
 * lives in chapter-content.ts, and the practice domain of a Part IV
 * chapter is derived from DOMAINS rather than repeated here. */

export type OutlineChapter = {
  number: number;
  title: string;
  oneLiner: string;
  caseStudy: string;
  /** /code/[slug] when the chapter has runnable companion code. */
  slug?: string;
};

export type OutlinePart = {
  roman: string;
  title: string;
  approach: string;
  blurb: string;
  chapters: OutlineChapter[];
};

export const BOOK_PROMISE =
  "From zero AI knowledge to building, deploying, and governing autonomous actuarial systems. No prior programming or AI background assumed; mathematical maturity expected.";

export const TARGET_READERS = [
  "Aspiring actuaries future-proofing their careers",
  "Practicing actuaries in pricing, reserving, life, health, pensions, and risk",
  "Actuarial leaders evaluating AI adoption for their teams",
];

export const OUTLINE: OutlinePart[] = [
  {
    roman: "I",
    title: "Foundations of Artificial Intelligence",
    approach: "Conceptual",
    blurb:
      "AI literacy from scratch. The vocabulary and mental models everything else builds on, with no code and no jargon walls.",
    chapters: [
      {
        number: 1,
        title: "The AI Landscape. What Actuaries Need to Know",
        oneLiner:
          "What AI is, where it came from, and why it matters for actuarial work right now.",
        caseStudy: "The evolving role of the Chief Actuary, 2018 vs 2025",
      },
      {
        number: 2,
        title: "Machine Learning Fundamentals for Actuaries",
        oneLiner:
          "Supervised, unsupervised, and reinforcement learning through actuarial problems. A mortality table is already a predictive model.",
        caseStudy: "Predicting lapse rates with machine learning",
      },
      {
        number: 3,
        title: "Deep Learning and Neural Networks Demystified",
        oneLiner:
          "How neural networks learn, and which architectures matter, without the linear algebra.",
        caseStudy: "Automating property damage assessment with a CNN",
      },
      {
        number: 4,
        title: "Natural Language Processing and the Rise of LLMs",
        oneLiner:
          "From tokenization to transformers, and why hallucination risk needs special handling in actuarial contexts.",
        caseStudy: "Mining insights from underwriting narratives",
      },
    ],
  },
  {
    roman: "II",
    title: "Working with Large Language Models",
    approach: "Conceptual + practical",
    blurb:
      "From understanding AI to using it. Interacting with, grounding, customizing, and architecting around LLMs for actuarial work.",
    chapters: [
      {
        number: 5,
        title: "Prompt Engineering for Actuarial Professionals",
        oneLiner:
          "A reusable library of actuarial prompt patterns, from reserving analyses to regulatory responses.",
        caseStudy: "Building an IFRS 17 disclosure drafting assistant",
      },
      {
        number: 6,
        title: "Retrieval-Augmented Generation for Actuarial Knowledge",
        oneLiner:
          "Grounding LLM answers in authoritative standards and internal documents instead of general knowledge.",
        caseStudy: "An internal actuarial standards Q&A system",
      },
      {
        number: 7,
        title: "Fine-Tuning and Domain Adaptation",
        oneLiner:
          "When to customize a model and when good prompting is enough. A build-vs-buy decision framework.",
        caseStudy: "Fine-tuning a model for actuarial report summarization",
      },
      {
        number: 8,
        title: "AI Application Architecture for Actuarial Systems",
        oneLiner:
          "APIs, pipelines, orchestration, security, and cost. The gap between a chatbot and a production system.",
        caseStudy: "Designing an AI-assisted reserving pipeline",
      },
    ],
  },
  {
    roman: "III",
    title: "Agentic AI: From Concept to Architecture",
    approach: "Hands-on code",
    blurb:
      "The core of the book. What makes AI agentic, and your first working agents in Python, introduced line by line.",
    chapters: [
      {
        number: 9,
        title: "What is Agentic AI? Principles and Architecture",
        oneLiner:
          "Autonomy, goal-directed behavior, and the cognitive loop. Your first agent, built and run.",
        caseStudy: "Building a data quality agent",
        slug: "ch09",
      },
      {
        number: 10,
        title: "Tool Use and Function Calling",
        oneLiner:
          "Wrapping actuarial calculations as tools agents can call, with error handling and safety boundaries.",
        caseStudy: "An agent that runs actuarial calculations",
        slug: "ch10",
      },
      {
        number: 11,
        title: "Multi-Agent Systems and Collaboration",
        oneLiner:
          "Teams of specialized agents: communication, orchestration patterns, and the supervisor pattern.",
        caseStudy: "A multi-agent actuarial review team",
        slug: "ch11",
      },
      {
        number: 12,
        title: "Memory, Planning, and Reasoning",
        oneLiner:
          "Agents that remember prior sessions, plan multi-step analyses, and check their own work.",
        caseStudy: "A learning experience study agent",
        slug: "ch12",
      },
    ],
  },
  {
    roman: "IV",
    title: "Agentic AI in Actuarial Practice",
    approach: "Domain code",
    blurb:
      "Everything from Parts I to III applied to the four major actuarial domains, grounded in real workflows.",
    chapters: [
      {
        number: 13,
        title: "Agentic AI for Pricing and Underwriting",
        oneLiner:
          "Rating, underwriting triage, and model validation across P&C and life, with human oversight built in.",
        caseStudy: "An agentic underwriting assistant for commercial lines",
        slug: "ch13",
      },
      {
        number: 14,
        title: "Agentic AI for Reserving and Claims",
        oneLiner:
          "Reserve estimation, development monitoring, and narrative generation that ease the quarterly crunch.",
        caseStudy: "A continuous reserving monitor",
        slug: "ch14",
      },
      {
        number: 15,
        title: "Agentic AI for Life, Health, and Pensions",
        oneLiner:
          "Experience studies, pension valuations, and policyholder communication across three domains.",
        caseStudy: "An automated pension scheme valuation pipeline",
        slug: "ch15",
      },
      {
        number: 16,
        title: "Agentic AI for Risk Management and Compliance",
        oneLiner:
          "Regulatory monitoring, capital modeling support, and ORSA drafting with auditable outputs.",
        caseStudy: "A regulatory change impact agent",
        slug: "ch16",
      },
    ],
  },
  {
    roman: "V",
    title: "Production, Governance, and the Future",
    approach: "Strategic + practical",
    blurb:
      "The hardest part: making agentic AI reliable in production, governing it professionally, and preparing for what comes next.",
    chapters: [
      {
        number: 17,
        title: "Deploying and Governing Agentic AI in Practice",
        oneLiner:
          "Testing non-deterministic systems, human-in-the-loop design, monitoring, and governance aligned with professional standards.",
        caseStudy: "Building an actuarial AI governance framework",
        slug: "ch17",
      },
      {
        number: 18,
        title: "The Future of Actuarial Science in the Age of Agentic AI",
        oneLiner:
          "Emerging capabilities, the evolving actuarial skillset, and a personal roadmap for leading the change.",
        caseStudy: "Three futures. Scenarios for the profession in 2035",
      },
    ],
  },
];

/** Every chapter in reading order, flattened out of the parts. */
export const CHAPTER_LIST: OutlineChapter[] = OUTLINE.flatMap(
  (part) => part.chapters
);

/** Chapter numbers are zero-padded in URLs so /book/chapters/01 sorts and
 * reads like a table of contents entry. */
export function chapterPath(n: number): string {
  return `/book/chapters/${String(n).padStart(2, "0")}`;
}

export function getOutlineChapter(n: number): OutlineChapter | undefined {
  return CHAPTER_LIST.find((c) => c.number === n);
}

export function getPartOf(n: number): OutlinePart | undefined {
  return OUTLINE.find((p) => p.chapters.some((c) => c.number === n));
}

export function prevNextChapter(n: number): {
  prev?: OutlineChapter;
  next?: OutlineChapter;
} {
  const i = CHAPTER_LIST.findIndex((c) => c.number === n);
  if (i === -1) return {};
  return { prev: CHAPTER_LIST[i - 1], next: CHAPTER_LIST[i + 1] };
}
