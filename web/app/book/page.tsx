import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";
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
          The book, chapter by chapter
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {BOOK_PROMISE}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Written for {TARGET_READERS.map((r) => r.charAt(0).toLowerCase() + r.slice(1)).join(", ").replace(/, ([^,]*)$/, ", and $1")}.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="sm">
            <Link href={chapterPath(1)}>Start with Chapter 1</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/book/primer">Read the primer</Link>
          </Button>
        </div>
      </header>

      <div className="mt-12 space-y-14">
        {OUTLINE.map((part) => (
          <section key={part.roman}>
            <div className="max-w-3xl">
              <h2>
                Part {part.roman}. {part.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {part.blurb}
              </p>
            </div>

            <ul className="mt-6 max-w-3xl divide-y divide-border/60 border-t border-border/60">
              {part.chapters.map((ch) => (
                <li key={ch.number}>
                  <Link
                    href={chapterPath(ch.number)}
                    className="grid grid-cols-[44px_1fr] gap-x-3 py-4 transition-colors hover:bg-navy-800/40"
                  >
                    <span className="font-serif text-xl leading-6 text-cream-400">
                      {ch.number}
                    </span>
                    <span>
                      <span className="flex flex-wrap items-baseline gap-x-2 leading-6">
                        <span className="text-[15px] text-cream-100">{ch.title}</span>
                        {ch.slug && (
                          <span className="font-mono text-xs text-gold-300">
                            runnable code
                          </span>
                        )}
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                        {ch.oneLiner}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-14 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Nine chapters ship companion code you can{" "}
        <Link href="/code" className="text-cream-200 underline decoration-border underline-offset-4 hover:decoration-gold-400">
          run without installing anything
        </Link>
        . Prefer the short version? The{" "}
        <Link href="/book/primer" className="text-cream-200 underline decoration-border underline-offset-4 hover:decoration-gold-400">
          primer
        </Link>{" "}
        covers the argument in an afternoon.
      </p>
    </div>
  );
}
