import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { RelatedLinks } from "@/components/related-links";
import { ScriptCard } from "@/components/script-card";
import { Button } from "@/components/ui/button";
import { AGENT_SCRIPTS } from "@/lib/agents";
import { CHAPTER_CONCEPTS } from "@/lib/book";
import { CHAPTERS, getChapter } from "@/lib/chapters";
import { loadDemoSource, loadManifest } from "@/lib/demos";
import { relatedForCodeChapter } from "@/lib/graph";
import { colabUrl, GITHUB_REPO } from "@/lib/links";
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
  return CHAPTERS.map((c) => ({ chapter: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapter: string }>;
}): Promise<Metadata> {
  const { chapter } = await params;
  const ch = getChapter(chapter);
  if (!ch) return { title: "Chapter" };
  return pageMetadata({
    title: `Chapter ${ch.number}: ${ch.title}`,
    description: ch.blurb,
    path: `/code/${ch.slug}`,
    keywords: CHAPTER_CONCEPTS[ch.number]?.slice(0, 6),
    ogType: "article",
  });
}

function readOriginal(folder: string, file: string): string | undefined {
  try {
    return fs.readFileSync(
      path.join(process.cwd(), "..", folder, file),
      "utf-8"
    );
  } catch {
    return undefined;
  }
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ chapter: string }>;
}) {
  const { chapter: slug } = await params;
  const chapter = getChapter(slug);
  if (!chapter) notFound();

  const manifest = loadManifest();
  const concepts = CHAPTER_CONCEPTS[chapter.number] ?? [];
  const index = CHAPTERS.findIndex((c) => c.slug === slug);
  const prev = CHAPTERS[index - 1];
  const next = CHAPTERS[index + 1];

  const trail = [
    { name: SITE_NAME, path: "/" },
    { name: "Run the code", path: "/code" },
    { name: `Chapter ${chapter.number}`, path: `/code/${chapter.slug}` },
  ];

  const structuredData = graph(breadcrumbList(trail), {
    "@type": "TechArticle",
    "@id": absolute(`/code/${chapter.slug}`),
    headline: `Chapter ${chapter.number}: ${chapter.title}`,
    description: chapter.blurb,
    proficiencyLevel: "Beginner",
    inLanguage: "en",
    isPartOf: { "@id": ID.book },
    author: authorRefs(),
    about: concepts.map((c) => ({ "@type": "Thing", name: c })),
    url: absolute(`/code/${chapter.slug}`),
    programmingLanguage: "Python",
    hasPart: chapter.scripts.map((s) => ({
      "@type": "SoftwareSourceCode",
      name: s.file,
      description: s.description,
      programmingLanguage: "Python",
      codeRepository: GITHUB_REPO,
      codeSampleType: "full solution",
    })),
  });

  return (
    <div className={cn(CONTAINER, "py-10")}>
      <JsonLd data={structuredData} />
      <Breadcrumbs trail={trail} />

      <header className="mt-6 max-w-3xl">
        <p className="label-mono">Chapter {chapter.number}</p>
        <h1 className="mt-2 text-3xl leading-tight sm:text-4xl">
          {chapter.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {chapter.blurb}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild size="sm">
            <a href="#listings">Run it here</a>
          </Button>
          <Button asChild size="sm" variant="outline">
            <a href={colabUrl(chapter.slug)} target="_blank" rel="noreferrer">
              Open in Colab
            </a>
          </Button>
          <Button asChild size="sm" variant="outline">
            <a
              href={`${GITHUB_REPO}/tree/main/${chapter.folder}`}
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </Button>
        </div>
      </header>

      {concepts.length > 0 && (
        <section className="mt-8 max-w-3xl rounded-md border border-border bg-card px-5 py-4">
          <h3 className="text-base font-semibold">What you&rsquo;ll build</h3>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            {concepts.map((c) => (
              <li key={c} className="list-disc marker:text-gold-400 ml-4">
                {c}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id="listings" className="mt-10 scroll-mt-24 space-y-6">
        {chapter.scripts.map((script) => {
          const demoSpec = script.demoId ? manifest[script.demoId] : undefined;
          const agentEntry = script.agentId
            ? AGENT_SCRIPTS.find((a) => a.id === script.agentId)
            : undefined;
          return (
            <ScriptCard
              key={script.file}
              script={script}
              chapter={chapter}
              demoSpec={demoSpec}
              demoSource={demoSpec ? loadDemoSource(demoSpec) : undefined}
              agentEntry={agentEntry}
              originalSource={
                !demoSpec || agentEntry
                  ? readOriginal(chapter.folder, script.file)
                  : undefined
              }
            />
          );
        })}
      </section>

      {chapter.extras && chapter.extras.length > 0 && (
        <p className="mt-6 text-sm text-muted-foreground">
          Shared helpers for this chapter live in{" "}
          {chapter.extras.map((f, i) => (
            <span key={f}>
              {i > 0 && ", "}
              <a
                href={`${GITHUB_REPO}/blob/main/${chapter.folder}/${f}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-cream-200 underline underline-offset-2"
              >
                {f}
              </a>
            </span>
          ))}
          .
        </p>
      )}

      <RelatedLinks groups={relatedForCodeChapter(chapter.slug)} />

      <nav className="mt-12 flex justify-between border-t border-border pt-6 text-sm">
        {prev ? (
          <Link
            href={`/code/${prev.slug}`}
            className="text-muted-foreground transition-colors hover:text-cream-100"
          >
            ← Chapter {prev.number}: {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/code/${next.slug}`}
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
