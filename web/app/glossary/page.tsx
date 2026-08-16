import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { RelatedLinks } from "@/components/related-links";
import { CONCEPTS, conceptPath } from "@/lib/concepts";
import { GLOSSARY, glossarySlug } from "@/lib/glossary";
import { CHAPTER_LIST, chapterPath } from "@/lib/outline";
import { absolute, breadcrumbList, graph, ID, pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import { cn, CONTAINER } from "@/lib/utils";

const DESCRIPTION =
  "The vocabulary of agentic AI, defined for actuaries: agent, tool use, retrieval-augmented generation, hallucination, drift, execution trace, and the rest of the terms the book works from.";

export const metadata: Metadata = pageMetadata({
  title: "Glossary",
  description: DESCRIPTION,
  path: "/glossary",
});

const TRAIL = [
  { name: SITE_NAME, path: "/" },
  { name: "Glossary", path: "/glossary" },
];

/** Chapters whose title or one-liner names this term, so each definition
 * points back into the book rather than sitting on its own. */
function chaptersMentioning(term: string) {
  const needle = term.toLowerCase();
  return CHAPTER_LIST.filter((c) =>
    `${c.title} ${c.oneLiner}`.toLowerCase().includes(needle)
  ).slice(0, 3);
}

export default function GlossaryPage() {
  const terms = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));

  const structuredData = graph(breadcrumbList(TRAIL), {
    "@type": "DefinedTermSet",
    "@id": absolute("/glossary"),
    name: `Glossary · ${SITE_NAME}`,
    description: DESCRIPTION,
    url: absolute("/glossary"),
    inLanguage: "en",
    isPartOf: { "@id": ID.website },
    hasDefinedTerm: terms.map((t) => ({
      "@type": "DefinedTerm",
      "@id": `${absolute("/glossary")}#${glossarySlug(t.term)}`,
      name: t.term,
      description: t.definition,
      inDefinedTermSet: { "@id": absolute("/glossary") },
    })),
  });

  return (
    <div className={cn(CONTAINER, "py-10")}>
      <JsonLd data={structuredData} />
      <Breadcrumbs trail={TRAIL} />

      <header className="mt-6 max-w-3xl">
        <h1 className="text-3xl leading-tight sm:text-4xl">Glossary</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Selected terms used throughout the book, with brief definitions
          emphasising the actuarial reading where AI and actuarial usage
          diverge.
        </p>
      </header>

      <nav
        aria-label="Jump to term"
        className="mt-8 flex flex-wrap gap-x-3 gap-y-1.5 font-mono text-xs"
      >
        {terms.map((t) => (
          <a
            key={t.term}
            href={`#${glossarySlug(t.term)}`}
            className="text-muted-foreground transition-colors hover:text-gold-300"
          >
            {t.term}
          </a>
        ))}
      </nav>

      <dl className="mt-10 max-w-3xl divide-y divide-border border-t border-border">
        {terms.map((t) => {
          const mentions = chaptersMentioning(t.term);
          const concept = CONCEPTS.find((c) => c.glossaryTerm === t.term);
          return (
            <div key={t.term} id={glossarySlug(t.term)} className="scroll-mt-24 py-5">
              <dt className="font-serif text-xl text-cream-100">{t.term}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t.definition}
              </dd>
              {concept && (
                <dd className="mt-2 text-sm">
                  <Link
                    href={conceptPath(concept.slug)}
                    className="text-cream-200 underline decoration-border underline-offset-4 hover:decoration-gold-400"
                  >
                    {concept.title} in depth
                  </Link>
                </dd>
              )}
              {mentions.length > 0 && (
                <dd className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px]">
                  {mentions.map((c) => (
                    <Link
                      key={c.number}
                      href={chapterPath(c.number)}
                      className="text-muted-foreground transition-colors hover:text-gold-300"
                    >
                      Chapter {c.number}
                    </Link>
                  ))}
                </dd>
              )}
            </div>
          );
        })}
      </dl>

      <RelatedLinks
        groups={[
          {
            title: "Concepts in depth",
            links: CONCEPTS.map((c) => ({
              label: c.title,
              href: conceptPath(c.slug),
            })),
          },
          {
            title: "The book",
            links: [
              { label: "All eighteen chapters", href: "/book" },
              { label: "Practice domains", href: "/actuarial-ai" },
            ],
          },
          {
            title: "Runnable code",
            links: [{ label: "Run the code", href: "/code" }],
          },
        ]}
      />
    </div>
  );
}
