import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { RelatedLinks } from "@/components/related-links";
import { DOMAINS, domainPath } from "@/lib/domains";
import { chapterPath } from "@/lib/outline";
import { absolute, breadcrumbList, graph, ID, pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import { cn, CONTAINER } from "@/lib/utils";

const DESCRIPTION =
  "How agentic AI is applied across the four actuarial practice domains: pricing and underwriting, reserving and claims, life, health and pensions, and risk management and compliance.";

export const metadata: Metadata = pageMetadata({
  title: "Agentic AI by actuarial domain",
  description: DESCRIPTION,
  path: "/actuarial-ai",
});

const TRAIL = [
  { name: SITE_NAME, path: "/" },
  { name: "Practice domains", path: "/actuarial-ai" },
];

export default function DomainIndexPage() {
  const structuredData = graph(breadcrumbList(TRAIL), {
    "@type": "CollectionPage",
    "@id": absolute("/actuarial-ai"),
    name: `Agentic AI by actuarial domain · ${SITE_NAME}`,
    description: DESCRIPTION,
    url: absolute("/actuarial-ai"),
    isPartOf: { "@id": ID.website },
    about: { "@id": ID.book },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: DOMAINS.length,
      itemListElement: DOMAINS.map((d, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absolute(domainPath(d.slug)),
        name: d.name,
      })),
    },
  });

  return (
    <div className={cn(CONTAINER, "py-10")}>
      <JsonLd data={structuredData} />
      <Breadcrumbs trail={TRAIL} />

      <header className="mt-6 max-w-3xl">
        <h1 className="text-3xl leading-tight sm:text-4xl">
          Agentic AI by actuarial domain
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Part IV of the book applies everything from Parts I to III to the
          four major actuarial practice areas. Each domain page collects the
          workflows that have established themselves in production, what the
          agent does and where the qualified professional takes over, the
          chapters that supply the machinery, and the runnable code.
        </p>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {DOMAINS.map((domain) => (
          <article
            key={domain.slug}
            className="flex flex-col rounded-md border border-border bg-card p-5 transition-colors hover:border-gold-400/50"
          >
            <p className="font-mono text-xs text-gold-400">
              Chapter {domain.chapter}
            </p>
            <h2 className="mt-1.5 text-lg leading-snug text-cream-100">
              <Link href={domainPath(domain.slug)} className="hover:underline">
                {domain.name}
              </Link>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {domain.blurb}
            </p>
            <p className="mt-auto pt-4 font-mono text-[11px] text-muted-foreground">
              {domain.workflows.length} workflows ·{" "}
              {domain.codeSlugs.length} code chapter
              {domain.codeSlugs.length > 1 ? "s" : ""}
            </p>
          </article>
        ))}
      </div>

      <RelatedLinks
        groups={[
          {
            title: "In the book",
            links: [
              { label: "All eighteen chapters", href: "/book" },
              ...DOMAINS.map((d) => ({
                label: `Chapter ${d.chapter}: ${d.name}`,
                href: chapterPath(d.chapter),
              })),
            ],
          },
          {
            title: "Reference",
            links: [
              { label: "Glossary", href: "/glossary" },
              { label: "Run the code", href: "/code" },
            ],
          },
        ]}
      />
    </div>
  );
}
