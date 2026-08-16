import { CHAPTER_CONCEPTS, CORE_POSITIONS } from "@/lib/book";
import { CHAPTER_CONTENT } from "@/lib/chapter-content";
import { CHAPTERS } from "@/lib/chapters";
import { CONCEPTS } from "@/lib/concepts";
import { DOMAINS, domainForChapter } from "@/lib/domains";
import { FAQ } from "@/lib/faq";
import { GLOSSARY } from "@/lib/glossary";
import { GITHUB_REPO } from "@/lib/links";
import {
  BOOK_PROMISE,
  chapterPath,
  OUTLINE,
  TARGET_READERS,
} from "@/lib/outline";
import { REFERENCES } from "@/lib/references";
import {
  AUTHORS,
  BOOK_DESCRIPTION,
  BOOK_SUBTITLE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

/** Reading orders for different starting points. Chapter numbers only —
 * the URLs are generated, so these cannot point at a page that moved. */
const LEARNING_PATHS: { name: string; forWhom: string; chapters: number[] }[] = [
  {
    name: "Leader evaluating adoption",
    forWhom:
      "No code. What the technology can and cannot do, and what governing it requires.",
    chapters: [1, 4, 9, 17, 18],
  },
  {
    name: "Practitioner applying it to daily work",
    forWhom:
      "Prompting and grounding first, then agents, then your own domain chapter.",
    chapters: [1, 5, 6, 9, 10, 13, 14],
  },
  {
    name: "Builder writing the systems",
    forWhom: "The full hands-on path, every chapter with runnable code.",
    chapters: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
  },
];

// llms.txt (https://llmstxt.org): a concise, markdown map of the site
// for AI crawlers and answer engines. Generated from the same data the
// pages render, so it cannot drift. Content is drawn from the book
// itself — outline, chapter concepts, arguments, and glossary — so an
// engine answering "what does this book say about X" can quote it
// rather than guess.
export const dynamic = "force-static";

export function GET(): Response {
  const fullName = (a: (typeof AUTHORS)[number]) =>
    [a.honorificPrefix, a.name].filter(Boolean).join(" ");

  const authorLine = AUTHORS.map(fullName).join(" and ");

  const authorBios = AUTHORS.map((a) => {
    const credentials = a.honorificSuffix ? `, ${a.honorificSuffix}` : "";
    const role = [a.jobTitle, a.affiliation].filter(Boolean).join(", ");
    return `### ${fullName(a)}${credentials}\n\n${role ? `${role}.\n\n` : ""}${a.bio ?? ""}`;
  }).join("\n\n");

  const outline = OUTLINE.map((part) => {
    const chapters = part.chapters
      .map((ch) => {
        const page = `\n  Chapter page: ${SITE_URL}${chapterPath(ch.number)}`;
        const link = ch.slug
          ? `\n  Runnable code: ${SITE_URL}/code/${ch.slug}`
          : "";
        const domain = domainForChapter(ch.number);
        const domainLine = domain
          ? `\n  Practice domain: ${domain.name} — ${SITE_URL}/actuarial-ai/${domain.slug}`
          : "";
        const related = CONCEPTS.filter((c) =>
          c.chapters.includes(ch.number)
        );
        const conceptLine = related.length
          ? `\n  Concepts: ${related
              .map((c) => `${c.title} (${SITE_URL}/concepts/${c.slug})`)
              .join("; ")}`
          : "";
        const summary = CHAPTER_CONTENT[ch.number]?.summary[0];
        const summaryLine = summary ? `\n  Summary: ${summary}` : "";
        const concepts = (CHAPTER_CONCEPTS[ch.number] ?? [])
          .map((c) => `\n  - ${c}`)
          .join("");
        return `- **Chapter ${ch.number}: ${ch.title}** — ${ch.oneLiner}\n  Case study: ${ch.caseStudy}.${page}${link}${domainLine}${conceptLine}${summaryLine}${concepts}`;
      })
      .join("\n\n");
    return `### Part ${part.roman}: ${part.title} (${part.approach})\n\n${part.blurb}\n\n${chapters}`;
  }).join("\n\n");

  const learningPaths = LEARNING_PATHS.map(
    (path) =>
      `### ${path.name}\n\n${path.forWhom}\n\n${path.chapters
        .map((n) => `${n}. ${SITE_URL}${chapterPath(n)}`)
        .join("\n")}`
  ).join("\n\n");

  const questions = FAQ.map(
    (item) => `- **${item.question}** ${item.answer}`
  ).join("\n");

  const domainPages = DOMAINS.map((d) => {
    const workflows = d.workflows
      .map((w) => `  - ${w.title}: ${w.blurb} Human retains: ${w.humanRetains}.`)
      .join("\n");
    return `- ${SITE_URL}/actuarial-ai/${d.slug} — ${d.name}. ${d.blurb}\n  Covered in Chapter ${d.chapter}; code at ${d.codeSlugs
      .map((s) => `${SITE_URL}/code/${s}`)
      .join(", ")}.\n${workflows}`;
  }).join("\n\n");

  const conceptPages = CONCEPTS.map(
    (c) =>
      `- ${SITE_URL}/concepts/${c.slug} — ${c.title}. ${c.summary}\n  Chapters ${c.chapters.join(
        ", "
      )}; domains ${c.domains.join(", ")}.`
  ).join("\n");

  const references = REFERENCES.map(
    (r) => `- **${r.title}** (${r.publisher}, ${r.jurisdiction}) — ${r.note} ${r.url}`
  ).join("\n");

  const codePages = CHAPTERS.map(
    (c) => `- ${SITE_URL}/code/${c.slug} — Chapter ${c.number}: ${c.title}. ${c.blurb}`
  ).join("\n");

  const glossary = GLOSSARY.map(
    (g) => `- **${g.term}.** ${g.definition}`
  ).join("\n");

  const positions = CORE_POSITIONS.map((p) => `- ${p}`).join("\n");

  const body = `# ${SITE_NAME}: ${BOOK_SUBTITLE}

> ${BOOK_PROMISE}

- Canonical URL: ${SITE_URL}
- Authors: ${authorLine}
- Publisher: ACTEX Learning (first edition, 2026); abridged primer published by the Sri Sathya Sai Institute of Actuaries
- Repository: ${GITHUB_REPO} (MIT licence)
- Scope: ${OUTLINE.length} parts, 18 chapters, ${CHAPTERS.length} chapters with runnable code, ${CONCEPTS.length} concept pages, ${DOMAINS.length} practice domains, ${GLOSSARY.length} glossary terms
- Content licence: this file and the site's chapter summaries may be quoted with attribution to the book and a link to the chapter page.

Companion site for the book *${SITE_NAME}* by ${authorLine}.
${BOOK_DESCRIPTION}

The book's Python examples are built on the Agno agent framework, with
Google Gemini as the default model and Anthropic or OpenAI selectable
through environment variables. Every listing in Parts III to V runs — in
the browser, on this site's server, or in Google Colab.

Written for:
${TARGET_READERS.map((r) => `- ${r}`).join("\n")}

## What this site offers

- Deterministic actuarial tool scripts run editable in the browser
  (Pyodide) — no install, no API key.
- The book's agents run live on a server with their tool calls streamed
  to the page.
- Every code chapter opens directly in Google Colab.

## Questions this site answers

${questions}

## What the book argues

${positions}

## Learning paths

${learningPaths}

## Book outline

Each chapter below lists its own page, its practice domain where it has
one, the concept pages that cover it, and its runnable code. Those four
links are the relationships between every part of this site.

${outline}

## Practice domains

${domainPages}

## Concept pages

${conceptPages}

## Code chapter pages

${codePages}

## Glossary

${glossary}

## Sources and standards

Cited by the book. Jurisdiction-specific; check each against its current
version before relying on it. Full list: ${SITE_URL}/resources

${references}

## About the authors

${authorBios}

Full profiles: ${AUTHORS.map((a) => `${SITE_URL}/authors/${a.slug}`).join(", ")}

## Source code

- Repository: ${GITHUB_REPO}
- Chapter explorer: ${SITE_URL}/code
- Abridged primer: ${SITE_URL}/book/primer
- Frequently asked questions: ${SITE_URL}/faq
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
