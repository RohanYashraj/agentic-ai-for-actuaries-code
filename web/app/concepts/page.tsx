import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { CONCEPTS, conceptPath } from "@/lib/concepts";
import { absolute, breadcrumbList, graph, ID, pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import { cn, CONTAINER } from "@/lib/utils";

const DESCRIPTION =
  "The eight ideas Agentic AI for Actuaries returns to across chapters: agentic AI, tool use, multi-agent systems, memory, retrieval, hallucination, execution traces, and governance.";

export const metadata: Metadata = pageMetadata({
  title: "Concepts",
  description: DESCRIPTION,
  path: "/concepts",
});

const TRAIL = [
  { name: SITE_NAME, path: "/" },
  { name: "Concepts", path: "/concepts" },
];

const GROUPS: { title: string; slugs: string[] }[] = [
  {
    title: "Core ideas",
    slugs: [
      "agentic-ai",
      "tool-use-function-calling",
      "multi-agent-system",
      "agent-memory",
    ],
  },
  {
    title: "Trust and control",
    slugs: [
      "retrieval-augmented-generation",
      "hallucination",
      "execution-and-evidence-traces",
      "ai-governance",
    ],
  },
];

export default function ConceptsPage() {
  const structuredData = graph(breadcrumbList(TRAIL), {
    "@type": "CollectionPage",
    "@id": absolute("/concepts"),
    name: `Concepts · ${SITE_NAME}`,
    description: DESCRIPTION,
    url: absolute("/concepts"),
    isPartOf: { "@id": ID.website },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: CONCEPTS.length,
      itemListElement: CONCEPTS.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absolute(conceptPath(c.slug)),
        name: c.title,
      })),
    },
  });

  return (
    <div className={cn(CONTAINER, "py-10")}>
      <JsonLd data={structuredData} />
      <Breadcrumbs trail={TRAIL} />

      <header className="mt-6 max-w-3xl">
        <h1 className="text-3xl leading-tight sm:text-4xl">Concepts</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          A glossary entry defines a term in two sentences. These pages do
          the longer job: how each idea behaves across the whole book, and
          what it asks of actuarial judgement.
        </p>
      </header>

      <div className="mt-10 space-y-12">
        {GROUPS.map((group) => (
          <section key={group.title}>
            <h2>{group.title}</h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {group.slugs.map((slug) => {
                const c = CONCEPTS.find((x) => x.slug === slug);
                if (!c) return null;
                return (
                  <li key={c.slug}>
                    <Link
                      href={conceptPath(c.slug)}
                      className="group flex h-full flex-col rounded-md border border-border bg-card p-5 transition-colors hover:border-gold-400/50"
                    >
                      <h3 className="text-lg leading-snug text-cream-100">
                        {c.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {c.summary}
                      </p>
                      <p className="mt-auto pt-3 font-mono text-xs text-muted-foreground">
                        {c.chapters.length} chapter
                        {c.chapters.length > 1 ? "s" : ""}
                        {c.codeSlugs.length > 0 && " · runnable code"}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
