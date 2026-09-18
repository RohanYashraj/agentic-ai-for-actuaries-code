import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpenText,
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
      // Chapters with code point at their /code page; the rest at /book.
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
    body: "Tool scripts run on a Python runtime loaded into the page. Edit them and run again; nothing leaves your machine.",
  },
  {
    title: "Live on our server",
    body: "Agent scripts run against Gemini with every tool call streamed as it happens. A shared key and modest limits.",
  },
  {
    title: "In Colab",
    body: "Every chapter opens as a notebook. Bring your own free Google AI Studio key and run without limits.",
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
  "text-cream-100 underline decoration-border underline-offset-4 hover:decoration-gold-400";

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
    <div>
      <JsonLd data={STRUCTURED_DATA} />

      {/* Hero: the launch. The strip runs edge to edge above it and is one
          big link to the book's page; the same run repeats six times and the
          track slides by exactly one run, so the loop is seamless. Only the
          first run is read out. */}
      <section className="overflow-x-clip border-b border-border">
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
                <span>Book launch</span>
                <span className="launch-star">★</span>
                <span>Out now</span>
                <span className="launch-star">★</span>
                <span>Agentic AI for Actuaries</span>
                <span className="launch-star">★</span>
                <span>Free from ACTEX Learning</span>
                <span className="launch-star">★</span>
                <span>Get your copy</span>
                <span className="launch-star">★</span>
              </div>
            ))}
          </div>
        </a>
        <HeroIntro
          className={cn(
            CONTAINER,
            "grid items-center gap-12 pb-20 pt-14 lg:grid-cols-[1fr_1.05fr] lg:gap-8"
          )}
        >
          <div>
            <p data-hero-item className="label-mono">
              Book launch · First edition 2026
            </p>
            <h1
              data-hero-item
              className="mt-4 text-5xl leading-[1.02] sm:text-7xl"
            >
              The book
              <br />
              is <span className="launch-word">out.</span>
            </h1>
            <p
              data-hero-item
              className="mt-5 font-serif text-xl leading-snug text-cream-200 sm:text-2xl"
            >
              Agentic AI for Actuaries, free from ACTEX Learning.
            </p>
            <p
              data-hero-item
              className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground"
            >
              This site is its code companion: every listing from chapters 9
              to 17, runnable in your browser, live on our server, or in
              Colab.
            </p>
            <div
              data-hero-item
              className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
            >
              <Button asChild size="lg" className="launch-cta w-full sm:w-auto">
                <a href={ACTEX_BOOK_URL} target="_blank" rel="noreferrer">
                  <BookOpenText size={16} weight="bold" aria-hidden="true" />
                  Get the book, free
                  <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="/code">
                  <Terminal size={16} aria-hidden="true" />
                  Run the code
                </Link>
              </Button>
            </div>
            {/* The publisher's mark and the address in plain sight, for
                readers who want to see where the button goes before they
                press it. One link, so the logo and the URL act as one. */}
            <a
              data-hero-item
              href={ACTEX_BOOK_URL}
              target="_blank"
              rel="noreferrer"
              className="launch-publisher mt-5"
            >
              <span className="label-mono launch-publisher-label">
                Published by
              </span>
              <Image
                src="/actex-learning-logo.svg"
                alt="ACTEX Learning"
                width={200}
                height={29}
                className="launch-publisher-logo"
              />
              <span className="launch-url">
                actexlearning.com/textbooks/agentic-ai-for-actuaries
                <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
              </span>
            </a>
          </div>
          {/* On a phone the cover leads and the words follow; from lg
              the words sit left and the cover right. */}
          <div
            data-hero-cover
            className="relative order-first flex justify-center lg:order-none lg:justify-end"
          >
            <div className="book-glow" aria-hidden="true" />
            {/* The seal sits on the wrapper, not inside .book-cover, so the
                cover's perspective tilt does not skew it. */}
            <div className="relative">
              <div className="book-cover">
                <Image
                  src="/book-cover-photo.png"
                  alt="Cover of Agentic AI for Actuaries"
                  width={520}
                  height={716}
                  priority
                  className="h-auto w-[300px] rounded-sm sm:w-[400px] lg:w-[480px] xl:w-[520px]"
                />
              </div>
              <LaunchSeal />
            </div>
          </div>
        </HeroIntro>
      </section>

      {/* The nine code chapters */}
      <section className="border-b border-border">
        <RevealOnScroll className={cn(CONTAINER, "py-16")}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label-mono">Parts III to V</p>
              <h2 className="mt-2">Nine chapters of runnable code</h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/code">Run the code</Link>
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
                    className="group flex h-full flex-col rounded-md border border-border bg-card p-5 transition-colors hover:border-gold-400"
                  >
                    <span className="inline-flex size-9 items-center justify-center rounded-sm bg-gold-400 font-mono text-sm font-medium text-navy-950">
                      {chapter.number}
                    </span>
                    <span className="mt-3 font-serif text-lg leading-snug text-cream-100 group-hover:underline">
                      {chapter.title}
                    </span>
                    <span className="mt-1.5 text-xs text-muted-foreground">
                      {chapter.domain}
                    </span>
                    <span className="mt-auto flex flex-wrap gap-x-3 pt-4 font-mono text-[11px] text-muted-foreground">
                      {demos > 0 && <span>{demos} in the browser</span>}
                      {agents > 0 && <span>{agents} live</span>}
                      <span>Colab</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </RevealOnScroll>
      </section>

      {/* Three ways to run */}
      <section className="border-b border-border bg-navy-800">
        <RevealOnScroll className={cn(CONTAINER, "py-16")}>
          <h2>Three ways to run it</h2>
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            {WAYS.map((mode) => (
              <div key={mode.title} className="border-t-2 border-gold-400 pt-4">
                <h3 className="text-base font-semibold">{mode.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {mode.body}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            Everything you need is on the{" "}
            <Link href="/setup" className={LINK}>
              setup page
            </Link>
            . All datasets are synthetic; see{" "}
            <Link href="/data" className={LINK}>
              the data
            </Link>
            .
          </p>
        </RevealOnScroll>
      </section>

      {/* Featured live agent */}
      {ch09 && featuredScript && featuredAgent && (
        <section className="border-b border-border">
          <div className={cn(CONTAINER, "py-16")}>
            <p className="label-mono">Chapter 9</p>
            <h2 className="mt-2">Watch an agent work</h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
              The book&rsquo;s first agent, run on our server with every tool
              call streamed as it happens.
            </p>
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

      {/* About the book */}
      <section className="border-b border-border">
        <RevealOnScroll
          className={cn(CONTAINER, "grid gap-10 py-16 lg:grid-cols-[1fr_1.4fr]")}
        >
          <div>
            <h2>About the book</h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              {BOOK_PROMISE}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="bg-gold-400 text-navy-950 hover:bg-gold-300">
                <a href={ACTEX_BOOK_URL} target="_blank" rel="noreferrer">
                  Get the book, free
                  <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href="/book">What&rsquo;s inside</Link>
              </Button>
            </div>
          </div>
          <dl className="grid gap-6 sm:grid-cols-2">
            {FACTS.map(([n, label, note]) => (
              <div key={label} className="border-l-2 border-gold-400 pl-4">
                <dt className="sr-only">{label}</dt>
                <dd>
                  <span className="font-serif text-3xl text-cream-100">{n}</span>
                  <span className="label-mono ml-2">{label}</span>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {note}
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </RevealOnScroll>
      </section>

      {/* Authors, in brief */}
      <section>
        <RevealOnScroll className={cn(CONTAINER, "py-16")}>
          <h2>The authors</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            {AUTHORS.map((author) => (
              <div key={author.slug} className="flex gap-4">
                {author.image && (
                  <Image
                    src={author.image}
                    alt={`Portrait of ${author.name}`}
                    width={72}
                    height={72}
                    className="size-18 shrink-0 rounded-sm border border-border object-cover"
                  />
                )}
                <div>
                  <h3 className="font-serif text-lg text-cream-100">
                    <Link href="/book#authors" className="hover:underline">
                      {[author.honorificPrefix, author.name]
                        .filter(Boolean)
                        .join(" ")}
                    </Link>
                  </h3>
                  {author.honorificSuffix && (
                    <p className="font-mono text-[11px] text-gold-300">
                      {author.honorificSuffix}
                    </p>
                  )}
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {author.cardBio}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            In collaboration with the{" "}
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
        </RevealOnScroll>
      </section>
    </div>
  );
}
