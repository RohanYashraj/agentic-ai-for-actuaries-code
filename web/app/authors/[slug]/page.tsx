import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { FactSection } from "@/components/fact-section";
import { JsonLd } from "@/components/json-ld";
import { RelatedLinks } from "@/components/related-links";
import { chapterPath } from "@/lib/outline";
import {
  absolute,
  authorId,
  authorPath,
  breadcrumbList,
  graph,
  ID,
  pageMetadata,
} from "@/lib/seo";
import { AUTHORS, getAuthor, SITE_NAME } from "@/lib/site";
import { cn, CONTAINER } from "@/lib/utils";

export function generateStaticParams() {
  return AUTHORS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthor(slug);
  if (!author) return { title: "Author" };
  const fullName = [author.honorificPrefix, author.name]
    .filter(Boolean)
    .join(" ");
  return pageMetadata({
    title: fullName,
    description: author.bio ?? "",
    path: authorPath(author),
    ogType: "article",
  });
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const author = getAuthor(slug);
  if (!author) notFound();

  const fullName = [author.honorificPrefix, author.name]
    .filter(Boolean)
    .join(" ");

  const trail = [
    { name: SITE_NAME, path: "/" },
    { name: "The authors", path: "/authors" },
    { name: author.name, path: authorPath(author) },
  ];

  const structuredData = graph(breadcrumbList(trail), {
    "@type": "Person",
    "@id": authorId(author),
    name: author.name,
    ...(author.honorificPrefix
      ? { honorificPrefix: author.honorificPrefix }
      : {}),
    ...(author.honorificSuffix
      ? { honorificSuffix: author.honorificSuffix }
      : {}),
    jobTitle: author.jobTitle,
    description: author.bio,
    url: absolute(authorPath(author)),
    ...(author.image ? { image: absolute(author.image) } : {}),
    affiliation: {
      "@type": "Organization",
      name: author.affiliation,
    },
    ...(author.knowsAbout ? { knowsAbout: author.knowsAbout } : {}),
    ...(author.links?.length
      ? { sameAs: author.links.map((l) => l.url) }
      : {}),
    workExample: { "@id": ID.book },
  });

  return (
    <div className={cn(CONTAINER, "py-10")}>
      <JsonLd data={structuredData} />
      <Breadcrumbs trail={trail} />

      <header className="mt-6 flex max-w-3xl flex-wrap items-start gap-5">
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
          <h1 className="text-3xl leading-tight sm:text-4xl">{fullName}</h1>
          {author.honorificSuffix && (
            <p className="mt-1.5 font-mono text-xs text-gold-400">
              {author.honorificSuffix}
            </p>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            {author.jobTitle} · {author.affiliation}
          </p>
          {author.links && author.links.length > 0 && (
            <p className="mt-3 flex flex-wrap gap-4">
              {author.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-cream-100"
                >
                  {link.label}
                  <ArrowUpRight size={12} aria-hidden="true" />
                </a>
              ))}
            </p>
          )}
        </div>
      </header>

      {author.biography && (
        <section className="mt-10 max-w-3xl space-y-5">
          {author.biography.map((para) => (
            <p key={para.slice(0, 48)} className="text-base leading-relaxed">
              {para}
            </p>
          ))}
        </section>
      )}

      <FactSection
        title="Roles"
        items={(author.roles ?? []).map((r) => `${r.title}, ${r.org}`)}
      />
      <FactSection title="Publications" items={author.publications ?? []} />
      <FactSection
        title="Teaching and supervision"
        items={author.teaching ?? []}
      />
      <FactSection title="Selected platforms" items={author.speaking ?? []} />

      {author.research && (
        <section className="mt-10 max-w-3xl rounded-md border border-border bg-card px-5 py-4">
          <h3 className="text-base font-semibold">Research interests</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {author.research}
          </p>
        </section>
      )}

      {author.relationToBook && (
        <section className="mt-6 max-w-3xl rounded-md border border-gold-400/25 bg-gold-400/5 px-5 py-5">
          <h3 className="text-base font-semibold">On this book</h3>
          <p className="mt-3 text-base leading-relaxed">
            {author.relationToBook}
          </p>
        </section>
      )}

      <RelatedLinks
        groups={[
          {
            title: "The book",
            links: [
              { label: "All eighteen chapters", href: "/book" },
              {
                label: "Chapter 1: The AI Landscape",
                href: chapterPath(1),
              },
              { label: "Practice domains", href: "/actuarial-ai" },
            ],
          },
          {
            title: "Co-author",
            links: AUTHORS.filter((a) => a.slug !== author.slug).map((a) => ({
              label: [a.honorificPrefix, a.name].filter(Boolean).join(" "),
              href: authorPath(a),
            })),
          },
          {
            title: "Reference",
            links: [
              { label: "Sources and standards", href: "/resources" },
              { label: "Run the code", href: "/code" },
            ],
          },
        ]}
      />
    </div>
  );
}
