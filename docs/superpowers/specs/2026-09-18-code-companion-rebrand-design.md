# Code-companion rebrand: design (2026-09-18)

> **Amendment, same day.** After seeing the light version, the author kept the
> **navy theme** (the cover's own palette) and the launch decorations: the
> tangerine marquee strip, the rotating seal on the cover, and a headline that
> announces the launch ("The book is out.", with the last word in the launch
> gradient). Section A5's light-paper tokens are therefore **not** in force;
> the navy tokens from `globals.css` on main remain the single theme. Every
> other section (A1 to A4, A6) stands.


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

