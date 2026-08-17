import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { GlossaryList } from "@/components/glossary-list";
import { JsonLd } from "@/components/json-ld";
import { RelatedLinks } from "@/components/related-links";
import { CONCEPTS, conceptPath } from "@/lib/concepts";
import { GLOSSARY, glossarySlug } from "@/lib/glossary";
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

      <GlossaryList
        entries={terms.map((t) => {
          const concept = CONCEPTS.find((c) => c.glossaryTerm === t.term);
          return {
            term: t.term,
            slug: glossarySlug(t.term),
            definition: t.definition,
            conceptTitle: concept ? concept.title : undefined,
            conceptHref: concept ? conceptPath(concept.slug) : undefined,
          };
        })}
      />

      <RelatedLinks
        groups={[
          {
            title: "Concepts in depth",
            links: [{ label: "All eight concepts", href: "/concepts" }],
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
