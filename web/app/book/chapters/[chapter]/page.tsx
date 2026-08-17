import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { NextStep } from "@/components/next-step";
import { RelatedLinks } from "@/components/related-links";
import { Button } from "@/components/ui/button";
import { CHAPTER_CONCEPTS } from "@/lib/book";
import { CHAPTER_CONTENT } from "@/lib/chapter-content";
import { getChapter } from "@/lib/chapters";
import { conceptPath } from "@/lib/concepts";
import { domainForChapter, domainPath } from "@/lib/domains";
import { glossarySlug } from "@/lib/glossary";
import {
  conceptsForChapter,
  relatedForChapter,
  termsForChapter,
} from "@/lib/graph";
import {
  CHAPTER_LIST,
  chapterPath,
  getOutlineChapter,
  getPartOf,
  prevNextChapter,
} from "@/lib/outline";
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
  return CHAPTER_LIST.map((c) => ({
    chapter: String(c.number).padStart(2, "0"),
  }));
}

/** URLs are zero-padded; anything else is a 404 rather than a duplicate. */
function parseChapterParam(value: string): number | undefined {
  if (!/^\d{2}$/.test(value)) return undefined;
  const n = Number(value);
  return getOutlineChapter(n) ? n : undefined;
}

function describe(n: number): string {
  const ch = getOutlineChapter(n);
  return ch ? ch.oneLiner : "";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapter: string }>;
}): Promise<Metadata> {
  const { chapter } = await params;
  const n = parseChapterParam(chapter);
  if (!n) return { title: "Chapter" };
  const ch = getOutlineChapter(n);
  if (!ch) return { title: "Chapter" };
  return pageMetadata({
    title: `Chapter ${n}: ${ch.title}`,
    description: describe(n),
    path: chapterPath(n),
    keywords: CHAPTER_CONCEPTS[n]?.slice(0, 6),
    ogType: "article",
  });
}

export default async function BookChapterPage({
  params,
}: {
  params: Promise<{ chapter: string }>;
}) {
  const { chapter: param } = await params;
  const n = parseChapterParam(param);
  if (!n) notFound();

  const chapter = getOutlineChapter(n);
  const part = getPartOf(n);
  if (!chapter || !part) notFound();

  const content = CHAPTER_CONTENT[n];
  const concepts = CHAPTER_CONCEPTS[n] ?? [];
  const domain = domainForChapter(n);
  const { prev, next } = prevNextChapter(n);
  const code = chapter.slug ? getChapter(chapter.slug) : undefined;

  const relatedTerms = termsForChapter(n);
  const relatedConcepts = conceptsForChapter(n);

  const trail = [
    { name: SITE_NAME, path: "/" },
    { name: "The book", path: "/book" },
    { name: `Chapter ${n}`, path: chapterPath(n) },
  ];

  const structuredData = graph(breadcrumbList(trail), {
    "@type": "TechArticle",
    "@id": absolute(chapterPath(n)),
    headline: `Chapter ${n}: ${chapter.title}`,
    description: chapter.oneLiner,
    abstract: content?.summary[0],
    inLanguage: "en",
    proficiencyLevel: n <= 8 ? "Beginner" : "Intermediate",
    url: absolute(chapterPath(n)),
    isPartOf: { "@id": ID.book },
    position: n,
    author: authorRefs(),
    about: concepts.map((c) => ({ "@type": "Thing", name: c })),
    mentions: relatedTerms.map((t) => ({
      "@type": "DefinedTerm",
      "@id": `${absolute("/glossary")}#${glossarySlug(t.term)}`,
      name: t.term,
    })),
    ...(code ? { programmingLanguage: "Python" } : {}),
  });

  return (
    <div className={cn(CONTAINER, "py-10")}>
      <JsonLd data={structuredData} />
      <Breadcrumbs trail={trail} />

      <header className="mt-6 max-w-3xl">
        <p className="label-mono">
          Part {part.roman} · Chapter {n}
        </p>
        <h1 className="mt-2 text-3xl leading-tight sm:text-4xl">
          {chapter.title}
        </h1>
        {content?.subtitle && (
          <p className="mt-2 font-serif text-lg text-cream-200">
            {content.subtitle}
          </p>
        )}
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {chapter.oneLiner}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {code ? (
            <Button asChild size="sm">
              <Link href={`/code/${code.slug}`}>Run this chapter&rsquo;s code</Link>
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline">
              <Link href="/book/primer">Read the primer version</Link>
            </Button>
          )}
        </div>
      </header>

      {content && (
        <figure className="mt-10 max-w-3xl border-l-2 border-gold-400/50 pl-5">
          <blockquote className="font-serif text-lg leading-relaxed text-cream-200">
            {content.vignette}
          </blockquote>
          <figcaption className="label-mono mt-3 text-muted-foreground">
            Opening of Chapter {n}
          </figcaption>
        </figure>
      )}

      {content && (
        <section className="mt-10 max-w-3xl space-y-5">
          <h2>In this chapter</h2>
          {content.summary.map((para) => (
            <p key={para.slice(0, 48)} className="text-base leading-relaxed">
              {para}
            </p>
          ))}
        </section>
      )}

      <div className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
        {concepts.length > 0 && (
          <section className="rounded-md border border-border bg-card px-5 py-4">
            <h3 className="text-base font-semibold">Key concepts</h3>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              {concepts.map((c) => (
                <li key={c} className="list-disc marker:text-gold-400 ml-4">
                  {c}
                </li>
              ))}
            </ul>
            {relatedConcepts.length > 0 && (
              <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
                In depth:{" "}
                {relatedConcepts.map((rc, i) => (
                  <span key={rc.slug}>
                    {i > 0 && ", "}
                    <Link
                      href={conceptPath(rc.slug)}
                      className="text-cream-200 underline decoration-border underline-offset-4 hover:decoration-gold-400"
                    >
                      {rc.title}
                    </Link>
                  </span>
                ))}
              </p>
            )}
          </section>
        )}

        <section className="rounded-md border border-border bg-card px-5 py-4">
          <h3 className="text-base font-semibold">Case study</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {chapter.caseStudy}
          </p>
          {domain && (
            <p className="mt-4 text-sm">
              <Link
                href={domainPath(domain.slug)}
                className="text-cream-200 underline decoration-border underline-offset-4 hover:decoration-gold-400"
              >
                In practice: {domain.name}
              </Link>
            </p>
          )}
        </section>
      </div>

      {content && (
        <section className="mt-10 max-w-3xl">
          <h2>Where it leaves you</h2>
          <p className="mt-3 text-base leading-relaxed">{content.closing}</p>
        </section>
      )}

      {code ? (
        <NextStep
          heading="Run what you just read"
          description={`${code.scripts.length} listing${code.scripts.length > 1 ? "s" : ""}, runnable in your browser or live on our server.`}
          href={`/code/${code.slug}#listings`}
          cta="Run it here"
          secondaryHref={next ? chapterPath(next.number) : undefined}
          secondaryLabel={next ? `Next: Chapter ${next.number}` : undefined}
        />
      ) : next ? (
        <NextStep
          heading="Keep going"
          description={`Chapter ${next.number}: ${next.title}.`}
          href={chapterPath(next.number)}
          cta={`Read Chapter ${next.number}`}
          secondaryHref="/book/primer"
          secondaryLabel="Or read the primer"
        />
      ) : (
        <NextStep
          heading="You've reached the end of the outline"
          description="The full edition arrives later this year, free from ACTEX."
          href="/#notify"
          cta="Get launch updates"
          secondaryHref="/actuarial-ai"
          secondaryLabel="Explore the practice domains"
        />
      )}

      <RelatedLinks
        groups={relatedForChapter(n).filter(
          (g) => !(code && g.title === "Runnable code")
        )}
      />

      <nav className="mt-12 flex justify-between gap-6 border-t border-border pt-6 text-sm">
        {prev ? (
          <Link
            href={chapterPath(prev.number)}
            className="text-muted-foreground transition-colors hover:text-cream-100"
          >
            ← Chapter {prev.number}: {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={chapterPath(next.number)}
            className="text-right text-muted-foreground transition-colors hover:text-cream-100"
          >
            Chapter {next.number}: {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
