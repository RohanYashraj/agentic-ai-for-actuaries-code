import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpenText, Sparkle, Terminal } from "@phosphor-icons/react/dist/ssr";
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
  "text-slate-200 underline decoration-amber-400/40 underline-offset-4 hover:decoration-amber-400 hover:text-amber-300 transition-colors";

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
    <div className={cn(CONTAINER, "py-12")}>
      <JsonLd data={structuredData} />
      <Breadcrumbs trail={TRAIL} />

      {/* Book Launch Header */}
      <header className="mt-8 grid items-center gap-12 lg:grid-cols-[1.2fr_340px]">
        <div>
          <div className="mb-3">
            <span className="launch-pill">
              <Sparkle size={13} weight="fill" className="text-amber-300" />
              <span>First edition 2026 · ACTEX Learning</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif text-white font-bold tracking-tight leading-[1.1]">
            Agentic AI for Actuaries
          </h1>
          <p className="mt-2.5 font-serif text-xl sm:text-2xl text-amber-300 font-medium">
            {BOOK_SUBTITLE}
          </p>

          <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-300">
            {BOOK_PROMISE}
          </p>

          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-xs sm:text-sm leading-relaxed text-slate-400">
            <span className="font-semibold text-white">Who it is for.</span> Written for {joinReaders(TARGET_READERS)}.
          </div>

          <div className="mt-8 flex flex-wrap gap-3.5">
            <Button asChild size="lg" className="launch-cta h-11 px-5 text-sm">
              <a href={ACTEX_BOOK_URL} target="_blank" rel="noreferrer">
                <BookOpenText size={18} weight="bold" aria-hidden="true" />
                <span>Get the book, free</span>
                <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-11 px-5 text-sm border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              <Link href="/code">
                <Terminal size={16} aria-hidden="true" />
                <span>Run the code</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Book Cover Staging */}
        <div className="relative mx-auto flex justify-center">
          <div className="book-glow opacity-80" aria-hidden="true" />
          <a
            href={ACTEX_BOOK_URL}
            target="_blank"
            rel="noreferrer"
            className="book-cover group relative block w-[230px] sm:w-[280px] lg:w-full"
            aria-label="Download the book on ACTEX Learning"
          >
            <Image
              src="/book-cover-photo.png"
              alt="Cover of Agentic AI for Actuaries"
              width={520}
              height={716}
              priority
              className="h-auto w-full rounded-[0.35rem]"
            />
            <span className="absolute bottom-3 inset-x-3 flex items-center justify-center gap-1.5 rounded-lg bg-black/80 py-2 text-xs font-mono font-semibold text-amber-300 backdrop-blur-md opacity-90 transition-opacity group-hover:opacity-100 border border-amber-400/30">
              <span>Free from ACTEX</span>
              <ArrowUpRight size={13} weight="bold" />
            </span>
          </a>
        </div>
      </header>

      {/* What's Inside: Table of Contents */}
      <section className="mt-16 pt-8 border-t border-white/10">
        <div>
          <p className="label-mono">Five parts, eighteen chapters</p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-serif text-white">What&rsquo;s inside</h2>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            It starts with what AI is and ends with agents in production and who is accountable
            for them. Chapters with a code tag can be run on this site.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {OUTLINE.map((part) => (
            <div
              key={part.roman}
              className="card-glass p-5.5 relative overflow-hidden flex flex-col"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
              <div className="flex items-center justify-between">
                <span className="label-mono text-amber-400">Part {part.roman}</span>
                <span className="text-[11px] font-mono text-slate-400">
                  {part.chapters.length} chapters
                </span>
              </div>
              <h3 className="mt-2 font-serif text-lg text-white font-semibold leading-snug">
                {part.title}
              </h3>
              <ol className="mt-4 space-y-2 text-sm divide-y divide-white/5">
                {part.chapters.map((ch) => (
                  <li
                    key={ch.number}
                    className="grid grid-cols-[28px_1fr] gap-x-2 pt-2 first:pt-0 leading-snug items-baseline"
                  >
                    <span className="font-mono text-xs font-semibold text-amber-400/80">
                      {String(ch.number).padStart(2, "0")}
                    </span>
                    {ch.slug ? (
                      <Link href={`/code/${ch.slug}`} className={LINK}>
                        <span>{ch.title}</span>
                        <span className="ml-2 inline-flex items-center rounded-full bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 font-mono text-[10px] text-emerald-400 font-medium">
                          runnable
                        </span>
                      </Link>
                    ) : (
                      <span className="text-slate-400">{ch.title}</span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      {/* Authors Section */}
      <section id="authors" className="mt-16 scroll-mt-24 pt-8 border-t border-white/10">
        <div>
          <p className="label-mono">Who wrote it</p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-serif text-white">The authors</h2>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            Two actuaries. One has spent thirty years building actuarial technology functions and
            teaching; the other wrote the code in this repository.
          </p>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          {AUTHORS.map((author) => (
            <article key={author.slug} className="card-glass p-6 sm:p-7 flex flex-col sm:flex-row gap-5">
              {author.image && (
                <Image
                  src={author.image}
                  alt={`Portrait of ${author.name}`}
                  width={100}
                  height={100}
                  className="size-24 shrink-0 rounded-xl border border-white/15 object-cover shadow-lg"
                />
              )}
              <div className="flex-1">
                <h3 className="font-serif text-xl text-white font-semibold">
                  {[author.honorificPrefix, author.name]
                    .filter(Boolean)
                    .join(" ")}
                </h3>
                {author.honorificSuffix && (
                  <span className="mt-0.5 inline-block font-mono text-xs text-amber-400 font-semibold">
                    {author.honorificSuffix}
                  </span>
                )}
                {author.jobTitle && (
                  <p className="mt-1 text-xs sm:text-sm text-slate-400">
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
                      className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-300"
                    >
                      {para}
                    </p>
                  ))}
                {author.links && author.links.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {author.links.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-300 transition-colors hover:border-amber-400 hover:text-white"
                      >
                        <span>{link.label}</span>
                        <ArrowUpRight size={12} aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 text-xs sm:text-sm text-slate-500">
          Foreword by, and in collaboration with, the{" "}
          <a
            href="https://sssia.org"
            target="_blank"
            rel="noreferrer"
            className="text-amber-400 underline underline-offset-2 hover:text-amber-300"
          >
            Sri Sathya Sai Institute of Actuaries
          </a>
          .
        </p>
      </section>
    </div>
  );
}
