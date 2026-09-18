import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Play, Sparkle, Terminal } from "@phosphor-icons/react/dist/ssr";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { RelatedLinks } from "@/components/related-links";
import { AGENT_SCRIPTS } from "@/lib/agents";
import { CHAPTERS } from "@/lib/chapters";
import { colabUrl } from "@/lib/links";
import { getOutlineChapter } from "@/lib/outline";
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

      <header className="mt-8 max-w-3xl">
        <p className="label-mono">Chapters 9 to 17</p>
        <h1 className="mt-2 text-3xl sm:text-5xl font-serif text-white font-bold tracking-tight">
          Every listing, runnable
        </h1>
        <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-300">
          The code from Parts III to V of{" "}
          <span className="text-white font-medium">Agentic AI for Actuaries</span>.
          Nine chapters across pricing, reserving, life, and risk, each one runnable from this page.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "In your browser",
              tag: "WebAssembly",
              desc: "Tool scripts run in the page. Edit them and run again.",
              color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
            },
            {
              title: "Live on server",
              tag: "Agno + Gemini",
              desc: "Agent scripts run against Gemini. You watch the tool calls.",
              color: "border-cyan-500/30 text-cyan-400 bg-cyan-500/10",
            },
            {
              title: "In Google Colab",
              tag: "Notebook",
              desc: "Any chapter, as a notebook, with your own free key.",
              color: "border-amber-500/30 text-amber-400 bg-amber-500/10",
            },
          ].map((mode) => (
            <div
              key={mode.title}
              className="card-glass p-4 sm:p-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">{mode.title}</h3>
                <span className={cn("rounded-full border px-2 py-0.5 font-mono text-[10px]", mode.color)}>
                  {mode.tag}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                {mode.desc}
              </p>
            </div>
          ))}
        </div>
      </header>

      {/* Chapters Grid */}
      <section className="mt-12 grid gap-5 sm:grid-cols-2">
        {CHAPTERS.map((chapter) => {
          const demoCount = chapter.scripts.filter((s) => s.demoId).length;
          const agentCount = chapter.scripts.filter(
            (s) =>
              s.agentId &&
              AGENT_SCRIPTS.find((a) => a.id === s.agentId)?.runnable
          ).length;
          const outline = getOutlineChapter(chapter.number);

          return (
            <article
              key={chapter.slug}
              className="group card-glass flex flex-col p-6 transition-all duration-300 hover:border-amber-400/40 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex size-8.5 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 font-mono text-sm font-bold text-navy-950 shadow-sm shadow-amber-500/20">
                    {chapter.number}
                  </span>
                  <span className="font-mono text-xs text-slate-400">
                    Chapter {chapter.number}
                  </span>
                </div>
                <span className="rounded-full bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 font-mono text-[11px] text-amber-300 font-medium">
                  {chapter.domain}
                </span>
              </div>

              <h2 className="mt-4 font-serif text-xl leading-snug text-white group-hover:text-amber-300 transition-colors">
                <Link href={`/code/${chapter.slug}`}>
                  {chapter.title}
                </Link>
              </h2>

              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-300 line-clamp-3">
                {chapter.blurb}
              </p>

              {outline && (
                <div className="mt-3 rounded-lg border border-white/5 bg-white/5 p-2.5 text-xs text-slate-400">
                  <span className="font-semibold text-amber-400">Case study:</span>{" "}
                  {outline.caseStudy}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[11px]">
                {demoCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-emerald-400 font-medium">
                    <Play size={10} weight="fill" />
                    {demoCount} browser demo{demoCount > 1 ? "s" : ""}
                  </span>
                )}
                {agentCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 text-cyan-400 font-medium">
                    <Sparkle size={10} weight="fill" />
                    {agentCount} live agent{agentCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4 font-mono text-xs">
                <Link
                  href={`/code/${chapter.slug}`}
                  className="inline-flex items-center gap-1 font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <Terminal size={14} />
                  <span>Open chapter →</span>
                </Link>
                <a
                  href={colabUrl(chapter.slug)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                >
                  <span>Colab</span>
                  <ArrowUpRight size={12} />
                </a>
              </div>
            </article>
          );
        })}
      </section>

      {/* Before You Run Advice */}
      <section className="mt-14 card-glass p-6 sm:p-7 max-w-3xl">
        <h2 className="text-xl font-serif text-white font-semibold">Before you run</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-300">
          <p>
            <strong className="text-white">Browser demos</strong> run on Pyodide, which is CPython compiled to WebAssembly. The first run downloads about 10 MB; after that it is quick, and nothing leaves your machine. The demo scripts follow the book code line for line.
          </p>
          <p>
            <strong className="text-white">Live agents</strong> run on our server with Gemini and Agno, and the tool calls stream back as they happen. There is a shared daily limit. If you hit it, the Colab notebook for the chapter has no limit.
          </p>
        </div>
      </section>

      <RelatedLinks
        groups={[
          {
            title: "Run it yourself",
            links: [
              { label: "Setup", href: "/setup", note: "Colab, local install, limits" },
              { label: "Data", href: "/data", note: "The synthetic datasets" },
            ],
          },
          {
            title: "The book",
            links: [{ label: "About the book", href: "/book" }],
          },
        ]}
      />
    </div>
  );
}
