/** Questions the site is actually asked, answered in one paragraph each.
 *
 * Answers are drawn from the book's preface and the repository README
 * rather than written fresh, so what the site claims about running the
 * code matches what the code actually does. */

export type FaqCategory = "the-book" | "the-code" | "coverage";

export type FaqItem = {
  question: string;
  answer: string;
  category: FaqCategory;
};

export const FAQ_CATEGORIES: { id: FaqCategory; label: string }[] = [
  { id: "the-book", label: "The book" },
  { id: "the-code", label: "Running the code" },
  { id: "coverage", label: "What it covers" },
];

export const FAQ: FaqItem[] = [
  {
    category: "the-book",
    question: "Who is this book for?",
    answer:
      "Three audiences at once: aspiring actuaries who will graduate into a profession that already uses these tools, practising actuaries in pricing, reserving, life, health, pensions and risk who need to know what is real and what is not, and actuarial leaders evaluating AI adoption for their teams. It assumes mathematical maturity and no programming or AI background.",
  },
  {
    category: "the-book",
    question: "Do I need to be a software engineer to follow it?",
    answer:
      "No. Parts I and II contain no code at all — they build AI literacy from scratch, through actuarial problems rather than computer-science examples. Code begins in Part III, at Chapter 9, and is introduced line by line. If you have never written Python, the browser demos on this site let you read and run it without installing anything.",
  },
  {
    category: "the-book",
    question: "Will AI replace actuaries?",
    answer:
      "The book's answer is structural rather than predictive. Insurance regulation requires a named, qualified individual to sign opinions and certifications — the Appointed Actuary in India, the Actuarial Function Holder under Solvency II, the signing actuary in the United States — and each bears personal professional liability no software system can absorb. No AI system can sign a Statement of Actuarial Opinion or be called before a tribunal to explain its reasoning under oath. The productive framing is partnership, with the judgment required to validate AI output being itself a new actuarial skill.",
  },
  {
    category: "the-code",
    question: "Can I run the examples without installing anything?",
    answer:
      "Yes, two ways. Tool scripts run right here in your browser on Pyodide, a full CPython compiled to WebAssembly — you can edit them and run again, entirely locally. Agent scripts run live on our server against Gemini, with their tool calls streamed as they happen. A third path, Colab, needs only a Google account and your own free Gemini key.",
  },
  {
    category: "the-code",
    question: "Is the code free?",
    answer:
      "Yes. Every companion listing lives in an open repository under the MIT licence, and every example runs comfortably on the Gemini free tier. All datasets are synthetic, and Meridian Re, the reinsurer the case studies follow, is fictional.",
  },
  {
    category: "the-code",
    question: "Which AI frameworks does the book use?",
    answer:
      "Agno for agent construction, with Gemini as the default model. The book discusses LangGraph, CrewAI and AutoGen as alternatives and is explicit that the architectural patterns transfer between them — framework choice should follow the architectural decisions rather than precede them. Model selection is configurable in one place, so the examples can be re-pointed at another provider.",
  },
  {
    category: "the-code",
    question: "Does the code on this site match the code in the book?",
    answer:
      "Yes, and it is checked mechanically. The browser demos are generated from the repository chapter scripts at build time, so they cannot drift from the printed listings, and continuous integration fails if a script can no longer be transformed. Where the repository deliberately departs from a printed listing — usually because a library API changed after the book went to press — it is recorded in the repository's errata.",
  },
  {
    category: "coverage",
    question: "Which actuarial domains are covered?",
    answer:
      "Four, each with its own chapter in Part IV and its own worked code: pricing and underwriting, reserving and claims, life, health and pensions, and risk management and compliance. Each domain page on this site lists the workflows that have established themselves in production and, explicitly, what stays with the qualified professional.",
  },
  {
    category: "coverage",
    question: "Does it cover AI governance?",
    answer:
      "Substantially. Chapter 17 is devoted to deploying and governing agentic AI, and governance runs through the domain chapters as well. The book sets out the five requirements that guidance from the Actuarial Standards Board, the Institute and Faculty of Actuaries, the International Actuarial Association and the Casualty Actuarial Society converges on: documented assumptions, validation evidence, ongoing monitoring, clear professional accountability, and proportionality.",
  },
  {
    category: "coverage",
    question: "How does it handle hallucination and reliability?",
    answer:
      "As a structural property rather than a defect awaiting a patch. Because a language model is optimised to produce plausible text, plausibility is the design criterion and not truth. The book's responses are containment: grounding through retrieval, structured output validation, moving calculation into tools so numbers come from code, and human review wherever an error would be consequential.",
  },
  {
    category: "coverage",
    question: "Is agentic AI ready for unsupervised use in regulated work?",
    answer:
      "No, and the book says so directly. The technology is real and useful in specific applications, but the maturity of the surrounding governance is not yet sufficient for unsupervised deployment in regulated processes. The pattern that has worked is human-in-the-loop: agents handling the bulk of a workflow autonomously and raising flags at the points where actuarial judgment is required.",
  },
];
