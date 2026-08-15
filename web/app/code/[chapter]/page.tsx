import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { ScriptCard } from "@/components/script-card";
import { Button } from "@/components/ui/button";
import { AGENT_SCRIPTS } from "@/lib/agents";
import { CHAPTERS, getChapter } from "@/lib/chapters";
import { loadDemoSource, loadManifest } from "@/lib/demos";
import { colabUrl, GITHUB_REPO } from "@/lib/links";
import { SITE_NAME, SITE_URL } from "@/lib/site";
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
  return {
    title: `Chapter ${ch.number}: ${ch.title}`,
    description: ch.blurb,
    alternates: { canonical: `/code/${ch.slug}` },
  };
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
  const index = CHAPTERS.findIndex((c) => c.slug === slug);
  const prev = CHAPTERS[index - 1];
  const next = CHAPTERS[index + 1];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Run the code", item: `${SITE_URL}/code` },
          {
            "@type": "ListItem",
            position: 3,
            name: `Chapter ${chapter.number}: ${chapter.title}`,
            item: `${SITE_URL}/code/${chapter.slug}`,
          },
        ],
      },
      {
        "@type": "TechArticle",
        headline: `Chapter ${chapter.number}: ${chapter.title}`,
        description: chapter.blurb,
        proficiencyLevel: "Beginner",
        isPartOf: { "@type": "Book", name: SITE_NAME, url: SITE_URL },
        url: `${SITE_URL}/code/${chapter.slug}`,
      },
    ],
  };

  return (
    <div className={cn(CONTAINER, "py-10")}>
      <JsonLd data={structuredData} />
      <nav className="font-mono text-xs text-muted-foreground">
        <Link href="/code" className="transition-colors hover:text-cream-100">
          Run the code
        </Link>{" "}
        / {chapter.folder}
      </nav>

      <header className="mt-6 max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-gold-400">
          Chapter {chapter.number}
        </p>
        <h1 className="mt-2 text-3xl leading-tight sm:text-4xl">
          {chapter.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {chapter.blurb}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild size="sm">
            <a href={colabUrl(chapter.slug)} target="_blank" rel="noreferrer">
              Open chapter in Colab
            </a>
          </Button>
          <Button asChild size="sm" variant="outline">
            <a
              href={`${GITHUB_REPO}/tree/main/${chapter.folder}`}
              target="_blank"
              rel="noreferrer"
            >
              Folder on GitHub
            </a>
          </Button>
        </div>
      </header>

      <section className="mt-10 space-y-6">
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
