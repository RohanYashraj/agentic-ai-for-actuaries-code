import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { DOMAINS } from "@/lib/domains";
import { chapterPath, BOOK_PROMISE, OUTLINE, TARGET_READERS } from "@/lib/outline";
import { absolute, breadcrumbList, graph, ID, pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import { cn, CONTAINER } from "@/lib/utils";

const DESCRIPTION =
  "All eighteen chapters of Agentic AI for Actuaries, across five parts: AI foundations, working with large language models, agentic architecture, the four actuarial practice domains, and production governance.";

export const metadata: Metadata = pageMetadata({
  title: "The book",
  description: DESCRIPTION,
  path: "/book",
});

const TRAIL = [
  { name: SITE_NAME, path: "/" },
  { name: "The book", path: "/book" },
];

export default function BookPage() {
  const structuredData = graph(
    breadcrumbList(TRAIL),
    {
      "@type": "CollectionPage",
      "@id": absolute("/book"),
      name: `The book · ${SITE_NAME}`,
      description: DESCRIPTION,
      url: absolute("/book"),
      isPartOf: { "@id": ID.website },
      about: { "@id": ID.book },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: 18,
        itemListElement: OUTLINE.flatMap((part) =>
          part.chapters.map((ch) => ({
            "@type": "ListItem",
            position: ch.number,
            url: absolute(chapterPath(ch.number)),
            name: `Chapter ${ch.number}: ${ch.title}`,
          }))
        ),
      },
    }
  );

  return (
    <div className={cn(CONTAINER, "py-10")}>
      <JsonLd data={structuredData} />
      <Breadcrumbs trail={TRAIL} />

      <header className="mt-6 max-w-3xl">
        <h1 className="text-3xl leading-tight sm:text-4xl">
          Eighteen chapters, five parts
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {BOOK_PROMISE}
        </p>
        <div className="mt-5">
          <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-gold-300">
            Written for
          </h2>
          <ul className="mt-2.5 space-y-1.5 text-sm text-muted-foreground">
            {TARGET_READERS.map((reader) => (
              <li key={reader} className="flex gap-2">
                <span aria-hidden="true" className="text-gold-400">
                  ·
                </span>
                {reader}
              </li>
            ))}
          </ul>
        </div>
      </header>

      <div className="mt-12 space-y-14">
        {OUTLINE.map((part) => (
          <section key={part.roman}>
            <div className="max-w-3xl">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-gold-400">
                Part {part.roman} · {part.approach}
              </p>
              <h2 className="mt-2 text-2xl leading-tight">{part.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {part.blurb}
              </p>
            </div>

            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {part.chapters.map((ch) => {
                const domain = DOMAINS.find((d) => d.chapter === ch.number);
                return (
                  <li key={ch.number}>
                    <Link
                      href={chapterPath(ch.number)}
                      className="group flex h-full flex-col rounded-md border border-border bg-card p-5 transition-colors hover:border-gold-400/50"
                    >
                      <p className="font-mono text-xs text-gold-400">
                        Chapter {ch.number}
                      </p>
                      <h3 className="mt-1.5 text-lg leading-snug text-cream-100">
                        {ch.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {ch.oneLiner}
                      </p>
                      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                        <span className="text-cream-200">Case study.</span>{" "}
                        {ch.caseStudy}
                      </p>
                      <p className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-3 font-mono text-[11px] text-muted-foreground">
                        {domain && <span>{domain.name}</span>}
                        {ch.slug && (
                          <span className="text-gold-300">Runnable code</span>
                        )}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-14 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Chapters 9 to 17 ship with companion code you can run without
        installing anything.{" "}
        <Link
          href="/code"
          className="text-cream-200 underline decoration-border underline-offset-4 hover:decoration-gold-400"
        >
          Run the code
        </Link>
        , or read the definitions the book works from in the{" "}
        <Link
          href="/glossary"
          className="text-cream-200 underline decoration-border underline-offset-4 hover:decoration-gold-400"
        >
          glossary
        </Link>
        .
      </p>
    </div>
  );
}
