import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpenText, GithubLogo, Terminal } from "@phosphor-icons/react/dist/ssr";
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
import { getPartOf } from "@/lib/outline";
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
  const part = getPartOf(chapter.number);
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
    <div className={cn(CONTAINER, "py-12")}>
      <JsonLd data={structuredData} />
      <Breadcrumbs trail={trail} />

      <header className="mt-8 max-w-3xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-xs font-semibold text-amber-300">
            <BookOpenText size={13} weight="bold" />
            <span>Chapter {chapter.number}</span>
          </span>
          <span className="text-slate-500">·</span>
          <span className="font-mono text-xs text-slate-400">
            Part {chapter.part}
          </span>
          <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-0.5 font-mono text-[11px] text-amber-300 font-medium">
            {chapter.domain}
          </span>
        </div>

        <h1 className="mt-4 text-3xl sm:text-5xl font-serif text-white font-bold tracking-tight leading-[1.1]">
          {chapter.title}
        </h1>

        <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-300">
          {chapter.blurb}
        </p>

        {part && (
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            In the published book: <strong className="text-slate-200">Part {part.roman} ({part.title})</strong>.
          </p>
        )}

        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild size="default" className="launch-cta h-10 px-4 text-xs sm:text-sm font-semibold">
            <a href="#listings">
              <Terminal size={16} />
              <span>Run listings below</span>
            </a>
          </Button>
          <Button
            asChild
            size="default"
            variant="outline"
            className="h-10 px-4 text-xs sm:text-sm border-white/15 bg-white/5 text-white hover:bg-white/10"
          >
            <a href={colabUrl(chapter.slug)} target="_blank" rel="noreferrer">
              <span>Open in Colab</span>
              <ArrowUpRight size={13} />
            </a>
          </Button>
          <Button
            asChild
            size="default"
            variant="outline"
            className="h-10 px-4 text-xs sm:text-sm border-white/15 bg-white/5 text-white hover:bg-white/10"
          >
            <a
              href={`${GITHUB_REPO}/tree/main/${chapter.folder}`}
              target="_blank"
              rel="noreferrer"
            >
              <GithubLogo size={15} />
              <span>GitHub</span>
            </a>
          </Button>
        </div>
      </header>

      {concepts.length > 0 && (
        <section className="mt-10 card-glass p-5 sm:p-6 max-w-3xl border-l-4 border-l-amber-400">
          <h3 className="text-base font-semibold text-white">What you&rsquo;ll build</h3>
          <ul className="mt-3 space-y-2 text-xs sm:text-sm text-slate-300">
            {concepts.map((c) => (
              <li key={c} className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5 select-none">✦</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id="listings" className="mt-12 scroll-mt-24 space-y-8">
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
        <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4 text-xs sm:text-sm text-slate-400">
          Shared helper modules for this chapter live in{" "}
          {chapter.extras.map((f, i) => (
            <span key={f}>
              {i > 0 && ", "}
              <a
                href={`${GITHUB_REPO}/blob/main/${chapter.folder}/${f}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-amber-300 underline underline-offset-2 hover:text-white"
              >
                {f}
              </a>
            </span>
          ))}
          .
        </div>
      )}

      <RelatedLinks groups={relatedForCodeChapter(chapter.slug)} />

      <nav className="mt-14 flex justify-between border-t border-white/10 pt-6 text-sm">
        {prev ? (
          <Link
            href={`/code/${prev.slug}`}
            className="inline-flex items-center gap-2 text-slate-400 transition-colors hover:text-amber-300 font-medium"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Chapter {prev.number}: {prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/code/${next.slug}`}
            className="inline-flex items-center gap-2 text-right text-slate-400 transition-colors hover:text-amber-300 font-medium ml-auto"
          >
            <span>Chapter {next.number}: {next.title}</span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
