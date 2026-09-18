import { AGENT_SCRIPTS } from "@/lib/agents";
import { CHAPTER_CONCEPTS } from "@/lib/book";
import { CHAPTERS } from "@/lib/chapters";
import { DATASETS } from "@/lib/datasets";
import { ACTEX_BOOK_URL, colabUrl, GITHUB_REPO } from "@/lib/links";
import { OUTLINE } from "@/lib/outline";
import { AUTHORS, BOOK_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/** Plain-text map of the site for answer engines. Regenerated from the
 * same data modules the pages render from. */
export function GET() {
  const lines: string[] = [];
  const push = (...l: string[]) => lines.push(...l);

  push(
    `# ${SITE_NAME}: the code companion`,
    "",
    `> Companion site for the book Agentic AI for Actuaries (${AUTHORS.map((a) => a.name).join(" and ")}, ACTEX Learning, first edition 2026). The book is free at ${ACTEX_BOOK_URL}. This site carries the runnable companion code for chapters 9 to 17, the synthetic datasets it uses, and setup instructions.`,
    "",
    `Site: ${SITE_URL}`,
    `Repository: ${GITHUB_REPO} (MIT licence; the book text is not covered)`,
    `Book: ${ACTEX_BOOK_URL}`,
    "",
    "## What the site offers",
    "",
    `- ${SITE_URL}/code: nine chapters of companion code. Tool scripts run editable in the browser on Pyodide; agent scripts run live on the server against Gemini with tool calls streamed; every chapter opens in Colab.`,
    `- ${SITE_URL}/setup: Colab with a free Google AI Studio key, local install with uv, the live runner's limits.`,
    `- ${SITE_URL}/data: the synthetic Meridian Re datasets and which chapter reads each one.`,
    `- ${SITE_URL}/book: what the book covers, where to get it, who wrote it.`,
    "",
    "## Code chapter pages",
    ""
  );
  for (const c of CHAPTERS) {
    push(
      `### Chapter ${c.number}: ${c.title}`,
      `${SITE_URL}/code/${c.slug}`,
      c.blurb,
      ""
    );
    for (const s of c.scripts) {
      const agent = s.agentId
        ? AGENT_SCRIPTS.find((a) => a.id === s.agentId)
        : undefined;
      const mode = s.demoId
        ? "runs in the browser"
        : agent?.runnable
          ? "runs live on the server"
          : "runs in Colab";
      push(`- ${s.file}: ${s.description} (${mode})`);
    }
    const concepts = CHAPTER_CONCEPTS[c.number] ?? [];
    if (concepts.length) push(`Builds: ${concepts.join("; ")}.`);
    push(`Colab: ${colabUrl(c.slug)}`, "");
  }

  push("## Datasets", "", `${SITE_URL}/data`, "");
  for (const d of DATASETS) {
    const users = d.usedBy.map((u) => `chapter ${u}`).join(", ");
    push(
      `- ${d.file}: ${d.summary} Used by ${users || "no chapter script (generated for completeness)"}.`
    );
  }

  push(
    "",
    "## Setup",
    "",
    `${SITE_URL}/setup`,
    "Colab: one notebook per chapter, add GOOGLE_API_KEY as a Colab secret. Local: uv sync, cp .env.example .env, uv run --env-file ../.env python <script>. Live runs on the site: 4 per minute and 75 per day per visitor, 750 per day site-wide, 240 seconds per run.",
    "",
    "## The book",
    "",
    BOOK_DESCRIPTION,
    ""
  );
  for (const part of OUTLINE) {
    push(`Part ${part.roman}: ${part.title}`);
    for (const ch of part.chapters) {
      push(
        `- Chapter ${ch.number}: ${ch.title}${ch.slug ? ` (code: ${SITE_URL}/code/${ch.slug})` : ""}`
      );
    }
    push("");
  }

  push("## Authors", "");
  for (const a of AUTHORS) {
    push(
      `- ${a.name}${a.honorificSuffix ? `, ${a.honorificSuffix}` : ""}: ${a.bio ?? ""}`
    );
  }
  push(
    "",
    "In collaboration with the Sri Sathya Sai Institute of Actuaries (https://sssia.org).",
    ""
  );

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
