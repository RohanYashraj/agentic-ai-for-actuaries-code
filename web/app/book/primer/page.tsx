import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { NotifyForm } from "@/components/notify-form";
import { RelatedLinks } from "@/components/related-links";
import { CHAPTER_CONTENT } from "@/lib/chapter-content";
import { chapterPath, OUTLINE } from "@/lib/outline";
import {
  absolute,
  authorRefs,
  breadcrumbList,
  graph,
  ID,
  pageMetadata,
} from "@/lib/seo";
import { AUTHORS, BOOK_SUBTITLE, SITE_NAME } from "@/lib/site";
import { cn, CONTAINER } from "@/lib/utils";

const DESCRIPTION =
  "A Concise Primer: the abridged edition of Agentic AI for Actuaries, distilled from the parent edition into eighteen short chapters covering AI foundations, large language models, agentic architecture, the four actuarial practice domains, and governance.";

export const metadata: Metadata = pageMetadata({
  title: "The primer",
  description: DESCRIPTION,
  path: "/book/primer",
  ogType: "book",
});

const TRAIL = [
  { name: SITE_NAME, path: "/" },
  { name: "The book", path: "/book" },
  { name: "The primer", path: "/book/primer" },
];

/** Two openings, from opposite ends of the book, to show what the prose
 * is actually like rather than describing it. */
const SAMPLE_CHAPTERS = [1, 14];

export default function PrimerPage() {
  const structuredData = graph(breadcrumbList(TRAIL), {
    "@type": "Book",
    "@id": ID.primer,
    name: `${SITE_NAME}: A Concise Primer`,
    alternateName: `${SITE_NAME}: ${BOOK_SUBTITLE}`,
    description: DESCRIPTION,
    inLanguage: "en",
    url: absolute("/book/primer"),
    numberOfPages: undefined,
    isAccessibleForFree: true,
    datePublished: "2026",
    publisher: {
      "@type": "Organization",
      "@id": ID.organization,
      name: "Sri Sathya Sai Institute of Actuaries",
      url: "https://sssia.org",
    },
    author: authorRefs(),
    isBasedOn: { "@id": ID.book },
    about: { "@id": ID.book },
  });

  return (
    <div className={cn(CONTAINER, "py-10")}>
      <JsonLd data={structuredData} />
      <Breadcrumbs trail={TRAIL} />

      <header className="mt-6 max-w-3xl">
        <p className="label-mono">Abridged edition</p>
        <h1 className="mt-2 text-3xl leading-tight sm:text-4xl">
          A Concise Primer
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Distilled from the parent edition into eighteen short chapters. It
          keeps the argument and the worked examples and drops the
          implementation detail — enough to decide what your team should
          adopt, defer, or govern, in an afternoon rather than a fortnight.
          Published by the Sri Sathya Sai Institute of Actuaries.
        </p>
      </header>

      <section className="mt-12">
        <h2 className="font-serif text-2xl leading-tight text-cream-100">
          How it reads
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Every chapter opens on a concrete actuarial situation. Two of them,
          from opposite ends of the book.
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {SAMPLE_CHAPTERS.map((n) => {
            const content = CHAPTER_CONTENT[n];
            if (!content) return null;
            return (
              <figure
                key={n}
                className="border-l-2 border-gold-400/50 pl-5"
              >
                <blockquote className="font-serif text-base leading-relaxed text-cream-200">
                  {content.vignette}
                </blockquote>
                <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  <Link
                    href={chapterPath(n)}
                    className="transition-colors hover:text-gold-300"
                  >
                    Opening of Chapter {n}
                  </Link>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </section>

      <section className="mt-12 max-w-3xl rounded-md border border-gold-400/30 bg-gold-400/5 px-5 py-5">
        <h2 className="font-serif text-xl text-cream-100">
          Get the primer
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Leave your email and we will send the primer when it is released,
          along with news of the full edition. In the meantime, every chapter
          on this site carries its opening, its argument in summary, and its
          closing.
        </p>
        <div className="mt-4">
          <NotifyForm />
        </div>
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="font-serif text-2xl leading-tight text-cream-100">
          Contents
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          {OUTLINE.map((part) => (
            <li key={part.roman}>
              <span className="font-serif text-cream-100">
                Part {part.roman}.
              </span>{" "}
              {part.title}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm">
          <Link
            href="/book"
            className="text-cream-200 underline decoration-border underline-offset-4 hover:decoration-gold-400"
          >
            Full contents, chapter by chapter
          </Link>
        </p>
      </section>

      <p className="mt-12 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Written by{" "}
        {AUTHORS.map((a, i) => (
          <span key={a.slug}>
            {i > 0 && " and "}
            <Link
              href={`/authors/${a.slug}`}
              className="text-cream-200 underline decoration-border underline-offset-4 hover:decoration-gold-400"
            >
              {[a.honorificPrefix, a.name].filter(Boolean).join(" ")}
            </Link>
          </span>
        ))}
        .
      </p>

      <RelatedLinks
        groups={[
          {
            title: "Read now",
            links: [
              { label: "All eighteen chapters", href: "/book" },
              { label: "Practice domains", href: "/actuarial-ai" },
              { label: "Glossary", href: "/glossary" },
            ],
          },
          {
            title: "Run the code",
            links: [{ label: "Every listing, runnable", href: "/code" }],
          },
          {
            title: "More",
            links: [
              { label: "Frequently asked questions", href: "/faq" },
              { label: "Sources and standards", href: "/resources" },
            ],
          },
        ]}
      />
    </div>
  );
}
