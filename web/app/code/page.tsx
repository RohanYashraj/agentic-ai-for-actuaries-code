import type { Metadata } from "next";
import Link from "next/link";
import { Play, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { RelatedLinks } from "@/components/related-links";
import { AGENT_SCRIPTS } from "@/lib/agents";
import { CHAPTERS } from "@/lib/chapters";
import { DOMAINS } from "@/lib/domains";
import { colabUrl } from "@/lib/links";
import { chapterPath, getOutlineChapter } from "@/lib/outline";
import { absolute, breadcrumbList, graph, ID, pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import { cn, CONTAINER } from "@/lib/utils";

const DESCRIPTION =
  "Every companion listing from the book: tool scripts run editable in your browser, agent scripts run live against Gemini, and every chapter opens in Colab.";

export const metadata: Metadata = pageMetadata({
  title: "Run the code",
  description: DESCRIPTION,
  path: "/code",
});

const TRAIL = [
  { name: SITE_NAME, path: "/" },
  { name: "Run the code", path: "/code" },
];

export default function CodeIndexPage() {
  const structuredData = graph(breadcrumbList(TRAIL), {
    "@type": "CollectionPage",
    "@id": absolute("/code"),
    name: `Run the code · ${SITE_NAME}`,
    description: DESCRIPTION,
    url: absolute("/code"),
    isPartOf: { "@id": ID.website },
    about: { "@id": ID.book },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: CHAPTERS.length,
      itemListElement: CHAPTERS.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absolute(`/code/${c.slug}`),
        name: `Chapter ${c.number}: ${c.title}`,
      })),
    },
  });

  return (
    <div className={cn(CONTAINER, "py-12")}>
      <JsonLd data={structuredData} />
      <Breadcrumbs trail={TRAIL} />
      <header className="mt-6 max-w-3xl">
        <h1 className="text-3xl leading-tight sm:text-4xl">
          Every listing, runnable
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          The companion code for Parts III to V of the book, three ways. Tool
          scripts run editable right here, on a Python runtime inside your
          browser. Agent scripts run live on our server against Gemini, with
          their tool calls streamed as they happen. And every chapter opens as
          a Colab notebook where you bring your own free Gemini key and go as
          far as you like.
        </p>
      </header>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        {CHAPTERS.map((chapter) => {
          const demoCount = chapter.scripts.filter((s) => s.demoId).length;
          const agentCount = chapter.scripts.filter(
            (s) =>
              s.agentId &&
              AGENT_SCRIPTS.find((a) => a.id === s.agentId)?.runnable
          ).length;
          const domain = DOMAINS.find((d) => d.chapter === chapter.number);
          const outline = getOutlineChapter(chapter.number);
          return (
            <article
              key={chapter.slug}
              className="group flex flex-col rounded-md border border-border bg-card p-5 transition-colors hover:border-gold-400/50"
            >
              <p className="font-mono text-xs text-gold-400">
                Chapter {chapter.number}
              </p>
              <h2 className="mt-1.5 text-lg leading-snug text-cream-100">
                <Link href={`/code/${chapter.slug}`} className="hover:underline">
                  {chapter.title}
                </Link>
              </h2>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {chapter.blurb}
              </p>
              {outline && (
                <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
                  <span className="text-cream-200">Case study.</span>{" "}
                  {outline.caseStudy}
                </p>
              )}
              <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
                {demoCount > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Play size={11} className="text-run-ok" aria-hidden="true" />
                    {demoCount} browser demo{demoCount > 1 ? "s" : ""}
                  </span>
                )}
                {agentCount > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Sparkle
                      size={11}
                      className="text-gold-400"
                      aria-hidden="true"
                    />
                    {agentCount} live agent{agentCount > 1 ? "s" : ""}
                  </span>
                )}
                {domain && <span>{domain.name}</span>}
              </p>
              {/* py-1 on each action: at 11px these are otherwise a
                  16px-tall thumb target. */}
              <p className="mt-auto flex flex-wrap gap-x-4 pt-3 font-mono text-[11px]">
                <Link
                  href={`/code/${chapter.slug}`}
                  className="py-1 text-gold-300 transition-colors hover:text-gold-300 hover:underline"
                >
                  Run it
                </Link>
                <Link
                  href={chapterPath(chapter.number)}
                  className="py-1 text-muted-foreground transition-colors hover:text-cream-100"
                >
                  Read the chapter
                </Link>
                <a
                  href={colabUrl(chapter.slug)}
                  target="_blank"
                  rel="noreferrer"
                  className="py-1 text-muted-foreground transition-colors hover:text-cream-100"
                >
                  Colab
                </a>
              </p>
            </article>
          );
        })}
      </section>

      <section className="mt-12 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        <h2 className="text-xl text-cream-100">Notes for the curious</h2>
        <p className="mt-3">
          Browser demos run on Pyodide, a full CPython compiled to WebAssembly.
          The first run downloads the runtime (about 10 MB, more with pandas);
          after that, runs are instant and entirely local. The demo sources are
          generated from the repository scripts at build time, so what you run
          here is what is in the book.
        </p>
        <p className="mt-3">
          Live agent runs execute the unmodified chapter scripts on the server
          with a shared Gemini key and modest rate limits. When the shared
          limit runs out, the Colab notebooks take over: they are the
          full-fidelity path and always available.
        </p>
      </section>

      <RelatedLinks
        groups={[
          {
            title: "The book",
            links: [
              { label: "All eighteen chapters", href: "/book" },
              {
                label: "Chapter 9: What is Agentic AI?",
                href: chapterPath(9),
                note: "Where the code starts",
              },
            ],
          },
          {
            title: "Reference",
            links: [{ label: "Glossary", href: "/glossary" }],
          },
        ]}
      />
    </div>
  );
}
