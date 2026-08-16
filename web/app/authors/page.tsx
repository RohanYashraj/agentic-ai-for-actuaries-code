import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { RelatedLinks } from "@/components/related-links";
import {
  absolute,
  authorId,
  authorPath,
  breadcrumbList,
  graph,
  ID,
  pageMetadata,
} from "@/lib/seo";
import { AUTHORS, SITE_NAME } from "@/lib/site";
import { cn, CONTAINER } from "@/lib/utils";

const DESCRIPTION =
  "Satya Sai Mudigonda and Dr Rohan Yashraj Gupta, the authors of Agentic AI for Actuaries: qualifications, research, publications, and teaching.";

export const metadata: Metadata = pageMetadata({
  title: "The authors",
  description: DESCRIPTION,
  path: "/authors",
});

const TRAIL = [
  { name: SITE_NAME, path: "/" },
  { name: "The authors", path: "/authors" },
];

export default function AuthorsPage() {
  const structuredData = graph(breadcrumbList(TRAIL), {
    "@type": "CollectionPage",
    "@id": absolute("/authors"),
    name: `The authors · ${SITE_NAME}`,
    description: DESCRIPTION,
    url: absolute("/authors"),
    isPartOf: { "@id": ID.website },
    about: { "@id": ID.book },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: AUTHORS.length,
      itemListElement: AUTHORS.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absolute(authorPath(a)),
        name: a.name,
      })),
    },
  });

  return (
    <div className={cn(CONTAINER, "py-10")}>
      <JsonLd data={structuredData} />
      <Breadcrumbs trail={TRAIL} />

      <header className="mt-6 max-w-3xl">
        <h1 className="text-3xl leading-tight sm:text-4xl">The authors</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {SITE_NAME} is written by two actuaries whose work sits at the
          intersection of actuarial practice, data science, and artificial
          intelligence, in collaboration with the Sri Sathya Sai Institute of
          Actuaries.
        </p>
      </header>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {AUTHORS.map((author) => (
          <article
            key={author.slug}
            className="flex flex-col rounded-md border border-border bg-card p-5"
          >
            <div className="flex gap-4">
              {author.image && (
                <Image
                  src={author.image}
                  alt={`Portrait of ${author.name}`}
                  width={72}
                  height={72}
                  className="size-18 shrink-0 rounded-sm border border-border object-cover"
                />
              )}
              <div>
                <h2 className="font-serif text-lg text-cream-100">
                  <Link href={authorPath(author)} className="hover:underline">
                    {[author.honorificPrefix, author.name]
                      .filter(Boolean)
                      .join(" ")}
                  </Link>
                </h2>
                {author.honorificSuffix && (
                  <p className="font-mono text-[11px] text-gold-400">
                    {author.honorificSuffix.split(", ").join(" · ")}
                  </p>
                )}
                <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                  {author.jobTitle} · {author.affiliation}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {author.cardBio}
            </p>
            <p className="mt-auto pt-4 text-sm">
              <Link
                href={authorPath(author)}
                className="text-cream-200 underline decoration-border underline-offset-4 hover:decoration-gold-400"
              >
                Full profile
              </Link>
            </p>
          </article>
        ))}
      </div>

      <RelatedLinks
        groups={[
          {
            title: "The book",
            links: [
              { label: "All eighteen chapters", href: "/book" },
              { label: "Practice domains", href: "/actuarial-ai" },
            ],
          },
          {
            title: "Reference",
            links: [
              { label: "Sources and standards", href: "/resources" },
              { label: "Glossary", href: "/glossary" },
            ],
          },
        ]}
      />
    </div>
  );
}
