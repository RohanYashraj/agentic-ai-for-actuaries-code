import { CHAPTER_CONCEPTS, CORE_POSITIONS } from "@/lib/book";
import { CHAPTERS } from "@/lib/chapters";
import { GLOSSARY } from "@/lib/glossary";
import { GITHUB_REPO } from "@/lib/links";
import { BOOK_PROMISE, OUTLINE, TARGET_READERS } from "@/lib/outline";
import {
  AUTHORS,
  BOOK_DESCRIPTION,
  BOOK_SUBTITLE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

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
        const link = ch.slug
          ? `\n  Runnable code: ${SITE_URL}/code/${ch.slug}`
          : "";
        const concepts = (CHAPTER_CONCEPTS[ch.number] ?? [])
          .map((c) => `\n  - ${c}`)
          .join("");
        return `- **Chapter ${ch.number}: ${ch.title}** — ${ch.oneLiner}\n  Case study: ${ch.caseStudy}.${link}${concepts}`;
      })
      .join("\n\n");
    return `### Part ${part.roman}: ${part.title} (${part.approach})\n\n${part.blurb}\n\n${chapters}`;
  }).join("\n\n");

  const codePages = CHAPTERS.map(
    (c) => `- ${SITE_URL}/code/${c.slug} — Chapter ${c.number}: ${c.title}. ${c.blurb}`
  ).join("\n");

  const glossary = GLOSSARY.map(
    (g) => `- **${g.term}.** ${g.definition}`
  ).join("\n");

  const positions = CORE_POSITIONS.map((p) => `- ${p}`).join("\n");

  const body = `# ${SITE_NAME}: ${BOOK_SUBTITLE}

> ${BOOK_PROMISE}

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

## What the book argues

${positions}

## Book outline

${outline}

## Code chapter pages

${codePages}

## Glossary

${glossary}

## About the authors

${authorBios}

## Source code

- Repository: ${GITHUB_REPO}
- Chapter explorer: ${SITE_URL}/code
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
