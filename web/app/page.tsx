import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpenText,
  Play,
  Sparkle,
  Terminal,
} from "@phosphor-icons/react/dist/ssr";
import { JsonLd } from "@/components/json-ld";
import { LaunchSeal } from "@/components/launch-seal";
import { HeroIntro } from "@/components/motion/hero-intro";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { ScriptCard } from "@/components/script-card";
import { Button } from "@/components/ui/button";
import { AGENT_SCRIPTS } from "@/lib/agents";
import { CHAPTERS, getChapter } from "@/lib/chapters";
import { ACTEX_BOOK_URL } from "@/lib/links";
import { BOOK_PROMISE, OUTLINE } from "@/lib/outline";
import {
  AUTHORS,
  BOOK_DESCRIPTION,
  BOOK_KEYWORDS,
  BOOK_SUBTITLE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";
import { cn, CONTAINER } from "@/lib/utils";

// Person nodes are referenced by @id from the Book so authors are one
// entity in the graph rather than two copies.
const AUTHOR_NODES = AUTHORS.map((a) => ({
  "@type": "Person",
  "@id": `${SITE_URL}/#${a.name.toLowerCase().replace(/\s+/g, "-")}`,
  name: a.name,
  ...(a.honorificPrefix ? { honorificPrefix: a.honorificPrefix } : {}),
  ...(a.honorificSuffix ? { honorificSuffix: a.honorificSuffix } : {}),
  ...(a.jobTitle ? { jobTitle: a.jobTitle } : {}),
  ...(a.affiliation
    ? { affiliation: { "@type": "Organization", name: a.affiliation } }
    : {}),
  ...(a.bio ? { description: a.bio } : {}),
  knowsAbout: ["Actuarial science", "Agentic AI", "Insurance analytics"],
}));

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    ...AUTHOR_NODES,
    {
      "@type": "Book",
      "@id": `${SITE_URL}/#book`,
      name: SITE_NAME,
      alternateName: `${SITE_NAME}: ${BOOK_SUBTITLE}`,
      description: BOOK_DESCRIPTION,
      abstract: BOOK_PROMISE,
      bookFormat: "https://schema.org/Hardcover",
      publisher: { "@type": "Organization", name: "ACTEX Learning" },
      datePublished: "2026",
      sameAs: ACTEX_BOOK_URL,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: ACTEX_BOOK_URL,
        seller: { "@type": "Organization", name: "ACTEX Learning" },
      },
      inLanguage: "en",
      keywords: BOOK_KEYWORDS.join(", "),
      about: BOOK_KEYWORDS.map((k) => ({ "@type": "Thing", name: k })),
      audience: {
        "@type": "Audience",
        audienceType: "Actuaries, actuarial students, and actuarial leaders",
      },
      image: `${SITE_URL}/book-cover-photo.png`,
      url: SITE_URL,
      author: AUTHOR_NODES.map((a) => ({ "@id": a["@id"] })),
      hasPart: OUTLINE.flatMap((part) =>
        part.chapters.map((ch) => {
          const url = ch.slug
            ? `${SITE_URL}/code/${ch.slug}`
            : `${SITE_URL}/book`;
          return {
            "@type": "Chapter",
            "@id": url,
            position: ch.number,
            name: `Chapter ${ch.number}: ${ch.title}`,
            abstract: ch.oneLiner,
            url,
          };
        })
      ),
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      inLanguage: "en",
      about: { "@id": `${SITE_URL}/#book` },
      author: AUTHOR_NODES.map((a) => ({ "@id": a["@id"] })),
    },
  ],
};

export const metadata = { alternates: { canonical: "/" } };

const WAYS = [
  {
    title: "In your browser",
    tag: "No setup",
    color: "from-emerald-400 to-teal-500",
    badge: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
    body: "The tool scripts run on Python compiled to WebAssembly, right in the page. Change a number, run it again. Nothing leaves your machine.",
  },
  {
    title: "Live on our server",
    tag: "Gemini + Agno",
    color: "from-cyan-400 to-blue-500",
    badge: "border-cyan-500/30 text-cyan-400 bg-cyan-500/10",
    body: "The agent scripts need a model, so they run on our server against Gemini. You see each tool call and the reply as they happen.",
  },
  {
    title: "In Google Colab",
    tag: "Your own key",
    color: "from-amber-400 to-orange-500",
    badge: "border-amber-500/30 text-amber-400 bg-amber-500/10",
    body: "Every chapter opens as a notebook. Add a free Google AI Studio key and run the whole thing, with no shared limits.",
  },
];

const FACTS: [string, string, string][] = [
  ["18", "chapters", "in five parts, from AI literacy to production governance"],
  ["9", "with code", "chapters 9 to 17, every listing runnable"],
  ["4", "practice domains", "pricing, reserving, life and pensions, risk"],
  [
    "1",
    "fictional reinsurer",
    "Meridian Re, whose synthetic data every example uses",
  ],
];

const LINK =
  "text-white underline decoration-amber-400/50 underline-offset-4 hover:decoration-amber-400 hover:text-amber-300 transition-colors";

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

export default function LandingPage() {
  const ch09 = getChapter("ch09");
  const featuredScript = ch09?.scripts.find((s) => s.agentId);
  const featuredAgent = featuredScript?.agentId
    ? AGENT_SCRIPTS.find((a) => a.id === featuredScript.agentId)
    : undefined;

  return (
    <div className="relative">
      <JsonLd data={STRUCTURED_DATA} />

      {/* Hero: Celebratory Launch Strip */}
      <section className="overflow-x-clip border-b border-white/10">
        <a
          href={ACTEX_BOOK_URL}
          target="_blank"
          rel="noreferrer"
          className="launch-strip"
          aria-label="Book launch: Agentic AI for Actuaries is out now, free from ACTEX Learning. Open the book's page"
        >
          <div className="launch-strip-track">
            {Array.from({ length: 6 }, (_, run) => (
              <div
                key={run}
                className="launch-strip-run"
                aria-hidden={run > 0 ? "true" : undefined}
              >
                <span>The book is out</span>
                <span className="launch-star">★</span>
                <span>Agentic AI for Actuaries</span>
                <span className="launch-star">★</span>
                <span>First edition, 2026</span>
                <span className="launch-star">★</span>
                <span>Free from ACTEX Learning</span>
                <span className="launch-star">★</span>
              </div>
            ))}
          </div>
        </a>

        {/* Hero Section */}
        <div className="relative">
          {/* Subtle luminous ambient background glows */}
          <div
            className="pointer-events-none absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute right-1/4 top-10 h-[30rem] w-[30rem] rounded-full bg-orange-600/15 blur-3xl"
            aria-hidden="true"
          />

          <HeroIntro
            className={cn(
              CONTAINER,
              "grid items-center gap-8 pb-12 pt-8 sm:pt-10 lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:pb-14"
            )}
          >
            <div>
              {/* Celebratory Pill */}
              <div data-hero-item className="mb-3">
                <span className="launch-pill">
                  <Sparkle size={13} weight="fill" className="text-amber-300" />
                  <span>First edition 2026 · ACTEX Learning</span>
                </span>
              </div>

              {/* Bold Title */}
              <h1
                data-hero-item
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.25rem] font-serif font-bold tracking-tight text-white leading-[1.05]"
              >
                The book is{" "}
                <span className="launch-word">out.</span>
              </h1>

              {/* Sub-headline */}
              <p
                data-hero-item
                className="mt-3 font-serif text-lg sm:text-xl text-slate-100 font-medium leading-snug"
              >
                Agentic AI for Actuaries{" "}
                <span className="text-amber-400 font-sans text-sm font-normal block sm:inline">
                  free to read and download
                </span>
              </p>

              {/* Body explanation */}
              <p
                data-hero-item
                className="mt-3 max-w-lg text-base leading-relaxed text-slate-300"
              >
                A practical guide for actuaries who want to build, run, and
                govern AI agents, starting from no AI background at all. This
                site holds the book&rsquo;s code, and you can run it here.
              </p>

              {/* Dual Action CTAs */}
              <div
                data-hero-item
                className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap"
              >
                <Button asChild size="lg" className="launch-cta w-full sm:w-auto h-11 px-5 text-sm">
                  <a href={ACTEX_BOOK_URL} target="_blank" rel="noreferrer">
                    <BookOpenText size={20} weight="bold" aria-hidden="true" />
                    <span>Get the book, free</span>
                    <ArrowUpRight size={16} weight="bold" aria-hidden="true" />
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto h-11 px-5 text-sm border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-white/30"
                >
                  <Link href="/code">
                    <Terminal size={18} aria-hidden="true" />
                    <span>Run the code</span>
                  </Link>
                </Button>
              </div>

              {/* Publisher lockup card */}
              <a
                data-hero-item
                href={ACTEX_BOOK_URL}
                target="_blank"
                rel="noreferrer"
                className="launch-publisher mt-5"
              >
                <span className="launch-publisher-label">
                  Published by
                </span>
                <Image
                  src="/actex-learning-logo.svg"
                  alt="ACTEX Learning"
                  width={210}
                  height={31}
                  className="launch-publisher-logo"
                />
                <span className="launch-url">
                  actexlearning.com/textbooks/agentic-ai-for-actuaries
                  <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                </span>
              </a>
            </div>

            {/* 3D Book Cover Staging */}
            <div
              data-hero-cover
              className="relative order-first flex justify-center lg:order-none lg:justify-end"
            >
              <div className="book-glow" aria-hidden="true" />
              <div className="relative">
                <div className="book-cover">
                  <Image
                    src="/book-cover-photo.png"
                    alt="Cover of Agentic AI for Actuaries"
                    width={520}
                    height={716}
                    priority
                    className="h-auto w-[260px] rounded-[0.35rem] sm:w-[340px] lg:w-[420px] xl:w-[460px]"
                  />
                </div>
                <LaunchSeal />
              </div>
            </div>
          </HeroIntro>
        </div>
      </section>

      {/* Stats Ribbon */}
      <div className="border-b border-white/10 bg-[#060913]/70 backdrop-blur-xl py-6">
        <div className={cn(CONTAINER, "grid grid-cols-2 gap-6 sm:grid-cols-4")}>
          {[
            { n: "18", label: "Chapters", desc: "Five parts, from first principles to governance" },
            { n: "9", label: "With code", desc: "Chapters 9 to 17, every listing runs" },
            { n: "4", label: "Practice areas", desc: "Pricing, reserving, life, risk" },
            { n: "0", label: "Cost", desc: "Book free at ACTEX, code on GitHub" },
          ].map((stat) => (
            <div key={stat.label} className="border-l-2 border-amber-500/70 pl-3.5">
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif text-2xl sm:text-3xl font-bold text-white">{stat.n}</span>
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-amber-400">{stat.label}</span>
              </div>
              <p className="mt-0.5 text-xs text-slate-400">{stat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* The Nine Code Chapters Section */}
      <section className="border-b border-white/10 py-16">
        <RevealOnScroll className={CONTAINER}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label-mono">Parts III to V</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-serif text-white">
                Nine chapters of runnable code
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Each chapter works a case at Meridian Re, a fictional reinsurer. Pick one and press Run.
              </p>
            </div>
            <Button asChild variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
              <Link href="/code">All listings →</Link>
            </Button>
          </div>

          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CHAPTERS.map((chapter) => {
              const demos = chapter.scripts.filter((s) => s.demoId).length;
              const agents = chapter.scripts.filter(
                (s) =>
                  s.agentId &&
                  AGENT_SCRIPTS.find((a) => a.id === s.agentId)?.runnable
              ).length;
              return (
                <li key={chapter.slug}>
                  <Link
                    href={`/code/${chapter.slug}`}
                    className="group card-glass flex h-full flex-col p-5.5 transition-all duration-300 hover:border-amber-400/40 hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 font-mono text-sm font-bold text-navy-950 shadow-sm shadow-amber-500/20">
                        {chapter.number}
                      </span>
                      <span className="rounded-full bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 font-mono text-[11px] text-amber-300 font-medium">
                        {chapter.domain}
                      </span>
                    </div>

                    <span className="mt-3.5 font-serif text-lg leading-snug text-white group-hover:text-amber-300 transition-colors">
                      {chapter.title}
                    </span>

                    <span className="mt-2 text-xs leading-relaxed text-slate-400 line-clamp-2">
                      {chapter.blurb}
                    </span>

                    <div className="mt-auto flex flex-wrap items-center gap-2 pt-4 font-mono text-[11px]">
                      {demos > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-emerald-400">
                          <Play size={10} weight="fill" />
                          {demos} browser demo{demos > 1 ? "s" : ""}
                        </span>
                      )}
                      {agents > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-cyan-400">
                          <Sparkle size={10} weight="fill" />
                          {agents} live agent{agents > 1 ? "s" : ""}
                        </span>
                      )}
                      <span className="text-slate-500 ml-auto group-hover:text-amber-400 transition-colors font-medium">
                        Run →
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </RevealOnScroll>
      </section>

      {/* Three Ways to Run */}
      <section className="border-b border-white/10 bg-[#060913]/60 py-16">
        <RevealOnScroll className={CONTAINER}>
          <p className="label-mono">Running it</p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-serif text-white">Three ways to run the code</h2>
          <p className="mt-2 text-sm text-slate-400">
            Start in the browser. Move to Colab when you want to change more than a few lines.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {WAYS.map((mode) => (
              <div
                key={mode.title}
                className="card-glass p-6 relative overflow-hidden"
              >
                <div
                  className={cn(
                    "absolute top-0 inset-x-0 h-1 bg-gradient-to-r",
                    mode.color
                  )}
                />
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white">{mode.title}</h3>
                  <span className={cn("text-[11px] font-mono px-2 py-0.5 rounded-full border", mode.badge)}>
                    {mode.tag}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  {mode.body}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-sm text-slate-400">
            Keys, Colab steps, and local install are on the{" "}
            <Link href="/setup" className={LINK}>
              setup page
            </Link>
            . The datasets are synthetic, and described on{" "}
            <Link href="/data" className={LINK}>
              the data page
            </Link>
            .
          </p>
        </RevealOnScroll>
      </section>

      {/* Featured Live Agent Showcase */}
      {ch09 && featuredScript && featuredAgent && (
        <section className="border-b border-white/10 py-16">
          <div className={CONTAINER}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="label-mono">Chapter 9</p>
                <h2 className="mt-2 text-2xl sm:text-3xl font-serif text-white">
                  Watch an agent work live
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
                  The first agent in the book. Press Run and it executes on our server,
                  with each tool call shown as it happens.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 font-mono text-xs text-cyan-300">
                <span className="size-2 rounded-full bg-cyan-400 animate-ping" />
                Live
              </span>
            </div>

            <div className="mt-8">
              <ScriptCard
                script={featuredScript}
                chapter={ch09}
                demoSpec={undefined}
                demoSource={undefined}
                agentEntry={featuredAgent}
                originalSource={readOriginal(ch09.folder, featuredScript.file)}
              />
            </div>
          </div>
        </section>
      )}

      {/* About the Book & Facts */}
      <section className="border-b border-white/10 py-16">
        <RevealOnScroll
          className={cn(CONTAINER, "grid gap-12 lg:grid-cols-[1.1fr_1.3fr] items-center")}
        >
          <div>
            <p className="label-mono">The book</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-serif text-white">
              What the book covers
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-300">
              {BOOK_PROMISE}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className="launch-cta">
                <a href={ACTEX_BOOK_URL} target="_blank" rel="noreferrer">
                  <BookOpenText size={16} weight="bold" aria-hidden="true" />
                  Get the book, free
                  <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                </a>
              </Button>
              <Button asChild variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                <Link href="/book">Table of contents →</Link>
              </Button>
            </div>
          </div>

          <dl className="grid gap-5 sm:grid-cols-2">
            {FACTS.map(([n, label, note]) => (
              <div
                key={label}
                className="card-glass p-5 border-l-4 border-l-amber-400"
              >
                <dt className="sr-only">{label}</dt>
                <dd>
                  <span className="font-serif text-3xl font-bold text-white">{n}</span>
                  <span className="label-mono ml-2.5 text-amber-400">{label}</span>
                  <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-400">
                    {note}
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </RevealOnScroll>
      </section>

      {/* Authors in Brief */}
      <section className="py-16">
        <RevealOnScroll className={CONTAINER}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label-mono">Authors</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-serif text-white">The authors</h2>
              <p className="mt-2 text-sm text-slate-400">
                Two actuaries, one who has run actuarial technology teams for thirty years and one who writes the code.
              </p>
            </div>
            <Link
              href="/book#authors"
              className="text-sm text-amber-400 hover:text-amber-300 underline underline-offset-4"
            >
              Full biographies →
            </Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {AUTHORS.map((author) => (
              <div
                key={author.slug}
                className="card-glass flex gap-4 p-5 sm:p-6"
              >
                {author.image && (
                  <Image
                    src={author.image}
                    alt={`Portrait of ${author.name}`}
                    width={80}
                    height={80}
                    className="size-20 shrink-0 rounded-xl border border-white/15 object-cover shadow-md"
                  />
                )}
                <div>
                  <h3 className="font-serif text-lg text-white font-semibold">
                    <Link href="/book#authors" className="hover:text-amber-300 transition-colors">
                      {[author.honorificPrefix, author.name]
                        .filter(Boolean)
                        .join(" ")}
                    </Link>
                  </h3>
                  {author.honorificSuffix && (
                    <span className="mt-0.5 inline-block font-mono text-[11px] text-amber-400 font-medium">
                      {author.honorificSuffix}
                    </span>
                  )}
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-300">
                    {author.cardBio}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs sm:text-sm text-slate-500">
            Written with the{" "}
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
        </RevealOnScroll>
      </section>
    </div>
  );
}
