import { CHAPTERS } from "@/lib/chapters";
import { GITHUB_REPO } from "@/lib/links";
import { BOOK_PROMISE, OUTLINE, TARGET_READERS } from "@/lib/outline";
import { AUTHORS, SITE_NAME, SITE_URL } from "@/lib/site";

// llms.txt (https://llmstxt.org): a concise, markdown map of the site
// for AI crawlers and answer engines. Generated from the same data the
// pages render, so it cannot drift.
export const dynamic = "force-static";

export function GET(): Response {
  const authors = AUTHORS.map((a) =>
    a.honorificPrefix ? `${a.honorificPrefix} ${a.name}` : a.name
  ).join(" and ");

  const outline = OUTLINE.map((part) => {
    const chapters = part.chapters
      .map((ch) => {
        const link = ch.slug ? ` Runnable code: ${SITE_URL}/code/${ch.slug}` : "";
        return `- Chapter ${ch.number}: ${ch.title} — ${ch.oneLiner}${link}`;
      })
      .join("\n");
    return `### Part ${part.roman}: ${part.title}\n\n${part.blurb}\n\n${chapters}`;
  }).join("\n\n");

  const codePages = CHAPTERS.map(
    (c) => `- ${SITE_URL}/code/${c.slug} — Chapter ${c.number}: ${c.title}`
  ).join("\n");

  const body = `# ${SITE_NAME}

> ${BOOK_PROMISE}

Companion site for the book *${SITE_NAME}* by ${authors}. The book takes
actuaries from AI fundamentals to building, deploying, and governing
agentic AI systems, with runnable Python examples built on the Agno
agent framework (Gemini by default, Anthropic and OpenAI switchable via
environment variables).

Written for:
${TARGET_READERS.map((r) => `- ${r}`).join("\n")}

## What this site offers

- Deterministic actuarial tool scripts run editable in the browser
  (Pyodide) — no install, no API key.
- The book's agents run live on a server with their tool calls streamed
  to the page.
- Every code chapter opens directly in Google Colab.

## Code chapter pages

${codePages}

## Book outline

${outline}

## Source code

- Repository: ${GITHUB_REPO}
- Chapter explorer: ${SITE_URL}/code
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
