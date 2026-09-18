# Code-Companion Rebrand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the site at `web/` into the light-themed code companion for the published book, with a cover-navy hero that announces the launch, five visible nav items, two new pages (Setup, Data), and permanent redirects for every retired book-prose route.

**Architecture:** Next 16 App Router site, static pages built from data modules in `web/lib`. This plan deletes eight prose routes and their data, adds `/setup` and `/data`, rewrites the token layer in `globals.css` to a light palette drawn from the cover, and restyles the kept pages by a mechanical class map plus targeted rewrites of the home, code, and book pages.

**Tech Stack:** Next 16.3.1, React 19, Tailwind v4, shadcn, GSAP (matchMedia-gated), Phosphor icons, FastAPI server in `server/` (Vercel Python function). No JS test suite; the gate is `npm run build` in `web/` plus two Node check scripts and a browser pass.

**Spec:** Part A of this file. Task 1 copies it to `docs/superpowers/specs/2026-09-18-code-companion-rebrand-design.md` and this plan to `docs/superpowers/plans/2026-09-18-code-companion-rebrand.md`.

**Branch:** `site/rebrand-2026-09`, already created from `main`.

## Global Constraints

- Read `web/node_modules/next/dist/docs/` before touching `next.config.ts`, routing, or metadata files (per `web/AGENTS.md`). Next 16 differs from training data.
- Every internal `href="/..."` in `web/app` and `web/components` must resolve to a real page; `scripts/check_site_graph.mjs` runs in `prebuild` and fails the build otherwise. It does not scan `web/lib`, object-literal `href:` keys, or redirects, so those are covered by the new `scripts/check_redirects.mjs` (Task 5) and grep assertions.
- Gold is never text on paper. Text-safe gold is the `gold-ink` token. Body text is `ink` on `paper`.
- CTA labels, one per intent: `Get the book, free` (ACTEX), `Run the code` (/code), `Run it here` (in-page), `Open in Colab`, `View on GitHub`.
- Light theme only. No `.dark` block, no `dark:` variants added.
- GSAP is the only animation library; every tween sits under `gsap.matchMedia()` with `(prefers-reduced-motion: no-preference)`.
- The env var is `GOOGLE_API_KEY` (never `GEMINI_API_KEY`). The mortality table is "IALM 2012-14 ULP" everywhere.
- Commit after every task. End each commit message with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Work from `web/` for npm commands; scripts are run from the repo root.

---

# Part A: Design spec

## A1. Why

The book *Agentic AI for Actuaries* (Mudigonda & Gupta, ACTEX Learning, first edition 2026) is published and free at `https://www.actexlearning.com/textbooks/agentic-ai-for-actuaries`. The site was built before release, so it carries a "read the book here" layer: chapter summaries, a primer with an email waitlist, concept essays, domain essays, a glossary, references, FAQ, and author pages. It is also a single dark navy theme copied from the cover, with grey-on-navy body text that reads as heavy.

Decisions taken 2026-09-18 (this reverses the August 2026 "navy stays locked" decision deliberately):
1. The site becomes **the code companion**. Book prose goes; what helps a reader run, understand, or extend the companion code stays.
2. **Light pages, cover-dark hero.** Warm white paper, cover navy as ink, cover gold as the single pop accent, cover square-grid as the house motif.
3. Hero copy announces the launch plainly. The marquee strip and spinning seal go.
4. Five visible nav items, nothing hidden in a mobile-only list.
5. Retired routes get permanent redirects.

## A2. Information architecture

| Route | Status | Purpose |
|---|---|---|
| `/` | rebuilt | Navy hero (announcement + cover + grid motif), nine code chapters grid, three ways to run, one live agent demo, about-the-book block, authors in brief |
| `/code` | kept, restyled | Index of ch09–ch17 |
| `/code/[chapter]` | kept, restyled | Scripts per chapter; gains a "Part III · Agentic architecture" line and a domain tag |
| `/setup` | **new** | Colab + free key, local install with uv, live-runner limits, the code FAQ answers |
| `/data` | **new** | Every file in `data/`, what it holds, which chapters read it |
| `/book` | rebuilt | Cover, five parts with chapter titles only (code chapters link to `/code/chNN`), ACTEX link, two author bios, SSSIA credit |
| `/llms.txt`, `/sitemap.xml`, `/robots.txt` | kept, regenerated | |

Permanent (308) redirects in `next.config.ts`:

| Source | Destination |
|---|---|
| `/book/chapters/:chapter` | `/book` |
| `/book/primer` | `/book` |
| `/concepts`, `/concepts/:slug` | `/code` |
| `/actuarial-ai`, `/actuarial-ai/:slug` | `/code` |
| `/glossary` | `/book` |
| `/resources` | `/book` |
| `/faq` | `/setup` |
| `/authors`, `/authors/:slug` | `/book` |

## A3. Navigation

Header: wordmark · **Run the code** `/code` · **Setup** `/setup` · **Data** `/data` · **The book** `/book` · GitHub icon · gold pill **Get the book** (ACTEX, external). All five visible from `md`; the mobile sheet lists the same five plus GitHub. Footer: three columns (Code: /code, /setup, /data, GitHub · Book: /book, ACTEX, SSSIA · Licence line).

## A4. Copy

Hero: eyebrow `First edition · Out now`; h1 `The book is out. The code is here.`; lede `Agentic AI for Actuaries is published by ACTEX Learning and free to read. This site is its companion: every listing from chapters 9 to 17, runnable in your browser, live on our server, or in Colab.`; primary `Get the book, free`; secondary `Run the code`; publisher logo link beneath.

Home section headings: `Nine chapters of runnable code` · `Three ways to run it` · `Watch an agent work` · `About the book` · `The authors`.

## A5. Visual system

Tokens (the new `:root` in `globals.css`):

```
--paper #fbfaf6 · --paper-2 #f3f1ea · --ink #152238 · --ink-2 #0d1626 · --slate #5b6b82
--line #d9d5c9 · --gold #e4a531 · --gold-deep #c98d1b · --gold-ink #8a5c0a · --gold-tint #fbf1d8
--paper-dim #b9c0cc (muted text on ink-2) · --run-ok #2f8f5b · --run-err #c4472e
```

Contrast: ink on paper 14.9:1; slate on paper 5.6:1; gold-ink on paper 6.4:1; ink-2 on gold 9.6:1; gold on ink-2 7.9:1 (hero eyebrow only); paper-dim on ink-2 9.8:1.

Code panels (CodeMirror, agent output, run output) stay dark on `ink-2`, so the editor theme is untouched and only its comment changes.

Motif: `<GridMotif>` inline SVG of the cover's square grid (7×8 tiles, slate and gold at fixed positions). Large at low opacity behind the hero, small as a section ornament, and 3×3 as `app/icon.svg`.

Fonts unchanged: Source Serif 4 (headings), IBM Plex Sans (body), IBM Plex Mono (labels, code).

## A6. Verification

`npm run build` in `web/` (runs demos, registry export, backend bundle, `check_site_graph.mjs`, and after Task 5 `check_redirects.mjs`), grep assertions listed per task, and a browser pass at phone and desktop widths through the `book-site` launch config with `npm run dev:all`.

---

# Part B: Task plan

## File map

Create:
- `docs/superpowers/specs/2026-09-18-code-companion-rebrand-design.md`, `docs/superpowers/plans/2026-09-18-code-companion-rebrand.md`
- `scripts/check_redirects.mjs`
- `web/components/grid-motif.tsx`, `web/app/icon.svg`
- `web/lib/datasets.ts`, `web/app/setup/page.tsx`, `web/app/data/page.tsx`

Delete:
- routes: `web/app/book/chapters/`, `web/app/book/primer/`, `web/app/concepts/`, `web/app/actuarial-ai/`, `web/app/glossary/`, `web/app/resources/`, `web/app/faq/`, `web/app/authors/`
- components: `next-step.tsx`, `fact-section.tsx`, `glossary-list.tsx`, `notify-form.tsx`, `retains-rule.tsx`, `launch-seal.tsx`, `part-accordion.tsx`, `stat-value.tsx`, `ui/card.tsx`, `ui/separator.tsx`, `ui/skeleton.tsx`
- lib: `chapter-content.ts`, `concepts.ts`, `domains.ts`, `glossary.ts`, `references.ts`, `faq.ts`
- server: `server/waitlist.py`, `scripts/export_waitlist.py`
- public: `favicon.png`

Modify:
- `web/next.config.ts` (redirects), `web/package.json` (prebuild)
- `web/lib/{routes,graph,seo,outline,book,chapters,site,links}.ts`
- `web/app/{layout,page,globals.css,not-found,error}.tsx`, `web/app/{book,code,code/[chapter]}/page.tsx`, `web/app/llms.txt/route.ts`
- `web/components/{site-header,site-footer,breadcrumbs,related-links,script-card,agent-runner,demo-runner,run-output,code-view}.tsx`, `web/components/motion/hero-intro.tsx`
- `server/main.py`, `README.md`, `scripts/demos.config.json`, `server/registry.py`

---

### Task 1: Land the spec and plan in the repo

**Files:**
- Create: `docs/superpowers/specs/2026-09-18-code-companion-rebrand-design.md`
- Create: `docs/superpowers/plans/2026-09-18-code-companion-rebrand.md`

- [ ] **Step 1: Copy Part A into the spec file** with a one-line header `# Code-companion rebrand: design (2026-09-18)`.
- [ ] **Step 2: Copy this whole file into the plan file**, unchanged.
- [ ] **Step 3: Commit**

```bash
git add docs/superpowers
git commit -m "docs: spec and plan for the code-companion rebrand

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Retire the book-prose routes and add redirects

The site must still build at the end of this task, so kept pages get the minimum edits that remove dead imports and dead hrefs. The visual restyle comes later.

**Files:**
- Delete: the eight route directories, the five delete-only components, `web/lib/{chapter-content,concepts,domains,glossary,references,faq}.ts`, `web/public/author-*.{jpeg,webp}` stay (Task 13 uses them on `/book`).
- Modify: `web/next.config.ts`, `web/lib/routes.ts`, `web/lib/graph.ts`, `web/lib/seo.ts`, `web/lib/outline.ts`, `web/lib/book.ts`, `web/lib/chapters.ts`, `web/lib/site.ts`, `web/app/page.tsx`, `web/app/book/page.tsx`, `web/app/code/page.tsx`, `web/app/code/[chapter]/page.tsx`, `web/components/site-header.tsx`, `web/components/site-footer.tsx`, `web/app/llms.txt/route.ts` (stub only; Task 4 rewrites it)

**Interfaces produced:**
- `web/lib/chapters.ts`: `Chapter` gains `domain: string` and `part: "III" | "IV" | "V"`.
- `web/lib/outline.ts`: `chapterPath` and `prevNextChapter` removed; `getPartOf(n)` kept.
- `web/lib/graph.ts`: only `relatedForCodeChapter(slug)` remains.
- `web/lib/routes.ts`: `ROUTES` lists `/`, `/book`, `/code`, `/code/*`, `/setup`, `/data`; `hasRoute(path)` unchanged.

- [ ] **Step 1: Delete routes, components, lib, server waitlist client**

```bash
cd web
git rm -r app/book/chapters app/book/primer app/concepts app/actuarial-ai app/glossary app/resources app/faq app/authors
git rm components/next-step.tsx components/fact-section.tsx components/glossary-list.tsx components/notify-form.tsx components/retains-rule.tsx
git rm lib/chapter-content.ts lib/concepts.ts lib/domains.ts lib/glossary.ts lib/references.ts lib/faq.ts
git rm components/ui/card.tsx components/ui/separator.tsx components/ui/skeleton.tsx
```

- [ ] **Step 2: Add redirects to `web/next.config.ts`** inside `nextConfig`, next to `rewrites()`:

```ts
  async redirects() {
    // Book-prose routes retired 2026-09; the book itself lives at ACTEX now.
    const to = (source: string, destination: string) => ({
      source,
      destination,
      permanent: true,
    });
    return [
      to("/book/chapters/:chapter", "/book"),
      to("/book/primer", "/book"),
      to("/concepts", "/code"),
      to("/concepts/:slug", "/code"),
      to("/actuarial-ai", "/code"),
      to("/actuarial-ai/:slug", "/code"),
      to("/glossary", "/book"),
      to("/resources", "/book"),
      to("/faq", "/setup"),
      to("/authors", "/book"),
      to("/authors/:slug", "/book"),
    ];
  },
```

- [ ] **Step 3: Rewrite `web/lib/routes.ts`**

```ts
/** The site's route registry. Every indexable page is declared here once;
 * the sitemap is generated from it, and `hasRoute` lets the related-links
 * rail drop a link whose target does not exist. */

import { CHAPTERS } from "./chapters";

export type SiteRoute = {
  path: string;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
};

export const ROUTES: SiteRoute[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/code", changeFrequency: "weekly", priority: 0.9 },
  ...CHAPTERS.map((c) => ({
    path: `/code/${c.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  })),
  { path: "/setup", changeFrequency: "monthly", priority: 0.7 },
  { path: "/data", changeFrequency: "monthly", priority: 0.7 },
  { path: "/book", changeFrequency: "monthly", priority: 0.7 },
];

const PATHS = new Set(ROUTES.map((r) => r.path));

export function hasRoute(path: string): boolean {
  return PATHS.has(path.split(/[#?]/)[0]);
}
```

(Keep the existing `hasRoute` body if it already strips `#`/`?`; the behaviour above is the contract.)

- [ ] **Step 4: Extend `Chapter` in `web/lib/chapters.ts`**. Add to the interface:

```ts
  /** Where the chapter sits in the book. */
  part: "III" | "IV" | "V";
  /** The practice area the chapter's code serves; a label, not a route. */
  domain: string;
```

and to each entry: ch09–ch12 `part: "III", domain: "Agentic architecture"`; ch13 `part: "IV", domain: "Pricing and underwriting"`; ch14 `part: "IV", domain: "Reserving and claims"`; ch15 `part: "IV", domain: "Life, health and pensions"`; ch16 `part: "IV", domain: "Risk and compliance"`; ch17 `part: "V", domain: "Production and governance"`. Also fix ch10's script description: `IALM 2012-14 ULT` → `IALM 2012-14 ULP`.

- [ ] **Step 5: Trim `web/lib/outline.ts`**. Delete `chapterPath`, `prevNextChapter`, and the two comment lines above `chapterPath`. Update the file header comment to: `/** The book's structure: 5 parts, 18 chapters. Chapters 9-17 carry a slug for their /code page. */`. Keep everything else.

- [ ] **Step 6: Trim `web/lib/graph.ts`** to one function, dropping the concept/domain/glossary imports:

```ts
import type { RelatedGroup } from "@/components/related-links";
import { CHAPTERS } from "./chapters";
import { getPartOf } from "./outline";

/** Related-links rail for /code/[chapter]: neighbouring code chapters,
 * plus setup and data. */
export function relatedForCodeChapter(slug: string): RelatedGroup[] {
  const i = CHAPTERS.findIndex((c) => c.slug === slug);
  if (i === -1) return [];
  const chapter = CHAPTERS[i];
  const part = getPartOf(chapter.number);
  const neighbours = [CHAPTERS[i - 1], CHAPTERS[i + 1]].filter(Boolean);
  return [
    {
      title: "Next in the code",
      links: neighbours.map((c) => ({
        label: `Chapter ${c.number}: ${c.title}`,
        href: `/code/${c.slug}`,
      })),
    },
    {
      title: "Run it yourself",
      links: [
        { label: "Setup", href: "/setup", note: "Colab, local install, limits" },
        { label: "Data", href: "/data", note: "The synthetic datasets" },
      ],
    },
    {
      title: "In the book",
      links: [
        {
          label: part ? `Part ${part.roman}: ${part.title}` : "The book",
          href: "/book",
        },
      ],
    },
  ];
}
```

- [ ] **Step 7: Trim `web/lib/seo.ts`**: remove `primer` from `ID`, remove `authorPath` and `slugify`, and shorten the header comment to drop "the primer". Trim `web/lib/book.ts` to export only `CHAPTER_CONCEPTS` (delete `CORE_POSITIONS`). In `web/lib/site.ts` delete `getAuthor` (keep `AUTHORS`).

- [ ] **Step 8: Minimum edits to kept pages so they compile**
  - `web/app/page.tsx`: remove imports of `chapterPath`, `PartAccordion`, `LaunchSeal`; replace the `href="/book/primer"` link text with a `/book` link; replace `href={`/authors/${author.slug}`}` with `href="/book#authors"`; replace the `<PartAccordion .../>` block with a `<Link href="/book">Browse the outline</Link>`; delete the `<LaunchSeal />` element. (This page is fully rewritten in Task 9; do the least here.)
  - `web/app/book/page.tsx`: remove `chapterPath` import; the JSON-LD `url` for each chapter becomes `ch.slug ? absolute(`/code/${ch.slug}`) : absolute("/book")`; the two `/book/primer` links and the "Start with Chapter 1" button go; chapter rows render as `<li>` with a `<Link href={`/code/${ch.slug}`}>` only when `ch.slug` exists, plain text otherwise. (Fully rewritten in Task 13.)
  - `web/app/code/page.tsx`: drop `DOMAINS` and `chapterPath` imports; `domain` becomes `chapter.domain`; delete the "Read the chapter" link; in `RelatedLinks` replace the two groups with `{ title: "Run it yourself", links: [{ label: "Setup", href: "/setup" }, { label: "Data", href: "/data" }] }` and `{ title: "The book", links: [{ label: "About the book", href: "/book" }] }`.
  - `web/app/code/[chapter]/page.tsx`: no change (imports `relatedForCodeChapter` and `CHAPTER_CONCEPTS`, both still exported).
  - `web/components/site-header.tsx` and `site-footer.tsx`: replace the `NAV` / `FOOTER_LINKS` arrays with entries for `/code`, `/setup`, `/data`, `/book` only, and delete the now-unused icon imports. (Both are rewritten in Task 8.)
  - `web/app/llms.txt/route.ts`: replace the body with a stub that returns the header lines and `Code chapter pages` only, importing nothing from the deleted modules. Task 4 writes the real file.

- [ ] **Step 9: Build**

```bash
cd web && npm run build
```
Expected: `check_site_graph` passes, `next build` succeeds. If `tsc` complains about `agentsForChapter` or other now-unused exports, leave them; unused exports are not errors.

- [ ] **Step 10: Grep assertions**

```bash
cd web && grep -rnE '"/(concepts|glossary|actuarial-ai|faq|resources|authors|book/primer|book/chapters)' app components lib ; echo "exit $? (1 = clean)"
```
Expected: no matches.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "Retire the book-prose routes; redirect them to /book, /code and /setup

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Remove the waitlist end to end

**Files:**
- Delete: `server/waitlist.py`, `scripts/export_waitlist.py`
- Modify: `server/main.py`, `README.md`

- [ ] **Step 1: Delete files**

```bash
git rm server/waitlist.py scripts/export_waitlist.py
```

- [ ] **Step 2: Edit `server/main.py`**: change `from . import ratelimit, waitlist` to `from . import ratelimit`; delete the whole `POST /api/py/waitlist` handler (the function decorated with the waitlist route, lines ~152–191). Leave `ratelimit.store()` alone: rate limiting still uses Redis.

- [ ] **Step 3: Edit `README.md`**: in the env-var table change `Durable rate-limit counters and waitlist storage` to `Durable rate-limit counters`; delete the waitlist export line (`scripts/export_waitlist.py`) and its sentence.

- [ ] **Step 4: Verify the server imports and serves**

```bash
cd /Users/rohanyashraj/Documents/GitHub/agentic-ai-for-actuaries-code && uv run python -c "from server import main; print([r.path for r in main.app.routes if r.path.startswith('/api')])"
```
Expected: `['/api/py/health', '/api/py/agents', '/api/py/limits', '/api/py/agents/{agent_id}/run']` (order may differ).

```bash
grep -rn waitlist server scripts web/components README.md ; echo "exit $?"
```
Expected: exit 1 (no matches).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Remove the primer waitlist: endpoint, store, export script and copy

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Rewrite llms.txt for the code companion

**Files:**
- Modify: `web/app/llms.txt/route.ts`
- Depends on: `web/lib/datasets.ts` from Task 12. **Execute Task 12 Step 1 (the data module only) before this task**, or write this task after Task 12. The plan lists it here because it closes the route retirement; run order is 2, 3, 12-step-1, 4, 5, ...

- [ ] **Step 1: Write the route**

```ts
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
    push(`### Chapter ${c.number}: ${c.title}`, `${SITE_URL}/code/${c.slug}`, c.blurb, "");
    for (const s of c.scripts) {
      const agent = s.agentId ? AGENT_SCRIPTS.find((a) => a.id === s.agentId) : undefined;
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
    push(`- ${d.file}: ${d.summary} Used by ${d.usedBy.map((u) => `chapter ${u}`).join(", ") || "no chapter script (generated for completeness)"}.`);
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
      push(`- Chapter ${ch.number}: ${ch.title}${ch.slug ? ` (code: ${SITE_URL}/code/${ch.slug})` : ""}`);
    }
    push("");
  }

  push("## Authors", "");
  for (const a of AUTHORS) push(`- ${a.name}${a.honorificSuffix ? `, ${a.honorificSuffix}` : ""}: ${a.bio ?? ""}`);
  push("", "In collaboration with the Sri Sathya Sai Institute of Actuaries (https://sssia.org).", "");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
```

- [ ] **Step 2: Build and inspect**

```bash
cd web && npm run build && curl -s http://localhost:3000/llms.txt | head -40
```
(Run the curl against `npm run dev` if a server is not up.) Expected: the header, nine chapter blocks, datasets, setup, book outline, authors. No `/concepts`, `/glossary`, `/authors/` strings.

- [ ] **Step 3: Commit**

```bash
git add web/app/llms.txt/route.ts
git commit -m "llms.txt describes the code companion: chapters, datasets, setup, the book

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Redirect check in the build

`check_site_graph.mjs` does not know about redirects. This script asserts the retired paths redirect and that no page still links to them.

**Files:**
- Create: `scripts/check_redirects.mjs`
- Modify: `web/package.json` (prebuild)

- [ ] **Step 1: Write the script**

```js
#!/usr/bin/env node
/**
 * Every route retired in the 2026-09 rebrand must redirect, permanently,
 * to a page that exists. Node 24 strips the types from next.config.ts.
 *
 * Run from anywhere:  node scripts/check_redirects.mjs
 */
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const config = (await import(pathToFileURL(join(REPO, "web/next.config.ts")).href)).default;
const rules = await config.redirects();

const RETIRED = [
  "/book/chapters/01",
  "/book/chapters/17",
  "/book/primer",
  "/concepts",
  "/concepts/agentic-ai",
  "/actuarial-ai",
  "/actuarial-ai/pricing",
  "/glossary",
  "/resources",
  "/faq",
  "/authors",
  "/authors/rohan-yashraj-gupta",
];

function toRegex(source) {
  return new RegExp("^" + source.replace(/:[A-Za-z0-9_]+/g, "[^/]+") + "$");
}

let failures = 0;
for (const path of RETIRED) {
  const hits = rules.filter((r) => toRegex(r.source).test(path));
  if (hits.length !== 1) {
    console.error(`✗ ${path}: ${hits.length} matching redirects`);
    failures++;
    continue;
  }
  const { destination, permanent } = hits[0];
  const page = join(REPO, "web/app", destination === "/" ? "" : destination, "page.tsx");
  if (!permanent || !existsSync(page)) {
    console.error(`✗ ${path} → ${destination}: ${permanent ? "target page missing" : "not permanent"}`);
    failures++;
  }
}
if (failures) process.exit(1);
console.log(`✓ ${RETIRED.length} retired paths redirect permanently to live pages`);
```

- [ ] **Step 2: Run it**

```bash
node scripts/check_redirects.mjs
```
Expected: `✓ 12 retired paths redirect permanently to live pages`. `/setup` does not exist yet, so `/faq` fails until Task 11; **temporarily** expect one failure and re-run after Task 11. To keep the build green now, add the script to `prebuild` only in Task 11 Step 6.

- [ ] **Step 3: Commit**

```bash
git add scripts/check_redirects.mjs
git commit -m "Add a redirect check for the retired book-prose routes

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Light token layer and mechanical class migration

**Files:**
- Modify: `web/app/globals.css`, `web/lib/editor-theme.ts` (comment only), every `.tsx` under `web/app` and `web/components` that uses `navy-`, `cream-`, or `gold-` classes

**Interfaces produced:** Tailwind colour utilities `paper`, `paper-2`, `paper-dim`, `ink`, `ink-2`, `slate`, `line`, `gold`, `gold-deep`, `gold-ink`, `gold-tint`, `run-ok`, `run-err`.

- [ ] **Step 1: Replace the token blocks in `globals.css`**. Delete line 5 (`@custom-variant dark ...`). Replace the `@theme inline` colour aliases for `navy-*`, `cream-*`, `gold-*` with:

```css
  --color-paper: var(--paper);
  --color-paper-2: var(--paper-2);
  --color-paper-dim: var(--paper-dim);
  --color-ink: var(--ink);
  --color-ink-2: var(--ink-2);
  --color-slate: var(--slate);
  --color-line: var(--line);
  --color-gold: var(--gold);
  --color-gold-deep: var(--gold-deep);
  --color-gold-ink: var(--gold-ink);
  --color-gold-tint: var(--gold-tint);
  --color-run-ok: var(--run-ok);
  --color-run-err: var(--run-err);
```

Replace the whole first `:root { ... }` block with:

```css
:root {
  --paper: #fbfaf6;
  --paper-2: #f3f1ea;
  --paper-dim: #b9c0cc;
  --ink: #152238;
  --ink-2: #0d1626;
  --slate: #5b6b82;
  --line: #d9d5c9;
  --gold: #e4a531;
  --gold-deep: #c98d1b;
  --gold-ink: #8a5c0a;
  --gold-tint: #fbf1d8;
  --run-ok: #2f8f5b;
  --run-err: #c4472e;

  --background: var(--paper);
  --foreground: var(--ink);
  --card: #ffffff;
  --card-foreground: var(--ink);
  --popover: #ffffff;
  --popover-foreground: var(--ink);
  --primary: var(--gold);
  --primary-foreground: var(--ink-2);
  --secondary: var(--paper-2);
  --secondary-foreground: var(--ink);
  --muted: var(--paper-2);
  --muted-foreground: var(--slate);
  --accent: var(--gold-tint);
  --accent-foreground: var(--ink);
  --destructive: var(--run-err);
  --border: var(--line);
  --input: var(--line);
  --ring: var(--gold-deep);
  --radius: 0.25rem;
  --sidebar: var(--paper-2);
  --sidebar-foreground: var(--ink);
  --sidebar-primary: var(--gold);
  --sidebar-primary-foreground: var(--ink-2);
  --sidebar-accent: var(--gold-tint);
  --sidebar-accent-foreground: var(--ink);
  --sidebar-border: var(--line);
  --sidebar-ring: var(--gold-deep);
}
```

Delete the second `:root` block (`--launch*`). In `@layer base`: `color-scheme: dark` → `light`; `::selection` background → `rgba(228, 165, 49, 0.35)`; scrollbar `var(--navy-700)` → `var(--line)` and the hover `#3a5074` → `#c5c0b2`; `h1, h2, h3 { @apply font-serif text-cream-100; }` → `text-ink`. In `@utility label-mono`: `color: var(--gold-400)` → `var(--gold-ink)`.

Delete these blocks entirely: `.launch-strip*`, `@keyframes launch-marquee`, `.launch-cta*`, `@keyframes launch-halo`, `.launch-publisher*`, `.launch-url*`, `.launch-seal*`, `@keyframes launch-turn`, and their entries in the reduced-motion block. Keep `.book-cover`, `.book-glow` (Task 9 restyles them), `.agent-prose`, `.cm-editor`.

In `.agent-prose` and `.cm-editor` rules, replace `var(--navy-950)` with `var(--ink-2)`, `var(--gold-400)` with `var(--gold)`, and any `cream` references with `var(--paper)`; these render inside dark panels.

- [ ] **Step 2: Mechanical class map across `web/app` and `web/components`**. Apply in this order with `sed -i ''` on macOS (or perl), one expression each, over `find app components -name '*.tsx'`:

| From | To |
|---|---|
| `text-cream-100`, `text-cream-200`, `text-cream-300` | `text-ink` |
| `text-cream-400` | `text-slate` |
| `text-gold-300/70` | `text-gold-ink/70` |
| `text-gold-300`, `text-gold-400` | `text-gold-ink` |
| `decoration-gold-400` | `decoration-gold` |
| `outline-gold-400` | `outline-gold-deep` |
| `border-gold-400` (with or without `/NN`) | `border-gold` (keep the `/NN`) |
| `bg-gold-400` (with or without `/NN`) | `bg-gold` (keep `/NN`) |
| `bg-navy-950` (with or without `/NN`) | `bg-ink-2` (keep `/NN`) |
| `bg-navy-900` (with or without `/NN`) | `bg-paper` (keep `/NN`) |
| `bg-navy-800` (with or without `/NN`) | `bg-paper-2` (keep `/NN`) |
| `marker:text-gold-400` | `marker:text-gold` |

- [ ] **Step 3: Fix the dark panels by hand.** In `components/agent-runner.tsx`, `components/demo-runner.tsx`, `components/run-output.tsx`, `components/code-view.tsx`, any element rendered inside a `bg-ink-2` container that now reads `text-ink` or `text-slate` must become `text-paper` / `text-paper-dim`, and `text-gold-ink` inside those panels becomes `text-gold`. Also `border-border` on those dark panels becomes `border-paper/15`. Open each file, find the outermost `bg-ink-2`, and walk its children.

- [ ] **Step 4: Editor theme comment.** In `web/lib/editor-theme.ts` change the doc comment to `/** Code panels stay dark on ink-2 so the listing reads like a terminal on the light page. */`. Values unchanged.

- [ ] **Step 5: Build and grep**

```bash
cd web && npm run build && grep -rnE '(navy|cream)-[0-9]|gold-(300|400|500)|--launch' app components lib ; echo "exit $?"
```
Expected: build passes, grep exit 1.

- [ ] **Step 6: Browser check.** With `book-site` running, open `/code/ch10`. Page is light with navy text; the code panel and run output are dark with light text; the gold "Run it here" button has navy text. Take a screenshot for the commit note.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Light paper theme from the cover: ink, slate, gold tokens replace the navy ledger

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: The grid motif and the favicon

**Files:**
- Create: `web/components/grid-motif.tsx`, `web/app/icon.svg`
- Delete: `web/public/favicon.png`
- Modify: `web/app/layout.tsx` (remove `icons`)

**Interfaces produced:** `<GridMotif tone="light" | "dark" tile={number} className={string} />`, `aria-hidden`.

- [ ] **Step 1: Write the component**

```tsx
/** The cover's square grid, drawn as an inline SVG. Fixed pattern so it is
 * the same mark everywhere: slate tiles with a scatter of gold. `tone`
 * picks the slate value for a light or a dark background. */
const PATTERN = [
  "sssgsss",
  "ssssgss",
  "gssssgs",
  "sgsssss",
  "ssgssss",
  "sssssgs",
  "gsssgss",
  "ssgssgs",
];

export function GridMotif({
  tone = "light",
  tile = 14,
  gap = 4,
  rows = PATTERN.length,
  className,
}: {
  tone?: "light" | "dark";
  tile?: number;
  gap?: number;
  rows?: number;
  className?: string;
}) {
  const cols = PATTERN[0].length;
  const step = tile + gap;
  const slate = tone === "dark" ? "#2a3d5e" : "#d9d5c9";
  const gold = "#e4a531";
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${cols * step - gap} ${rows * step - gap}`}
      width={cols * step - gap}
      height={rows * step - gap}
      className={className}
    >
      {PATTERN.slice(0, rows).flatMap((row, y) =>
        [...row].map((cell, x) => (
          <rect
            key={`${x}-${y}`}
            x={x * step}
            y={y * step}
            width={tile}
            height={tile}
            rx={1.5}
            fill={cell === "g" ? gold : slate}
          />
        ))
      )}
    </svg>
  );
}
```

- [ ] **Step 2: Write `web/app/icon.svg`** (Next serves an `app/icon.svg` as the favicon automatically; read `node_modules/next/dist/docs/` on metadata files to confirm the name):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#0d1626"/><g><rect x="5" y="5" width="6" height="6" rx="1" fill="#2a3d5e"/><rect x="13" y="5" width="6" height="6" rx="1" fill="#e4a531"/><rect x="21" y="5" width="6" height="6" rx="1" fill="#2a3d5e"/><rect x="5" y="13" width="6" height="6" rx="1" fill="#2a3d5e"/><rect x="13" y="13" width="6" height="6" rx="1" fill="#2a3d5e"/><rect x="21" y="13" width="6" height="6" rx="1" fill="#e4a531"/><rect x="5" y="21" width="6" height="6" rx="1" fill="#e4a531"/><rect x="13" y="21" width="6" height="6" rx="1" fill="#2a3d5e"/><rect x="21" y="21" width="6" height="6" rx="1" fill="#2a3d5e"/></g></svg>
```

- [ ] **Step 3:** `git rm web/public/favicon.png`; in `layout.tsx` delete the `icons: { icon: "/favicon.png" }` line.

- [ ] **Step 4: Build; open `/` and confirm the tab icon is the grid.** `npm run build` passes; `curl -sI localhost:3000/icon.svg` returns 200.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add the cover grid as a component and as the favicon

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8: Header and footer

**Files:**
- Modify: `web/components/site-header.tsx`, `web/components/site-footer.tsx`

- [ ] **Step 1: Rewrite the header's data and bar.** Replace `NAV` with:

```tsx
const NAV: NavItem[] = [
  { href: "/code", label: "Run the code", icon: Terminal, blurb: "Nine chapters, three ways to run" },
  { href: "/setup", label: "Setup", icon: Wrench, blurb: "Colab, local install, limits" },
  { href: "/data", label: "Data", icon: Table, blurb: "The synthetic datasets" },
  { href: "/book", label: "The book", icon: BookOpenText, blurb: "Free from ACTEX Learning" },
];
```

Import `Wrench`, `Table`, `Terminal`, `BookOpenText`, `GithubLogo`, `List`, `X`, `ArrowUpRight` from `@phosphor-icons/react`; drop the others. Remove the `mobileOnly` field and `barLinks` filter (map `NAV` directly). Header classes: sticky bar `bg-paper/85 backdrop-blur-xl` once scrolled, `border-line`; wordmark `font-serif text-ink` with `for Actuaries` in `text-gold-ink`; active link `bg-gold-tint text-ink`, idle `text-slate hover:bg-paper-2 hover:text-ink`. Replace the gold "Run the code" pill with:

```tsx
<a
  href={ACTEX_BOOK_URL}
  target="_blank"
  rel="noreferrer"
  className="hidden h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-gold px-3.5 text-sm font-medium text-ink-2 transition-colors hover:bg-gold-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep sm:inline-flex"
>
  <BookOpenText size={16} weight="bold" aria-hidden="true" />
  Get the book
  <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
</a>
```

Import `ACTEX_BOOK_URL` from `@/lib/links`. The mobile sheet: `bg-paper/97 border-line`, first row is the same ACTEX link styled `bg-gold text-ink-2`, then the four `NAV` rows and the GitHub row; row icons `text-gold-ink` when active, `text-slate` otherwise.

- [ ] **Step 2: Rewrite the footer's data.**

```tsx
const FOOTER_LINKS = [
  {
    title: "Code",
    links: [
      { label: "Run the code", href: "/code" },
      { label: "Setup", href: "/setup" },
      { label: "Data", href: "/data" },
      { label: "GitHub", href: GITHUB_REPO, external: true },
    ],
  },
  {
    title: "Book",
    links: [
      { label: "About the book", href: "/book" },
      { label: "Get it free at ACTEX", href: ACTEX_BOOK_URL, external: true },
      { label: "Sri Sathya Sai Institute of Actuaries", href: "https://sssia.org", external: true },
    ],
  },
];
```

Footer becomes `bg-ink-2 text-paper-dim` with headings in `label-mono` overridden to `text-gold` (add `className="label-mono text-gold"`), links `text-paper hover:text-gold`. Bottom bar: `Companion code for Agentic AI for Actuaries. Code is MIT licensed; the book text is © 2026 Satya Sai Mudigonda and Rohan Yashraj Gupta.` Add a small `<GridMotif tone="dark" tile={8} gap={3} rows={3} />` at the top-right of the footer container as an ornament.

- [ ] **Step 3: Build, then check both widths.** Desktop: five links plus GitHub icon plus gold pill all visible at 1024px. Phone (375px): menu opens, lists ACTEX row, four routes, GitHub; Escape closes it. Screenshot both.

- [ ] **Step 4: Commit**

```bash
git add web/components/site-header.tsx web/components/site-footer.tsx
git commit -m "Header and footer for the code companion: five visible routes, gold Get-the-book pill

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9: The homepage

**Files:**
- Rewrite: `web/app/page.tsx`
- Modify: `web/components/motion/hero-intro.tsx` (drop the seal step), `web/app/globals.css` (`.book-cover`, `.book-glow`)
- Delete: `web/components/launch-seal.tsx`, `web/components/part-accordion.tsx`, `web/components/stat-value.tsx`

- [ ] **Step 1: Delete the three components** with `git rm`.

- [ ] **Step 2: In `hero-intro.tsx`** delete the `tl.from("[data-hero-seal]", ...)` call and the `.book-glow` tween; keep the item stagger and cover entrance. Update the doc comment accordingly.

- [ ] **Step 3: In `globals.css`** replace `.book-cover` / `.book-glow` with:

```css
.book-cover {
  box-shadow:
    0 30px 60px -20px rgba(13, 22, 38, 0.7),
    0 0 0 1px rgba(255, 255, 255, 0.06);
  transform: perspective(1200px) rotateY(-6deg);
  transition: transform 300ms ease;
}
.book-cover:hover {
  transform: perspective(1200px) rotateY(0deg);
}
```

and delete `.book-glow`.

- [ ] **Step 4: Rewrite `page.tsx`.** Keep the `STRUCTURED_DATA` / `AUTHOR_NODES` block and `readOriginal` as they are. Replace `STATS`, and the whole returned JSX, with:

```tsx
const WAYS = [
  {
    title: "In your browser",
    body: "Tool scripts run on a Python runtime loaded into the page. Edit them and run again; nothing leaves your machine.",
  },
  {
    title: "Live on our server",
    body: "Agent scripts run against Gemini with every tool call streamed as it happens. A shared key and modest limits.",
  },
  {
    title: "In Colab",
    body: "Every chapter opens as a notebook. Bring your own free Google AI Studio key and run without limits.",
  },
];
```

```tsx
export default function LandingPage() {
  const ch09 = getChapter("ch09");
  const featuredScript = ch09?.scripts.find((s) => s.agentId);
  const featuredAgent = featuredScript?.agentId
    ? AGENT_SCRIPTS.find((a) => a.id === featuredScript.agentId)
    : undefined;

  return (
    <div>
      <JsonLd data={STRUCTURED_DATA} />

      {/* Hero: the cover's world. Navy band, the announcement, the book. */}
      <section className="relative overflow-hidden bg-ink-2 text-paper">
        <GridMotif
          tone="dark"
          tile={28}
          gap={8}
          className="pointer-events-none absolute -right-10 -top-10 opacity-40 sm:right-8 lg:right-[42%]"
        />
        <HeroIntro
          className={cn(
            CONTAINER,
            "relative grid items-center gap-12 pb-20 pt-14 lg:grid-cols-[1.1fr_1fr] lg:gap-8 lg:pt-20"
          )}
        >
          <div>
            <p data-hero-item className="label-mono text-gold">
              First edition · Out now
            </p>
            <h1 data-hero-item className="mt-4 text-4xl leading-[1.08] text-paper sm:text-6xl">
              The book is out.
              <br />
              The code is here.
            </h1>
            <p data-hero-item className="mt-6 max-w-xl text-base leading-relaxed text-paper-dim sm:text-lg">
              <em className="font-serif not-italic text-paper">Agentic AI for Actuaries</em>{" "}
              is published by ACTEX Learning and free to read. This site is its
              companion: every listing from chapters 9 to 17, runnable in your
              browser, live on our server, or in Colab.
            </p>
            <div data-hero-item className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg" className="w-full bg-gold text-ink-2 hover:bg-gold-deep sm:w-auto">
                <a href={ACTEX_BOOK_URL} target="_blank" rel="noreferrer">
                  <BookOpenText size={16} weight="bold" aria-hidden="true" />
                  Get the book, free
                  <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full border-paper/30 bg-transparent text-paper hover:bg-paper/10 hover:text-paper sm:w-auto">
                <Link href="/code">
                  <Terminal size={16} aria-hidden="true" />
                  Run the code
                </Link>
              </Button>
            </div>
            <a
              data-hero-item
              href={ACTEX_BOOK_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-3 text-sm text-paper-dim transition-colors hover:text-paper"
            >
              <span className="label-mono text-gold">Published by</span>
              <Image
                src="/actex-learning-logo.svg"
                alt="ACTEX Learning"
                width={150}
                height={22}
                className="h-5 w-auto brightness-0 invert"
              />
            </a>
          </div>
          <div data-hero-cover className="relative order-first flex justify-center lg:order-none lg:justify-end">
            <div className="book-cover">
              <Image
                src="/book-cover-photo.png"
                alt="Cover of Agentic AI for Actuaries"
                width={520}
                height={716}
                priority
                className="h-auto w-[260px] rounded-sm sm:w-[360px] lg:w-[420px]"
              />
            </div>
          </div>
        </HeroIntro>
      </section>

      {/* The nine code chapters */}
      <section className="border-b border-line">
        <RevealOnScroll className={cn(CONTAINER, "py-16")}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label-mono">Parts III to V</p>
              <h2 className="mt-2">Nine chapters of runnable code</h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/code">Run the code</Link>
            </Button>
          </div>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CHAPTERS.map((chapter) => {
              const demos = chapter.scripts.filter((s) => s.demoId).length;
              const agents = chapter.scripts.filter(
                (s) => s.agentId && AGENT_SCRIPTS.find((a) => a.id === s.agentId)?.runnable
              ).length;
              return (
                <li key={chapter.slug}>
                  <Link
                    href={`/code/${chapter.slug}`}
                    className="group flex h-full flex-col rounded-md border border-line bg-card p-5 transition-colors hover:border-gold"
                  >
                    <span className="inline-flex size-9 items-center justify-center rounded-sm bg-gold font-mono text-sm font-medium text-ink-2">
                      {chapter.number}
                    </span>
                    <span className="mt-3 font-serif text-lg leading-snug text-ink group-hover:underline">
                      {chapter.title}
                    </span>
                    <span className="mt-1.5 text-xs text-slate">{chapter.domain}</span>
                    <span className="mt-auto flex flex-wrap gap-x-3 pt-4 font-mono text-[11px] text-slate">
                      {demos > 0 && <span>{demos} in the browser</span>}
                      {agents > 0 && <span>{agents} live</span>}
                      <span>Colab</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </RevealOnScroll>
      </section>

      {/* Three ways to run */}
      <section className="border-b border-line bg-paper-2">
        <RevealOnScroll className={cn(CONTAINER, "py-16")}>
          <h2>Three ways to run it</h2>
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            {WAYS.map((mode) => (
              <div key={mode.title} className="border-t-2 border-gold pt-4">
                <h3 className="text-base font-semibold">{mode.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate">{mode.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-slate">
            Everything you need is on the{" "}
            <Link href="/setup" className="text-ink underline decoration-line underline-offset-4 hover:decoration-gold">
              setup page
            </Link>
            . All datasets are synthetic; see{" "}
            <Link href="/data" className="text-ink underline decoration-line underline-offset-4 hover:decoration-gold">
              the data
            </Link>
            .
          </p>
        </RevealOnScroll>
      </section>

      {/* Featured live agent */}
      {ch09 && featuredScript && featuredAgent && (
        <section className="border-b border-line">
          <div className={cn(CONTAINER, "py-16")}>
            <p className="label-mono">Chapter 9</p>
            <h2 className="mt-2">Watch an agent work</h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate">
              The book's first agent, run on our server with every tool call
              streamed as it happens.
            </p>
            <div className="mt-8">
              <ScriptCard
                script={featuredScript}
                chapter={ch09}
                demoSpec={undefined}
                demoSource={undefined}
                agentEntry={featuredAgent}
                originalSource={readOriginal(ch09.folder, featuredScript.file)}
              />
            </div>
          </div>
        </section>
      )}

      {/* About the book */}
      <section className="border-b border-line">
        <RevealOnScroll className={cn(CONTAINER, "grid gap-10 py-16 lg:grid-cols-[1fr_1.4fr]")}>
          <div>
            <h2>About the book</h2>
            <p className="mt-3 text-base leading-relaxed text-slate">{BOOK_PROMISE}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="bg-gold text-ink-2 hover:bg-gold-deep">
                <a href={ACTEX_BOOK_URL} target="_blank" rel="noreferrer">
                  Get the book, free
                  <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href="/book">What's inside</Link>
              </Button>
            </div>
          </div>
          <dl className="grid gap-6 sm:grid-cols-2">
            {[
              ["18", "chapters", "in five parts, from AI literacy to production governance"],
              ["9", "with code", "chapters 9 to 17, every listing runnable"],
              ["4", "practice domains", "pricing, reserving, life and pensions, risk"],
              ["1", "fictional reinsurer", "Meridian Re, whose synthetic data every example uses"],
            ].map(([n, label, note]) => (
              <div key={label} className="border-l-2 border-gold pl-4">
                <dt className="sr-only">{label}</dt>
                <dd>
                  <span className="font-serif text-3xl text-ink">{n}</span>
                  <span className="label-mono ml-2">{label}</span>
                  <p className="mt-1 text-sm leading-relaxed text-slate">{note}</p>
                </dd>
              </div>
            ))}
          </dl>
        </RevealOnScroll>
      </section>

      {/* Authors, in brief */}
      <section>
        <RevealOnScroll className={cn(CONTAINER, "py-16")}>
          <h2>The authors</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            {AUTHORS.map((author) => (
              <div key={author.slug} className="flex gap-4">
                {author.image && (
                  <Image
                    src={author.image}
                    alt={`Portrait of ${author.name}`}
                    width={72}
                    height={72}
                    className="size-18 shrink-0 rounded-sm border border-line object-cover"
                  />
                )}
                <div>
                  <h3 className="font-serif text-lg text-ink">
                    {[author.honorificPrefix, author.name].filter(Boolean).join(" ")}
                  </h3>
                  {author.honorificSuffix && (
                    <p className="font-mono text-[11px] text-gold-ink">{author.honorificSuffix}</p>
                  )}
                  <p className="mt-2 text-sm leading-relaxed text-slate">{author.cardBio}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-slate">
            In collaboration with the{" "}
            <a href="https://sssia.org" target="_blank" rel="noreferrer" className="text-ink underline underline-offset-2">
              Sri Sathya Sai Institute of Actuaries
            </a>
            .
          </p>
        </RevealOnScroll>
      </section>
    </div>
  );
}
```

Imports needed at the top: `Image`, `Link`, `ArrowUpRight`, `BookOpenText`, `Terminal` (from `@phosphor-icons/react/dist/ssr`), `JsonLd`, `GridMotif`, `HeroIntro`, `RevealOnScroll`, `ScriptCard`, `Button`, `cn`, `CONTAINER`, `AGENT_SCRIPTS`, `CHAPTERS`, `getChapter`, `ACTEX_BOOK_URL`, `BOOK_PROMISE`, `OUTLINE` (structured data), `AUTHORS`, `BOOK_DESCRIPTION`, `BOOK_KEYWORDS`, `BOOK_SUBTITLE`, `SITE_DESCRIPTION`, `SITE_NAME`, `SITE_URL`. Remove `joinReaders`, `TARGET_READERS`, `GithubLogo`, `chapterPath`. In `STRUCTURED_DATA`, chapter `@id`/`url` become `ch.slug ? `${SITE_URL}/code/${ch.slug}` : `${SITE_URL}/book``.

- [ ] **Step 5: Build, then screenshot `/` at 375px and 1280px.** Checks: h1 reads "The book is out. The code is here."; hero is navy with the grid faintly behind; nine tiles show gold number squares; no marquee, no seal; `grep -c "launch" app/page.tsx` is 0.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Homepage: the book is out, the code is here

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 10: Code index and chapter pages

**Files:**
- Modify: `web/app/code/page.tsx`, `web/app/code/[chapter]/page.tsx`, `web/components/script-card.tsx`, `web/components/breadcrumbs.tsx`, `web/components/related-links.tsx`

- [ ] **Step 1: `/code` cards.** In the card: replace `<p className="font-mono text-xs text-gold-ink">Chapter {n}</p>` with the same gold number tile used on the homepage (`inline-flex size-8 ... bg-gold text-ink-2`); the domain line becomes `<span className="rounded-sm bg-gold-tint px-1.5 py-0.5 text-gold-ink">{chapter.domain}</span>`; card border `border-line hover:border-gold`; action row keeps `Run it` (now `text-gold-ink`) and `Colab`. Header h1 stays `Every listing, runnable`. The "Before you run" section gains a closing sentence: `Limits and install steps are on the <Link href="/setup">setup page</Link>.`

- [ ] **Step 2: `/code/[chapter]` header.** Above the h1, replace `<p className="label-mono">Chapter {n}</p>` with:

```tsx
<p className="flex flex-wrap items-center gap-2">
  <span className="label-mono">Chapter {chapter.number}</span>
  <span className="text-slate" aria-hidden="true">·</span>
  <span className="label-mono">Part {chapter.part}</span>
  <span className="rounded-sm bg-gold-tint px-1.5 py-0.5 font-mono text-[11px] text-gold-ink">
    {chapter.domain}
  </span>
</p>
```

Below the blurb add one line using `getPartOf` (import from `@/lib/outline`): `<p className="mt-2 text-sm text-slate">In the book: Part {part.roman}, {part.title}.</p>` guarded by `part &&`. Button classes: `Run it here` gets `className="bg-gold text-ink-2 hover:bg-gold-deep"`. "What you'll build" box: `border-line bg-card`, bullets `marker:text-gold`. Prev/next nav arrows: replace the `←` / `→` characters with `<ArrowLeft size={14} />` / `<ArrowRight size={14} />` from Phosphor ssr, links `text-slate hover:text-ink`.

- [ ] **Step 3: `script-card.tsx` header.** File-name `text-ink`, icon `text-gold-ink`; badges: browser `bg-run-ok/15 text-run-ok`, live agent `bg-gold-tint text-gold-ink`, Colab `bg-paper-2 text-slate`. Card `border-line bg-card`. Inside the runners the dark panel is unchanged from Task 6.

- [ ] **Step 4: `breadcrumbs.tsx`**: current crumb `text-ink`, separators `text-line`, links `hover:text-ink`. `related-links.tsx`: rail heading `label-mono` (drop the inline tracking classes), group heading `font-mono text-[11px] uppercase tracking-[0.16em] text-slate`, links `text-ink decoration-line hover:decoration-gold`.

- [ ] **Step 5: Build; run a browser demo and a live agent.** Open `/code/ch10`, click Run on `01_mortality_tool.py`, expect output in the dark panel. Open `/code/ch09`, run `01_column_agent.py` (needs `GOOGLE_API_KEY` in the root `.env`; if absent, the runner must show the unavailable message and the Colab link, which is also a pass). Screenshot `/code` and one chapter page.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Code pages on paper: gold chapter tiles, domain tags, part line

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 11: The Setup page

**Files:**
- Create: `web/app/setup/page.tsx`
- Modify: `web/package.json` (add `check_redirects` to prebuild), `server/registry.py` and `web/lib/links.ts` (Colab owner casing)

- [ ] **Step 1: Normalise the Colab URL owner.** In `web/lib/links.ts` and `server/registry.py` the GitHub path must use the same casing as the repository: `RohanYashraj`. Check with `curl -sI https://github.com/RohanYashraj/agentic-ai-for-actuaries-code | head -1` (200 or 301 both fine; GitHub is case-insensitive but Colab is not always). Keep `RohanYashraj` in both places and change the notebooks' badge URLs only if they 404 in Colab; otherwise leave the notebooks.

- [ ] **Step 2: Write the page**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { RelatedLinks } from "@/components/related-links";
import { colabUrl, GITHUB_REPO } from "@/lib/links";
import { absolute, breadcrumbList, graph, ID, pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import { cn, CONTAINER } from "@/lib/utils";

const DESCRIPTION =
  "Three ways to run the companion code: in the browser on this site, in Colab with a free Google AI Studio key, or locally with uv. Plus the live runner's limits.";

export const metadata: Metadata = pageMetadata({
  title: "Setup",
  description: DESCRIPTION,
  path: "/setup",
});

const TRAIL = [
  { name: SITE_NAME, path: "/" },
  { name: "Setup", path: "/setup" },
];

const LIMITS = [
  ["4", "runs per minute, per visitor"],
  ["75", "runs per day, per visitor"],
  ["750", "runs per day, site-wide"],
  ["240 s", "per run, then the server stops it"],
];

const FAQ = [
  {
    q: "Can I run the examples without installing anything?",
    a: "Yes. Tool scripts run in your browser on Pyodide, a full CPython compiled to WebAssembly; edit them and run again, entirely locally. Agent scripts run live on our server against Gemini with their tool calls streamed. Colab is the third path: a Google account and your own free key.",
  },
  {
    q: "Is the code free?",
    a: "Yes. Every listing is in an open repository under the MIT licence, and every example runs on the Gemini free tier. All datasets are synthetic; Meridian Re, the reinsurer the case studies follow, is fictional.",
  },
  {
    q: "Which framework does the code use?",
    a: "Agno for agents and Google Gemini as the default model, gemini-3.5-flash-lite. One line in .env switches provider: MODEL_PROVIDER accepts google, anthropic, or openai, and MODEL_ID picks the model.",
  },
  {
    q: "Does the code here match the book?",
    a: "The chapter scripts are the source of truth. Browser demos are generated from them at build time, live runs execute them unmodified, and Colab clones the repository. Corrections to the printed listings are recorded in the repository's errata section.",
  },
];

function Code({ children }: { children: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-md bg-ink-2 px-4 py-3 font-mono text-[13px] leading-relaxed text-paper">
      <code>{children}</code>
    </pre>
  );
}

export default function SetupPage() {
  const structuredData = graph(breadcrumbList(TRAIL), {
    "@type": "HowTo",
    "@id": absolute("/setup"),
    name: `Setup · ${SITE_NAME}`,
    description: DESCRIPTION,
    url: absolute("/setup"),
    isPartOf: { "@id": ID.website },
    step: [
      { "@type": "HowToStep", name: "Run in the browser", text: "Open any code chapter and press Run." },
      { "@type": "HowToStep", name: "Run in Colab", text: "Open the chapter notebook and add GOOGLE_API_KEY as a Colab secret." },
      { "@type": "HowToStep", name: "Run locally", text: "Install uv, clone the repository, uv sync, add your key to .env." },
    ],
  });

  return (
    <div className={cn(CONTAINER, "py-10")}>
      <JsonLd data={structuredData} />
      <Breadcrumbs trail={TRAIL} />
      <header className="mt-6 max-w-3xl">
        <h1 className="text-3xl leading-tight sm:text-4xl">Setup</h1>
        <p className="mt-4 text-base leading-relaxed text-slate">{DESCRIPTION}</p>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_280px]">
        <div className="max-w-3xl space-y-14">
          <section id="browser" className="scroll-mt-24">
            <p className="label-mono">Option 1</p>
            <h2 className="mt-2">On this site, no setup</h2>
            <p className="mt-3 text-base leading-relaxed text-slate">
              Every <Link href="/code" className="text-ink underline decoration-line underline-offset-4 hover:decoration-gold">code chapter</Link> has a Run button. Tool scripts execute in your browser; the first run downloads the Python runtime (about 10 MB, more when pandas is needed) and later runs are instant. Agent scripts run on our server with a shared key, within the limits on the right.
            </p>
          </section>

          <section id="colab" className="scroll-mt-24">
            <p className="label-mono">Option 2</p>
            <h2 className="mt-2">In Colab, with your own free key</h2>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-base leading-relaxed text-slate marker:text-gold-ink">
              <li>
                Get a key at{" "}
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-ink underline decoration-line underline-offset-4 hover:decoration-gold">
                  aistudio.google.com/apikey
                </a>
                . The free tier covers every example.
              </li>
              <li>
                Open a chapter notebook, for example{" "}
                <a href={colabUrl("ch09")} target="_blank" rel="noreferrer" className="text-ink underline decoration-line underline-offset-4 hover:decoration-gold">
                  Chapter 9 in Colab
                </a>
                .
              </li>
              <li>
                In the left sidebar, open Secrets (the key icon) and add <code className="rounded bg-paper-2 px-1 font-mono text-[13px] text-ink">GOOGLE_API_KEY</code>. The first cells clone the repository and install the pins; the notebook runs the chapter's scripts unchanged.
              </li>
            </ol>
          </section>

          <section id="local" className="scroll-mt-24">
            <p className="label-mono">Option 3</p>
            <h2 className="mt-2">Locally, with uv</h2>
            <p className="mt-3 text-base leading-relaxed text-slate">
              Python 3.11 or later. uv installs one for you if needed.
            </p>
            <Code>{`# Install uv (skip if you have it)
curl -LsSf https://astral.sh/uv/install.sh | sh
# Windows: powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

git clone ${GITHUB_REPO}.git
cd agentic-ai-for-actuaries-code
uv sync

cp .env.example .env    # then paste your key: GOOGLE_API_KEY=...

cd ch09_agentic_foundations
uv run --env-file ../.env python 01_column_agent.py`}</Code>
            <p className="mt-4 text-sm leading-relaxed text-slate">
              Prefer plain pip, as printed in the book? <code className="rounded bg-paper-2 px-1 font-mono text-[13px] text-ink">python -m venv .venv</code>, activate it, then <code className="rounded bg-paper-2 px-1 font-mono text-[13px] text-ink">pip install -r requirements.txt</code>. To use Claude or OpenAI instead of Gemini, set <code className="rounded bg-paper-2 px-1 font-mono text-[13px] text-ink">MODEL_PROVIDER</code> and the matching key in .env and run <code className="rounded bg-paper-2 px-1 font-mono text-[13px] text-ink">uv sync --extra anthropic</code> or <code className="rounded bg-paper-2 px-1 font-mono text-[13px] text-ink">--extra openai</code>. Chapter 12's vector script always needs the Google key for embeddings.
            </p>
          </section>

          <section id="questions" className="scroll-mt-24">
            <h2>Questions</h2>
            <dl className="mt-6 divide-y divide-line">
              {FAQ.map((item) => (
                <div key={item.q} className="py-5">
                  <dt className="font-serif text-lg text-ink">{item.q}</dt>
                  <dd className="mt-2 text-base leading-relaxed text-slate">{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-md border border-line bg-card p-5">
            <p className="label-mono">Live runs on this site</p>
            <dl className="mt-4 space-y-3">
              {LIMITS.map(([n, label]) => (
                <div key={label} className="flex items-baseline gap-3">
                  <dt className="font-serif text-2xl text-ink">{n}</dt>
                  <dd className="text-sm text-slate">{label}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs leading-relaxed text-slate">
              Counters reset on UTC days. Your address is hashed before it is counted and never stored. When a limit is reached, the chapter's Colab notebook is the unlimited path.
            </p>
          </div>
          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-sm text-ink underline decoration-line underline-offset-4 hover:decoration-gold"
          >
            View on GitHub
            <ArrowUpRight size={12} aria-hidden="true" />
          </a>
        </aside>
      </div>

      <RelatedLinks
        groups={[
          { title: "Run it", links: [{ label: "All nine code chapters", href: "/code" }] },
          { title: "The data", links: [{ label: "The synthetic datasets", href: "/data" }] },
        ]}
      />
    </div>
  );
}
```

- [ ] **Step 3: Wire the redirect check into the build.** In `web/package.json`, `prebuild` becomes `... && node ../scripts/check_site_graph.mjs && node ../scripts/check_redirects.mjs`.

- [ ] **Step 4: Build; `node scripts/check_redirects.mjs` now passes with 12.** Open `/setup` at 375px: the limits card stacks under the content; code block scrolls horizontally, no page overflow. Open `/faq` and confirm it lands on `/setup` with a 308 (`curl -sI localhost:3000/faq | head -3`).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Setup page: browser, Colab, local install, the live runner's limits

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 12: The Data page

**Files:**
- Create: `web/lib/datasets.ts`, `web/app/data/page.tsx`
- Modify: `scripts/demos.config.json` (ULT → ULP in the ch10-01 description)

**Interfaces produced:** `DATASETS: Dataset[]` where `Dataset = { file: string; kind: "csv" | "json" | "pdf" | "txt"; summary: string; columns?: string[]; rows?: number; usedBy: number[]; note?: string }`.

- [ ] **Step 1: Write `web/lib/datasets.ts`** (do this step before Task 4 if running in order)

```ts
/** Every file in data/, described once. All figures are synthetic and
 * deterministic: data/generate_data.py rebuilds them byte for byte from a
 * fixed seed. Meridian Re, the reinsurer they describe, is fictional. */

export type Dataset = {
  file: string;
  kind: "csv" | "json" | "pdf" | "txt";
  summary: string;
  columns?: string[];
  rows?: number;
  /** Chapter numbers whose scripts read the file. Empty when none do. */
  usedBy: number[];
  note?: string;
};

export const DATASETS: Dataset[] = [
  {
    file: "meridian_motor_india_triangle.csv",
    kind: "csv",
    summary: "Motor India paid and reported loss triangle, accident years 2018 to 2023, development 12 to 72 months, cumulative USD. Four defects are seeded for the data-quality agent to find.",
    columns: ["accident_year", "dev_period_months", "paid_loss_usd", "reported_loss_usd", "case_reserve_usd", "claim_count"],
    rows: 21,
    usedBy: [9],
    note: "Defects: two blank cells, one negative case reserve, one row where reported is below paid, and one understated claim count.",
  },
  {
    file: "meridian_motor_india_triangle_clean.csv",
    kind: "csv",
    summary: "The same triangle without the seeded defects, for the reserving workflows.",
    columns: ["accident_year", "dev_period_months", "paid_loss_usd", "reported_loss_usd", "case_reserve_usd", "claim_count"],
    rows: 21,
    usedBy: [11, 14],
  },
  {
    file: "ialm_2012_14_ulp.csv",
    kind: "csv",
    summary: "A Gompertz-shaped synthetic mortality table with the structure of IALM 2012-14 ULP: ages 18 to 99, by gender and smoker status. Not the real table; do not use it for real work.",
    columns: ["age", "gender", "smoker_status", "mortality_rate"],
    rows: 328,
    usedBy: [10],
  },
  {
    file: "internal_loss_db.csv",
    kind: "csv",
    summary: "Sixty comparable commercial property accounts with total insured value, premium and five-year incurred losses, for underwriting benchmarks.",
    columns: ["account_id", "construction", "occupancy", "protection_class", "tiv_usd", "annual_premium_usd", "five_year_incurred_usd"],
    rows: 60,
    usedBy: [13],
  },
  {
    file: "submissions/MR-CHI-2025-Q3-018.pdf",
    kind: "pdf",
    summary: "A synthetic broker submission for a Chicago commercial property risk, read by the COPE extraction tool.",
    usedBy: [13],
  },
  {
    file: "term_life_india_policies.csv",
    kind: "csv",
    summary: "Five hundred term life policies: age at entry, sum assured in INR, term, premium frequency, smoker status, lapse indicator.",
    columns: ["policy_id", "age_at_entry", "gender", "sum_assured_inr", "policy_term_years", "premium_frequency", "smoker_status", "issue_date", "lapse_indicator"],
    rows: 500,
    usedBy: [],
    note: "Generated for the Chapter 12 narrative; no script reads it yet.",
  },
  {
    file: "xs_reports/fy2024/*.txt",
    kind: "txt",
    summary: "Three quarterly experience-study notes for term life India, the archive the Chapter 12 vector-knowledge agent indexes.",
    usedBy: [12],
  },
  {
    file: "uk_annuity_members.csv",
    kind: "csv",
    summary: "Three hundred UK annuity members: date of birth, annual pension in GBP, commencement date, level or escalating, dependant indicator.",
    columns: ["member_id", "dob", "gender", "annual_pension_gbp", "commencement_date", "pension_type", "dependant_indicator"],
    rows: 300,
    usedBy: [15],
  },
  {
    file: "capital_snapshots.json",
    kind: "json",
    summary: "Two capital-model snapshots, FY2025 Q1 and Q2, with six SCR modules and the parameter versions behind each.",
    usedBy: [16],
  },
  {
    file: "metrics_registry.json",
    kind: "json",
    summary: "Monitoring thresholds and seven-day metrics for two deployed agents: tool error rate, tool calls per run, p95 latency, escalation rate, schema failures, cost per run.",
    usedBy: [17],
  },
];
```

- [ ] **Step 2: Write `web/app/data/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { RelatedLinks } from "@/components/related-links";
import { CHAPTERS } from "@/lib/chapters";
import { DATASETS } from "@/lib/datasets";
import { githubFileUrl } from "@/lib/links";
import { absolute, breadcrumbList, graph, ID, pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import { cn, CONTAINER } from "@/lib/utils";

const DESCRIPTION =
  "The synthetic Meridian Re datasets every example uses: what each file holds and which chapter reads it. Deterministic, regenerable, and fictional.";

export const metadata: Metadata = pageMetadata({
  title: "Data",
  description: DESCRIPTION,
  path: "/data",
});

const TRAIL = [
  { name: SITE_NAME, path: "/" },
  { name: "Data", path: "/data" },
];

function chapterLink(n: number) {
  const ch = CHAPTERS.find((c) => c.number === n);
  return ch ? (
    <Link key={n} href={`/code/${ch.slug}`} className="text-ink underline decoration-line underline-offset-4 hover:decoration-gold">
      Chapter {n}
    </Link>
  ) : (
    <span key={n}>Chapter {n}</span>
  );
}

export default function DataPage() {
  const structuredData = graph(breadcrumbList(TRAIL), {
    "@type": "CollectionPage",
    "@id": absolute("/data"),
    name: `Data · ${SITE_NAME}`,
    description: DESCRIPTION,
    url: absolute("/data"),
    isPartOf: { "@id": ID.website },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: DATASETS.length,
      itemListElement: DATASETS.map((d, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: { "@type": "Dataset", name: d.file, description: d.summary, isAccessibleForFree: true, license: "https://opensource.org/license/mit" },
      })),
    },
  });

  return (
    <div className={cn(CONTAINER, "py-10")}>
      <JsonLd data={structuredData} />
      <Breadcrumbs trail={TRAIL} />
      <header className="mt-6 max-w-3xl">
        <h1 className="text-3xl leading-tight sm:text-4xl">The data</h1>
        <p className="mt-4 text-base leading-relaxed text-slate">{DESCRIPTION}</p>
        <p className="mt-3 text-sm leading-relaxed text-slate">
          Everything in <code className="rounded bg-paper-2 px-1 font-mono text-[13px] text-ink">data/</code> is written by{" "}
          <a href={githubFileUrl("data/generate_data.py")} target="_blank" rel="noreferrer" className="text-ink underline decoration-line underline-offset-4 hover:decoration-gold">
            generate_data.py
          </a>{" "}
          from a fixed seed, so a fresh clone reproduces the shipped files byte for byte. No real company data and no real mortality table appears anywhere in the repository.
        </p>
      </header>

      <ul className="mt-12 divide-y divide-line border-t border-line">
        {DATASETS.map((d) => (
          <li key={d.file} className="grid gap-3 py-6 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="min-w-0">
              <h2 className="flex flex-wrap items-baseline gap-x-3 text-lg">
                <a
                  href={githubFileUrl(`data/${d.file}`)}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all font-mono text-base text-ink hover:underline"
                >
                  {d.file}
                  <ArrowUpRight size={12} className="ml-1 inline" aria-hidden="true" />
                </a>
                <span className="rounded-sm bg-gold-tint px-1.5 py-0.5 font-mono text-[11px] uppercase text-gold-ink">
                  {d.kind}
                </span>
                {d.rows && <span className="font-mono text-xs text-slate">{d.rows} rows</span>}
              </h2>
              <p className="mt-2 text-base leading-relaxed text-slate">{d.summary}</p>
              {d.columns && (
                <p className="mt-2 break-words font-mono text-xs leading-relaxed text-slate">
                  {d.columns.join(" · ")}
                </p>
              )}
              {d.note && <p className="mt-2 text-sm text-slate">{d.note}</p>}
            </div>
            <p className="text-sm text-slate lg:text-right">
              {d.usedBy.length
                ? d.usedBy.map((n, i) => (
                    <span key={n}>
                      {i > 0 && ", "}
                      {chapterLink(n)}
                    </span>
                  ))
                : "Not read by any script"}
            </p>
          </li>
        ))}
      </ul>

      <RelatedLinks
        groups={[
          { title: "Run it", links: [{ label: "All nine code chapters", href: "/code" }, { label: "Setup", href: "/setup" }] },
        ]}
      />
    </div>
  );
}
```

- [ ] **Step 3: Fix "ULT" in `scripts/demos.config.json`** (ch10-01 description) and re-run `python3 scripts/build_demos.py --out web/public/demos`.

- [ ] **Step 4: Build; open `/data`.** Ten rows; file names wrap on a phone without horizontal scroll; every "Chapter n" link resolves. `grep -rn "ULT" web/lib scripts/demos.config.json` returns nothing.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Data page: every synthetic dataset, what it holds, which chapter reads it

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 13: The book page

**Files:**
- Rewrite: `web/app/book/page.tsx`

- [ ] **Step 1: Write the page**

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";
import { ACTEX_BOOK_URL } from "@/lib/links";
import { BOOK_PROMISE, OUTLINE, TARGET_READERS, joinReaders } from "@/lib/outline";
import { absolute, breadcrumbList, graph, ID, pageMetadata } from "@/lib/seo";
import { AUTHORS, BOOK_SUBTITLE, SITE_NAME } from "@/lib/site";
import { cn, CONTAINER } from "@/lib/utils";

const DESCRIPTION =
  "Agentic AI for Actuaries: eighteen chapters in five parts, published by ACTEX Learning and free to read. What it covers, where to get it, and who wrote it.";

export const metadata: Metadata = pageMetadata({
  title: "The book",
  description: DESCRIPTION,
  path: "/book",
  ogType: "book",
});

const TRAIL = [
  { name: SITE_NAME, path: "/" },
  { name: "The book", path: "/book" },
];

export default function BookPage() {
  const structuredData = graph(breadcrumbList(TRAIL), {
    "@type": "WebPage",
    "@id": absolute("/book"),
    name: `The book · ${SITE_NAME}`,
    description: DESCRIPTION,
    url: absolute("/book"),
    isPartOf: { "@id": ID.website },
    about: { "@id": ID.book },
  });

  return (
    <div className={cn(CONTAINER, "py-10")}>
      <JsonLd data={structuredData} />
      <Breadcrumbs trail={TRAIL} />

      <header className="mt-6 grid items-start gap-10 lg:grid-cols-[1fr_300px]">
        <div className="max-w-3xl">
          <p className="label-mono">First edition · 2026 · ACTEX Learning</p>
          <h1 className="mt-2 text-3xl leading-tight sm:text-4xl">Agentic AI for Actuaries</h1>
          <p className="mt-2 font-serif text-lg text-slate">{BOOK_SUBTITLE}</p>
          <p className="mt-5 text-base leading-relaxed text-slate">{BOOK_PROMISE}</p>
          <p className="mt-3 text-sm leading-relaxed text-slate">Written for {joinReaders(TARGET_READERS)}.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="bg-gold text-ink-2 hover:bg-gold-deep">
              <a href={ACTEX_BOOK_URL} target="_blank" rel="noreferrer">
                Get the book, free
                <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link href="/code">Run the code</Link>
            </Button>
          </div>
        </div>
        <a href={ACTEX_BOOK_URL} target="_blank" rel="noreferrer" className="book-cover mx-auto block w-[220px] lg:w-full">
          <Image src="/book-cover-photo.png" alt="Cover of Agentic AI for Actuaries" width={520} height={716} className="h-auto w-full rounded-sm" />
        </a>
      </header>

      <section className="mt-14">
        <h2>What's inside</h2>
        <div className="mt-6 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {OUTLINE.map((part) => (
            <div key={part.roman} className="border-t-2 border-gold pt-4">
              <p className="label-mono">Part {part.roman}</p>
              <h3 className="mt-1 font-serif text-lg text-ink">{part.title}</h3>
              <ol className="mt-3 space-y-1.5 text-sm">
                {part.chapters.map((ch) => (
                  <li key={ch.number} className="grid grid-cols-[28px_1fr] gap-x-2 leading-snug">
                    <span className="font-mono text-xs text-slate">{ch.number}</span>
                    {ch.slug ? (
                      <Link href={`/code/${ch.slug}`} className="text-ink underline decoration-line underline-offset-4 hover:decoration-gold">
                        {ch.title}
                        <span className="ml-1.5 rounded-sm bg-gold-tint px-1 font-mono text-[10px] text-gold-ink">code</span>
                      </Link>
                    ) : (
                      <span className="text-slate">{ch.title}</span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <section id="authors" className="mt-14 scroll-mt-24">
        <h2>The authors</h2>
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          {AUTHORS.map((author) => (
            <article key={author.slug} className="flex gap-4">
              {author.image && (
                <Image src={author.image} alt={`Portrait of ${author.name}`} width={96} height={96} className="size-24 shrink-0 rounded-sm border border-line object-cover" />
              )}
              <div>
                <h3 className="font-serif text-lg text-ink">{[author.honorificPrefix, author.name].filter(Boolean).join(" ")}</h3>
                {author.honorificSuffix && <p className="font-mono text-[11px] text-gold-ink">{author.honorificSuffix}</p>}
                {author.jobTitle && <p className="mt-1 text-sm text-slate">{author.jobTitle}{author.affiliation ? `, ${author.affiliation}` : ""}</p>}
                {(author.biography ?? [author.cardBio]).filter(Boolean).slice(0, 2).map((para, i) => (
                  <p key={i} className="mt-2 text-sm leading-relaxed text-slate">{para}</p>
                ))}
                {author.links?.map((link) => (
                  <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-slate hover:text-ink">
                    {link.label}
                    <ArrowUpRight size={12} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
        <p className="mt-8 text-sm text-slate">
          Foreword by, and in collaboration with, the{" "}
          <a href="https://sssia.org" target="_blank" rel="noreferrer" className="text-ink underline underline-offset-2">Sri Sathya Sai Institute of Actuaries</a>.
        </p>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Build; open `/book`.** Chapters 9 to 17 link to their code pages; the others are plain text; `/authors` lands here with a 308. Screenshot.

- [ ] **Step 3: Commit**

```bash
git add web/app/book/page.tsx
git commit -m "Book page: what's inside, get it at ACTEX, the authors

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 14: Sweep, verify, and record the decision

**Files:**
- Modify: `web/app/not-found.tsx`, `web/app/error.tsx` (light-theme check), `README.md` (site section), `web/README.md`, memory file `site-rebuild-decisions.md`

- [ ] **Step 1: 404 and error pages.** Open `/nope` and confirm both render on paper with ink text and a `/code` link; fix any leftover class.

- [ ] **Step 2: READMEs.** In `README.md` "Three ways to run" the Website row's description becomes `Companion code for chapters 9 to 17, runnable in the browser or live on the server; setup and data pages`. In `web/README.md`, replace any route list with: `/`, `/code`, `/code/[chapter]`, `/setup`, `/data`, `/book`, plus the redirect table from A2.

- [ ] **Step 3: Full gate**

```bash
cd web && npm run build
node ../scripts/check_site_graph.mjs && node ../scripts/check_redirects.mjs
grep -rnE '(navy|cream)-[0-9]|gold-(300|400|500)|launch-|/book/primer|/concepts|/glossary|/actuarial-ai|/faq|/resources|/authors' app components lib ; echo "grep exit $?"
```
Expected: build passes, both checks pass, grep exit 1.

- [ ] **Step 4: Browser pass** with `book-site` at 375px and 1280px on `/`, `/code`, `/code/ch14`, `/setup`, `/data`, `/book`, plus `/faq` → `/setup` and `/concepts/agentic-ai` → `/code`. Reduced-motion check: `resize_window` cannot set it, so add `matchMedia` override in the console (`window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} })` before reload is unreliable); instead confirm every GSAP call in `hero-intro.tsx`, `reveal-on-scroll.tsx` is inside `mm.add("(prefers-reduced-motion: no-preference)", ...)` by grep.

- [ ] **Step 5: Update memory.** Rewrite `/Users/rohanyashraj/.claude/projects/-Users-rohanyashraj-Documents-GitHub-agentic-ai-for-actuaries-code/memory/site-rebuild-decisions.md`: the August plan shipped on main; on 2026-09-18 the site became the code companion with a light paper theme and a cover-navy hero, book-prose routes retired with redirects; spec and plan under `docs/superpowers/`. Update the `MEMORY.md` pointer line.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Rebrand sweep: READMEs, error pages, and the verification pass

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

- [ ] **Step 7: Open a pull request** from `site/rebrand-2026-09` to `main` titled `Code-companion rebrand: light theme, cover hero, setup and data pages`, body summarising A1 to A5 and listing the redirect table, ending with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.

---

## Self-review

- **Spec coverage:** A2 routes → Tasks 2, 11, 12, 13; redirects → Tasks 2, 5; A3 nav → Task 8; A4 copy → Tasks 9, 10; A5 tokens and motif → Tasks 6, 7; hero → Task 9; waitlist removal → Task 3; llms.txt → Task 4; verification → every task plus 14.
- **Order caveat:** Task 4 imports `DATASETS`, defined in Task 12 Step 1; run that step first. Task 5's script fails on `/faq` until `/setup` exists (Task 11), which is when it joins `prebuild`.
- **Type consistency:** `Chapter.domain` and `Chapter.part` (Task 2) are used by Tasks 9, 10; `DATASETS`/`Dataset` (Task 12) by Tasks 4, 12; `GridMotif` props (Task 7) by Tasks 8, 9; `relatedForCodeChapter` signature unchanged; `getPartOf` kept in `outline.ts` and used by Tasks 2 (graph) and 10.
