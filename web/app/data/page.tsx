import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Database, FileText, Table } from "@phosphor-icons/react/dist/ssr";
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

const LINK =
  "text-amber-400 underline decoration-amber-400/40 underline-offset-4 hover:decoration-amber-400 hover:text-white transition-colors";

function ChapterLink({ n }: { n: number }) {
  const ch = CHAPTERS.find((c) => c.number === n);
  return ch ? (
    <Link
      href={`/code/${ch.slug}`}
      className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[11px] text-amber-300 hover:border-amber-400 hover:text-white transition-colors"
    >
      <span>Chapter {n}</span>
    </Link>
  ) : (
    <span className="font-mono text-[11px] text-slate-400">Chapter {n}</span>
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
        item: {
          "@type": "Dataset",
          name: d.file,
          description: d.summary,
          isAccessibleForFree: true,
          license: "https://opensource.org/license/mit",
        },
      })),
    },
  });

  return (
    <div className={cn(CONTAINER, "py-12")}>
      <JsonLd data={structuredData} />
      <Breadcrumbs trail={TRAIL} />

      <header className="mt-8 max-w-3xl">
        <p className="label-mono">Synthetic Data Catalog</p>
        <h1 className="mt-2 text-3xl sm:text-5xl font-serif text-white font-bold tracking-tight">The data</h1>
        <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-300">
          {DESCRIPTION}
        </p>
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-xs sm:text-sm leading-relaxed text-slate-400">
          Everything in <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-amber-300 border border-white/10">data/</code> is generated deterministically by{" "}
          <a
            href={githubFileUrl("data/generate_data.py")}
            target="_blank"
            rel="noreferrer"
            className={LINK}
          >
            generate_data.py
          </a>{" "}
          from a fixed seed, ensuring byte-for-byte reproducibility on any fresh clone. No proprietary company data or real mortality tables appear anywhere in this work.
        </div>
      </header>

      <div className="mt-12 space-y-5">
        {DATASETS.map((d) => (
          <article
            key={d.file}
            className="card-glass p-5 sm:p-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href={githubFileUrl(`data/${d.file}`)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 font-mono text-base font-semibold text-white hover:text-amber-300 transition-colors break-all"
                >
                  <Database size={16} className="text-amber-400 shrink-0" />
                  <span>{d.file}</span>
                  <ArrowUpRight size={13} className="shrink-0" />
                </a>

                <span className="rounded-full bg-amber-400/10 border border-amber-400/25 px-2.5 py-0.5 font-mono text-[10px] uppercase font-bold text-amber-300">
                  {d.kind}
                </span>

                {d.rows && (
                  <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 font-mono text-[11px] text-slate-400">
                    {d.rows} rows
                  </span>
                )}
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                {d.summary}
              </p>

              {d.columns && (
                <div className="mt-3 flex flex-wrap gap-1.5 pt-1">
                  {d.columns.map((col) => (
                    <span
                      key={col}
                      className="rounded bg-white/5 border border-white/5 px-2 py-0.5 font-mono text-[11px] text-slate-400"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              )}

              {d.note && (
                <p className="mt-3 text-xs text-amber-300/80 italic">
                  Note: {d.note}
                </p>
              )}
            </div>

            <div className="border-t border-white/10 pt-4 lg:border-t-0 lg:pt-0 lg:border-l lg:border-white/10 lg:pl-6 lg:text-right shrink-0">
              <p className="label-mono text-[10px] text-slate-400">Used by</p>
              <div className="mt-2 flex flex-wrap gap-1.5 lg:justify-end">
                {d.usedBy.length ? (
                  d.usedBy.map((n) => <ChapterLink key={n} n={n} />)
                ) : (
                  <span className="text-xs text-slate-500 italic">Reference dataset</span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <RelatedLinks
        groups={[
          {
            title: "Run it",
            links: [
              { label: "All nine code chapters", href: "/code" },
              { label: "Setup", href: "/setup" },
            ],
          },
        ]}
      />
    </div>
  );
}
