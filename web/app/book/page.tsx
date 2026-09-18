import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";
import { ACTEX_BOOK_URL } from "@/lib/links";
import {
  BOOK_PROMISE,
  OUTLINE,
  TARGET_READERS,
  joinReaders,
} from "@/lib/outline";
import { absolute, breadcrumbList, graph, ID, pageMetadata } from "@/lib/seo";
import { AUTHORS, BOOK_SUBTITLE, SITE_NAME } from "@/lib/site";
import { cn, CONTAINER } from "@/lib/utils";

const DESCRIPTION =
  "Agentic AI for Actuaries: eighteen chapters in five parts, published by ACTEX Learning and free to read. What it covers, where to get it, and who wrote it.";

export const metadata: Metadata = pageMetadata({
  title: "The book",
  description: DESCRIPTION,
  path: "/book",
  ogType: "book",
});

const TRAIL = [
  { name: SITE_NAME, path: "/" },
  { name: "The book", path: "/book" },
];

const LINK =
  "text-cream-100 underline decoration-border underline-offset-4 hover:decoration-gold-400";

export default function BookPage() {
  const structuredData = graph(breadcrumbList(TRAIL), {
    "@type": "WebPage",
    "@id": absolute("/book"),
    name: `The book · ${SITE_NAME}`,
    description: DESCRIPTION,
    url: absolute("/book"),
    isPartOf: { "@id": ID.website },
    about: { "@id": ID.book },
  });

  return (
    <div className={cn(CONTAINER, "py-10")}>
      <JsonLd data={structuredData} />
      <Breadcrumbs trail={TRAIL} />

      <header className="mt-6 grid items-start gap-10 lg:grid-cols-[1fr_300px]">
        <div className="max-w-3xl">
          <p className="label-mono">First edition · 2026 · ACTEX Learning</p>
          <h1 className="mt-2 text-3xl leading-tight sm:text-4xl">
            Agentic AI for Actuaries
          </h1>
          <p className="mt-2 font-serif text-lg text-muted-foreground">{BOOK_SUBTITLE}</p>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            {BOOK_PROMISE}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Written for {joinReaders(TARGET_READERS)}.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="bg-gold-400 text-navy-950 hover:bg-gold-300">
              <a href={ACTEX_BOOK_URL} target="_blank" rel="noreferrer">
                Get the book, free
                <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link href="/code">Run the code</Link>
            </Button>
          </div>
        </div>
        <a
          href={ACTEX_BOOK_URL}
          target="_blank"
          rel="noreferrer"
          className="book-cover mx-auto block w-[220px] lg:w-full"
        >
          <Image
            src="/book-cover-photo.png"
            alt="Cover of Agentic AI for Actuaries"
            width={520}
            height={716}
            className="h-auto w-full rounded-sm"
          />
        </a>
      </header>

      <section className="mt-14">
        <h2>What&rsquo;s inside</h2>
        <div className="mt-6 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {OUTLINE.map((part) => (
            <div key={part.roman} className="border-t-2 border-gold-400 pt-4">
              <p className="label-mono">Part {part.roman}</p>
              <h3 className="mt-1 font-serif text-lg text-cream-100">{part.title}</h3>
              <ol className="mt-3 space-y-1.5 text-sm">
                {part.chapters.map((ch) => (
                  <li
                    key={ch.number}
                    className="grid grid-cols-[28px_1fr] gap-x-2 leading-snug"
                  >
                    <span className="font-mono text-xs text-muted-foreground">
                      {ch.number}
                    </span>
                    {ch.slug ? (
                      <Link href={`/code/${ch.slug}`} className={LINK}>
                        {ch.title}
                        <span className="ml-1.5 rounded-sm bg-gold-400/10 px-1 font-mono text-[10px] text-gold-300">
                          code
                        </span>
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">{ch.title}</span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <section id="authors" className="mt-14 scroll-mt-24">
        <h2>The authors</h2>
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          {AUTHORS.map((author) => (
            <article key={author.slug} className="flex gap-4">
              {author.image && (
                <Image
                  src={author.image}
                  alt={`Portrait of ${author.name}`}
                  width={96}
                  height={96}
                  className="size-24 shrink-0 rounded-sm border border-border object-cover"
                />
              )}
              <div>
                <h3 className="font-serif text-lg text-cream-100">
                  {[author.honorificPrefix, author.name]
                    .filter(Boolean)
                    .join(" ")}
                </h3>
                {author.honorificSuffix && (
                  <p className="font-mono text-[11px] text-gold-300">
                    {author.honorificSuffix}
                  </p>
                )}
                {author.jobTitle && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {author.jobTitle}
                    {author.affiliation ? `, ${author.affiliation}` : ""}
                  </p>
                )}
                {(author.biography ?? [author.cardBio])
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((para, i) => (
                    <p
                      key={i}
                      className="mt-2 text-sm leading-relaxed text-muted-foreground"
                    >
                      {para}
                    </p>
                  ))}
                {author.links?.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-cream-100"
                  >
                    {link.label}
                    <ArrowUpRight size={12} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Foreword by, and in collaboration with, the{" "}
          <a
            href="https://sssia.org"
            target="_blank"
            rel="noreferrer"
            className="text-cream-100 underline underline-offset-2"
          >
            Sri Sathya Sai Institute of Actuaries
          </a>
          .
        </p>
      </section>
    </div>
  );
}
