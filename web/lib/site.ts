/** Canonical site origin, shared by metadata, sitemap, robots, JSON-LD
 * and llms.txt. Resolution: explicit override → Vercel production
 * domain → local dev. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const SITE_NAME = "Agentic AI for Actuaries";

export const BOOK_SUBTITLE =
  "From AI Foundations to Autonomous Actuarial Systems";

export const SITE_DESCRIPTION =
  "Companion site for the book Agentic AI for Actuaries by Satya Sai Mudigonda and Rohan Yashraj Gupta: run the actuarial tools in your browser, watch the book's agents work live, and open every chapter in Colab.";

/** Book-level summary for JSON-LD and llms.txt, condensed from the
 * book's preface and Chapter 1. */
export const BOOK_DESCRIPTION =
  "Agentic AI for Actuaries takes actuaries from zero AI background to " +
  "building, deploying, and governing autonomous actuarial systems. Five " +
  "parts: foundations of AI and machine learning; working with large " +
  "language models (prompting, retrieval-augmented generation, " +
  "fine-tuning, application architecture); agentic architecture (tool " +
  "use, multi-agent systems, memory, planning, and reasoning); " +
  "applications across pricing and underwriting, reserving and claims, " +
  "life, health, and pensions, and risk management and compliance; and " +
  "production deployment, governance, and the future of the profession. " +
  "Its central argument is structural: no AI system can sign an " +
  "actuarial opinion or bear professional liability, so agentic AI " +
  "augments rather than replaces the qualified actuary — and validating " +
  "AI outputs is itself a new actuarial skill.";

export const BOOK_KEYWORDS = [
  "agentic AI",
  "actuarial science",
  "artificial intelligence",
  "large language models",
  "machine learning",
  "insurance",
  "pricing",
  "reserving",
  "pensions",
  "risk management",
  "multi-agent systems",
  "Agno",
  "Python",
];

export type Author = {
  name: string;
  honorificPrefix?: string;
  /** Post-nominal credentials, as printed on the title page. */
  honorificSuffix?: string;
  jobTitle?: string;
  affiliation?: string;
  /** One-sentence bio condensed from the book's About the Authors. */
  bio?: string;
};

export const AUTHORS: Author[] = [
  {
    name: "Satya Sai Mudigonda",
    honorificSuffix: "CPCU, PMP, AIAI",
    jobTitle: "Professor of Practice",
    affiliation: "Sri Sathya Sai Institute of Actuaries",
    bio:
      "Over three decades of global experience across actuarial practice, " +
      "technology leadership, and data-science research in nine countries; " +
      "author of 36+ publications in international journals; Chairman of " +
      "the Sri Sathya Sai Institute of Actuaries, leading the integration " +
      "of AI into actuarial education and practice.",
  },
  {
    name: "Rohan Yashraj Gupta",
    honorificPrefix: "Dr",
    honorificSuffix: "PhD, FIA, FIAI",
    jobTitle: "Actuarial Associate Principal",
    affiliation: "Accenture",
    bio:
      "Fellow of the Institute and Faculty of Actuaries and of the " +
      "Institute of Actuaries of India, and the first person in India to " +
      "earn a PhD in Actuarial Science, on fraud detection in insurance; " +
      "Adjunct Faculty at the Sri Sathya Sai Institute of Actuaries.",
  },
];
