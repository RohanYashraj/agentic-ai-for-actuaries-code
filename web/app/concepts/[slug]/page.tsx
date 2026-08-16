import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { RelatedLinks } from "@/components/related-links";
import { CONCEPTS, conceptPath, getConcept } from "@/lib/concepts";
import { GLOSSARY, glossarySlug } from "@/lib/glossary";
import { relatedForConcept } from "@/lib/graph";
import {
  absolute,
  authorRefs,
  breadcrumbList,
  graph,
  ID,
  pageMetadata,
} from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import { cn, CONTAINER } from "@/lib/utils";

export function generateStaticParams() {
  return CONCEPTS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const concept = getConcept(slug);
  if (!concept) return { title: "Concept" };
  return pageMetadata({
    title: concept.title,
    description: concept.summary,
    path: conceptPath(concept.slug),
    ogType: "article",
  });
}

export default async function ConceptPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const concept = getConcept(slug);
  if (!concept) notFound();

  const definition = GLOSSARY.find((g) => g.term === concept.glossaryTerm);

  const trail = [
    { name: SITE_NAME, path: "/" },
    { name: "Concepts", path: "/glossary" },
    { name: concept.title, path: conceptPath(concept.slug) },
  ];

  const structuredData = graph(
    breadcrumbList(trail),
    {
      "@type": "DefinedTerm",
      "@id": `${absolute("/glossary")}#${glossarySlug(concept.glossaryTerm)}`,
      name: concept.glossaryTerm,
      description: definition?.definition ?? concept.summary,
      inDefinedTermSet: { "@id": absolute("/glossary") },
      url: absolute(conceptPath(concept.slug)),
    },
    {
      "@type": "Article",
      "@id": absolute(conceptPath(concept.slug)),
      headline: concept.title,
      description: concept.summary,
      abstract: concept.summary,
      inLanguage: "en",
      url: absolute(conceptPath(concept.slug)),
      isPartOf: { "@id": ID.website },
      about: {
        "@id": `${absolute("/glossary")}#${glossarySlug(concept.glossaryTerm)}`,
      },
      author: authorRefs(),
    }
  );

  return (
    <div className={cn(CONTAINER, "py-10")}>
      <JsonLd data={structuredData} />
      <Breadcrumbs trail={trail} />

      <header className="mt-6 max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-gold-400">
          Concept
        </p>
        <h1 className="mt-2 text-3xl leading-tight sm:text-4xl">
          {concept.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {concept.summary}
        </p>
      </header>

      {definition && (
        <aside className="mt-8 max-w-3xl rounded-md border border-border bg-card px-5 py-4">
          <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-gold-300">
            In one definition
          </h2>
          <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
            <span className="text-cream-200">{definition.term}.</span>{" "}
            {definition.definition}
          </p>
        </aside>
      )}

      <section className="mt-10 max-w-3xl space-y-5">
        {concept.body.map((para) => (
          <p key={para.slice(0, 48)} className="text-base leading-relaxed">
            {para}
          </p>
        ))}
      </section>

      <section className="mt-10 max-w-3xl rounded-md border border-gold-400/25 bg-gold-400/5 px-5 py-5">
        <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-gold-300">
          Why it matters for actuaries
        </h2>
        <p className="mt-3 text-base leading-relaxed">{concept.whyItMatters}</p>
      </section>

      <RelatedLinks groups={relatedForConcept(concept.slug)} />
    </div>
  );
}
