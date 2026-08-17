import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { RelatedLinks } from "@/components/related-links";
import { DOMAINS, domainPath } from "@/lib/domains";
import { chapterPath } from "@/lib/outline";
import {
  formatVerified,
  KIND_LABELS,
  REFERENCES,
  type ReferenceKind,
} from "@/lib/references";
import { absolute, breadcrumbList, graph, ID, pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import { cn, CONTAINER } from "@/lib/utils";

const DESCRIPTION =
  "The standards, regulations and professional guidance the book cites, including IFRS 17, Solvency II, LDTI, IRDAI, IAIS, and the AI guidance of the ASB, IFoA, IAA and CAS, with jurisdiction and the chapters that use them.";

export const metadata: Metadata = pageMetadata({
  title: "Sources and standards",
  description: DESCRIPTION,
  path: "/resources",
});

const TRAIL = [
  { name: SITE_NAME, path: "/" },
  { name: "Sources and standards", path: "/resources" },
];

const KIND_ORDER: ReferenceKind[] = [
  "standard",
  "regulation",
  "guidance",
  "professional-body",
];

export default function ResourcesPage() {
  const structuredData = graph(breadcrumbList(TRAIL), {
    "@type": "CollectionPage",
    "@id": absolute("/resources"),
    name: `Sources and standards · ${SITE_NAME}`,
    description: DESCRIPTION,
    url: absolute("/resources"),
    isPartOf: { "@id": ID.website },
    about: { "@id": ID.book },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: REFERENCES.length,
      itemListElement: REFERENCES.map((r, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "CreativeWork",
          name: r.title,
          publisher: { "@type": "Organization", name: r.publisher },
          url: r.url,
        },
      })),
    },
  });

  return (
    <div className={cn(CONTAINER, "py-10")}>
      <JsonLd data={structuredData} />
      <Breadcrumbs trail={TRAIL} />

      <header className="mt-6 max-w-3xl">
        <h1 className="text-3xl leading-tight sm:text-4xl">
          Sources and standards
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Regulatory material is jurisdiction-specific and it moves. Each entry
          below names the jurisdiction it applies to, what the book uses it
          for, and the chapters that cite it. Where a link has not yet been
          checked against the current version of the source, no verification
          date is shown. Treat those as pointers to follow rather than as
          confirmed citations.
        </p>
      </header>

      <div className="mt-12 space-y-12">
        {KIND_ORDER.map((kind) => {
          const items = REFERENCES.filter((r) => r.kind === kind);
          if (items.length === 0) return null;
          return (
            <section key={kind}>
              <h2 className="text-2xl leading-tight">{KIND_LABELS[kind]}</h2>
              <div className="mt-5 divide-y divide-border border-t border-border">
                {items.map((reference) => {
                  const verified = formatVerified(reference);
                  return (
                    <article key={reference.id} className="py-5">
                      <h3 className="font-serif text-lg text-cream-100">
                        <a
                          href={reference.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-baseline gap-1 hover:underline"
                        >
                          {reference.title}
                          <ArrowUpRight
                            size={13}
                            aria-hidden="true"
                            className="translate-y-px"
                          />
                        </a>
                      </h3>
                      <p className="label-mono mt-1 text-muted-foreground">
                        {reference.jurisdiction} · {reference.publisher}
                      </p>
                      <p className="mt-2.5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                        {reference.note}
                      </p>
                      <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
                        {reference.chapters.map((n) => (
                          <Link
                            key={n}
                            href={chapterPath(n)}
                            className="transition-colors hover:text-gold-300"
                          >
                            Chapter {n}
                          </Link>
                        ))}
                        {reference.appliesTo.map((d) => (
                          <Link
                            key={d}
                            href={domainPath(d)}
                            className="transition-colors hover:text-gold-300"
                          >
                            {DOMAINS.find((x) => x.slug === d)?.name}
                          </Link>
                        ))}
                        {verified && <span>Link verified {verified}</span>}
                      </p>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <RelatedLinks
        groups={[
          {
            title: "Practice domains",
            links: DOMAINS.map((d) => ({
              label: d.name,
              href: domainPath(d.slug),
            })),
          },
          {
            title: "The book",
            links: [
              { label: "All eighteen chapters", href: "/book" },
              { label: "The authors", href: "/authors" },
            ],
          },
          {
            title: "Reference",
            links: [
              { label: "Glossary", href: "/glossary" },
              { label: "Frequently asked questions", href: "/faq" },
            ],
          },
        ]}
      />
    </div>
  );
}
