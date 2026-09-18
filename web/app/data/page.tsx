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

const LINK =
  "text-cream-100 underline decoration-border underline-offset-4 hover:decoration-gold-400";

function ChapterLink({ n }: { n: number }) {
  const ch = CHAPTERS.find((c) => c.number === n);
  return ch ? (
    <Link href={`/code/${ch.slug}`} className={LINK}>
      Chapter {n}
    </Link>
  ) : (
    <span>Chapter {n}</span>
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
    <div className={cn(CONTAINER, "py-10")}>
      <JsonLd data={structuredData} />
      <Breadcrumbs trail={TRAIL} />
      <header className="mt-6 max-w-3xl">
        <h1 className="text-3xl leading-tight sm:text-4xl">The data</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {DESCRIPTION}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Everything in{" "}
          <code className="rounded bg-navy-800 px-1 font-mono text-[13px] text-cream-100">
            data/
          </code>{" "}
          is written by{" "}
          <a
            href={githubFileUrl("data/generate_data.py")}
            target="_blank"
            rel="noreferrer"
            className={LINK}
          >
            generate_data.py
          </a>{" "}
          from a fixed seed, so a fresh clone reproduces the shipped files
          byte for byte. No real company data and no real mortality table
          appears anywhere in the repository.
        </p>
      </header>

      <ul className="mt-12 divide-y divide-border border-t border-border">
        {DATASETS.map((d) => (
          <li
            key={d.file}
            className="grid gap-3 py-6 lg:grid-cols-[minmax(0,1fr)_220px]"
          >
            <div className="min-w-0">
              <h2 className="flex flex-wrap items-baseline gap-x-3 text-lg">
                <a
                  href={githubFileUrl(`data/${d.file}`)}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all font-mono text-base text-cream-100 hover:underline"
                >
                  {d.file}
                  <ArrowUpRight
                    size={12}
                    className="ml-1 inline"
                    aria-hidden="true"
                  />
                </a>
                <span className="rounded-sm bg-gold-400/10 px-1.5 py-0.5 font-mono text-[11px] uppercase text-gold-300">
                  {d.kind}
                </span>
                {d.rows && (
                  <span className="font-mono text-xs text-muted-foreground">
                    {d.rows} rows
                  </span>
                )}
              </h2>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                {d.summary}
              </p>
              {d.columns && (
                <p className="mt-2 break-words font-mono text-xs leading-relaxed text-muted-foreground">
                  {d.columns.join(" · ")}
                </p>
              )}
              {d.note && <p className="mt-2 text-sm text-muted-foreground">{d.note}</p>}
            </div>
            <p className="text-sm text-muted-foreground lg:text-right">
              {d.usedBy.length
                ? d.usedBy.map((n, i) => (
                    <span key={n}>
                      {i > 0 && ", "}
                      <ChapterLink n={n} />
                    </span>
                  ))
                : "Not read by any script"}
            </p>
          </li>
        ))}
      </ul>

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
