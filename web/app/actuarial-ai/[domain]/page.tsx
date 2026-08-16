import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { RelatedLinks } from "@/components/related-links";
import { Button } from "@/components/ui/button";
import { CHAPTER_CONTENT } from "@/lib/chapter-content";
import { DOMAINS, domainPath, getDomain } from "@/lib/domains";
import { relatedForDomain } from "@/lib/graph";
import { chapterPath, getOutlineChapter } from "@/lib/outline";
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
  return DOMAINS.map((d) => ({ domain: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain: slug } = await params;
  const domain = getDomain(slug);
  if (!domain) return { title: "Practice domain" };
  return pageMetadata({
    title: domain.headline,
    description: domain.blurb,
    path: domainPath(domain.slug),
    keywords: domain.workflows.map((w) => w.title),
  });
}

export default async function DomainPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain: slug } = await params;
  const domain = getDomain(slug);
  if (!domain) notFound();

  const chapter = getOutlineChapter(domain.chapter);
  const vignette = CHAPTER_CONTENT[domain.chapter]?.vignette;

  const trail = [
    { name: SITE_NAME, path: "/" },
    { name: "Practice domains", path: "/actuarial-ai" },
    { name: domain.name, path: domainPath(domain.slug) },
  ];

  const structuredData = graph(
    breadcrumbList(trail),
    {
      "@type": "Article",
      "@id": absolute(domainPath(domain.slug)),
      headline: domain.headline,
      description: domain.blurb,
      abstract: domain.intro[0],
      inLanguage: "en",
      url: absolute(domainPath(domain.slug)),
      isPartOf: { "@id": ID.website },
      about: { "@id": ID.book },
      author: authorRefs(),
      mentions: domain.workflows.map((w) => ({
        "@type": "Thing",
        name: w.title,
        description: w.blurb,
      })),
    },
    {
      "@type": "FAQPage",
      "@id": `${absolute(domainPath(domain.slug))}#faq`,
      mainEntity: domain.questions.map((q) => ({
        "@type": "Question",
        name: q.question,
        acceptedAnswer: { "@type": "Answer", text: q.answer },
      })),
    }
  );

  return (
    <div className={cn(CONTAINER, "py-10")}>
      <JsonLd data={structuredData} />
      <Breadcrumbs trail={trail} />

      <header className="mt-6 max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-gold-400">
          Practice domain
        </p>
        <h1 className="mt-2 text-3xl leading-tight sm:text-4xl">
          {domain.headline}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {domain.blurb}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild size="sm">
            <Link href={chapterPath(domain.chapter)}>
              Read Chapter {domain.chapter}
            </Link>
          </Button>
          {domain.codeSlugs[0] && (
            <Button asChild size="sm" variant="outline">
              <Link href={`/code/${domain.codeSlugs[0]}`}>Run the code</Link>
            </Button>
          )}
        </div>
      </header>

      {vignette && (
        <figure className="mt-10 max-w-3xl border-l-2 border-gold-400/50 pl-5">
          <blockquote className="font-serif text-lg leading-relaxed text-cream-200">
            {vignette}
          </blockquote>
          <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Opening of Chapter {domain.chapter}
            {chapter ? `: ${chapter.title}` : ""}
          </figcaption>
        </figure>
      )}

      <section className="mt-10 max-w-3xl space-y-5">
        {domain.intro.map((para) => (
          <p key={para.slice(0, 48)} className="text-base leading-relaxed">
            {para}
          </p>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl leading-tight">Where agents are used</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Each workflow names what the agent does and, explicitly, what stays
          with the qualified professional.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {domain.workflows.map((workflow) => (
            <li
              key={workflow.title}
              className="rounded-md border border-border bg-card p-5"
            >
              <h3 className="text-base leading-snug text-cream-100">
                {workflow.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {workflow.blurb}
              </p>
              <p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
                <span className="font-mono uppercase tracking-[0.14em] text-gold-300">
                  Human retains
                </span>
                <span className="mt-1 block">{workflow.humanRetains}</span>
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section id="faq" className="mt-12 max-w-3xl scroll-mt-24">
        <h2 className="text-2xl leading-tight">Common questions</h2>
        <dl className="mt-6 divide-y divide-border border-t border-border">
          {domain.questions.map((q) => (
            <div key={q.question} className="py-5">
              <dt className="font-serif text-lg text-cream-100">{q.question}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {q.answer}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <RelatedLinks groups={relatedForDomain(domain.slug)} />
    </div>
  );
}
