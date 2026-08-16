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

/** Author records, drawn from the book's About the Authors. The homepage,
 * the author pages, llms.txt and every Person node in JSON-LD render from
 * here — the landing page used to carry its own hardcoded prose, which
 * meant two versions of each biography could drift apart. */
export type Author = {
  slug: string;
  name: string;
  honorificPrefix?: string;
  /** Post-nominal credentials, as printed on the title page. */
  honorificSuffix?: string;
  jobTitle?: string;
  affiliation?: string;
  /** One-sentence bio, used in cards and JSON-LD descriptions. */
  bio?: string;
  /** Portrait in /public. */
  image?: string;
  /** Short label for the homepage card. */
  cardBio?: string;
  /** Full biography for /authors/[slug]. */
  biography?: string[];
  roles?: { title: string; org: string }[];
  research?: string;
  /** Counts and venues, all as stated in About the Authors. */
  publications?: string[];
  speaking?: string[];
  teaching?: string[];
  knowsAbout?: string[];
  relationToBook?: string;
  links?: { label: string; url: string }[];
};

export const AUTHORS: Author[] = [
  {
    slug: "satya-sai-mudigonda",
    name: "Satya Sai Mudigonda",
    honorificSuffix: "CPCU, PMP, AIAI",
    jobTitle: "Professor of Practice",
    affiliation: "Sri Sathya Sai Institute of Actuaries",
    image: "/author-satya.webp",
    bio:
      "Over three decades of global experience across actuarial practice, " +
      "technology leadership, and data-science research in nine countries; " +
      "author of 36+ publications in international journals; Chairman of " +
      "the Sri Sathya Sai Institute of Actuaries, leading the integration " +
      "of AI into actuarial education and practice.",
    cardBio:
      "Senior tech actuarial consultant and Professor of Practice; Chairman of the Sri Sathya Sai Institute of Actuaries. Thirty plus years across actuarial practice, technology leadership, and data science research.",
    biography: [
      "Satya Sai Mudigonda brings over three decades of global experience spanning actuarial practice, technology leadership, and data science research across nine countries. He has led large multidisciplinary teams of over 450 professionals and managed operations exceeding USD 25 million within Global Capability Centre models.",
      "He has worked with leading organisations including Life Insurance Corporation of India, Sun Life of Canada, United States Automobile Association (USAA), ACE (Chubb), Manulife, John Hancock, Toronto Dominion (TD Life), and Accenture, across the United States, Canada, and India.",
      "As Professor of Practice at Sri Sathya Sai Educational Institutions, he has played a significant role in shaping the careers of more than 150 students pursuing actuarial careers, mentored over two dozen students who progressed to become Associate and Fellow actuaries, and guided seven doctoral research scholars — including the first two doctoral scholars in actuarial science in India.",
      "He currently serves as Chairman of the Sri Sathya Sai Institute of Actuaries, where he leads initiatives focused on integrating artificial intelligence with actuarial education and professional practice. Alongside a team of 27+ faculty members, he is engaged in AI-driven actuarial education, research, mentoring, and advanced technology-enabled actuarial consulting.",
    ],
    roles: [
      { title: "Chairman", org: "Sri Sathya Sai Institute of Actuaries" },
      {
        title: "Professor of Practice",
        org: "Sri Sathya Sai Educational Institutions",
      },
    ],
    research:
      "Actuarial data science, predictive analytics, AI-driven risk management, insurance fraud detection, machine learning applications in insurance, and the ethical integration of agentic AI into actuarial practice and education.",
    publications: [
      "More than 36 publications in international journals",
      "Presented at 18 international conferences",
    ],
    teaching: [
      "150+ students mentored into actuarial careers",
      "Two dozen mentees who went on to qualify as Associate and Fellow actuaries",
      "Seven doctoral research scholars guided, including India's first two in actuarial science",
    ],
    knowsAbout: [
      "Actuarial data science",
      "Predictive analytics",
      "AI-driven risk management",
      "Insurance fraud detection",
      "Agentic AI governance",
    ],
    relationToBook:
      "Co-author. The book's framing of AI as a partnership constrained by professional accountability, and its emphasis on governance proportionate to materiality, reflects three decades of building actuarial technology functions and teaching the actuaries who staff them.",
    links: [{ label: "sssia.org", url: "https://sssia.org" }],
  },
  {
    slug: "rohan-yashraj-gupta",
    name: "Rohan Yashraj Gupta",
    honorificPrefix: "Dr",
    honorificSuffix: "PhD, FIA, FIAI",
    jobTitle: "Actuarial Associate Principal",
    affiliation: "Accenture",
    image: "/author-rohan.jpeg",
    bio:
      "Fellow of the Institute and Faculty of Actuaries and of the " +
      "Institute of Actuaries of India, and the first person in India to " +
      "earn a PhD in Actuarial Science, on fraud detection in insurance; " +
      "Adjunct Faculty at the Sri Sathya Sai Institute of Actuaries.",
    cardBio:
      "The first person in India to earn a PhD in actuarial science. Eight years of life and non-life insurance experience, nine published papers, and adjunct faculty at the Sri Sathya Sai Institute of Actuaries.",
    biography: [
      "Rohan Yashraj Gupta is a Fellow of the Institute of Actuaries of India (FIAI) and a Fellow of the Institute and Faculty of Actuaries (FIA), and the first person in India to earn a PhD in Actuarial Science. His doctoral research, on fraud detection in insurance, marked an early commitment to applying advanced analytical methods to long-standing problems in the profession — a thread that continues to run through his work at the intersection of actuarial science, data science, and artificial intelligence.",
      "He currently serves as Actuarial Associate Principal at Accenture, where he leads and contributes to engagements across non-life insurance for clients overseas. In parallel, he serves as Adjunct Faculty at the Sri Sathya Sai Institute of Actuaries, where he mentors students through their professional examinations, coordinates guest lectures, and helps shape curriculum that bridges classical actuarial theory and contemporary industry practice.",
      "Over eight years in the profession, his applied experience has spanned group health analytics, crop insurance, and cancer product pricing — work that has given him a practitioner's view of where models meet messy reality.",
    ],
    roles: [
      { title: "Actuarial Associate Principal", org: "Accenture" },
      { title: "Adjunct Faculty", org: "Sri Sathya Sai Institute of Actuaries" },
    ],
    research:
      "How agentic AI can be embedded responsibly into pricing, reserving, and regulatory workflows, bringing the rigour of actuarial practice to bear on a rapidly evolving technological landscape.",
    publications: ["Author of nine published papers and book chapters"],
    speaking: [
      "CAS Spring Meeting",
      "ASTIN Colloquia",
      "Global Conference of Actuaries",
    ],
    teaching: [
      "Mentors students through their professional examinations at SSSIA",
      "Coordinates guest lectures and curriculum development",
    ],
    knowsAbout: [
      "Actuarial science",
      "Insurance fraud detection",
      "Non-life pricing and reserving",
      "Agentic AI",
      "Data science",
    ],
    relationToBook:
      "Co-author, and the author of the companion code. The runnable examples across Chapters 9 to 17 come out of the same practitioner's view that shapes the book's insistence on tools, structured outputs, and verification over fluent prose.",
    links: [{ label: "rohanyashraj.com", url: "https://rohanyashraj.com" }],
  },
];

export function getAuthor(slug: string): Author | undefined {
  return AUTHORS.find((a) => a.slug === slug);
}
