import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpenText,
  GithubLogo,
  Terminal,
} from "@phosphor-icons/react/dist/ssr";
import { JsonLd } from "@/components/json-ld";
import { HeroIntro } from "@/components/motion/hero-intro";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { PartAccordion, type AccordionPart } from "@/components/part-accordion";
import { StatValue } from "@/components/stat-value";
import { ScriptCard } from "@/components/script-card";
import { Button } from "@/components/ui/button";
import { cn, CONTAINER } from "@/lib/utils";
import { AGENT_SCRIPTS } from "@/lib/agents";
import { getChapter } from "@/lib/chapters";
import { LaunchSeal } from "@/components/launch-seal";
import { ACTEX_BOOK_URL, GITHUB_REPO } from "@/lib/links";
import {
  BOOK_PROMISE,
  chapterPath,
  joinReaders,
  OUTLINE,
  TARGET_READERS,
} from "@/lib/outline";
import {
  AUTHORS,
  BOOK_DESCRIPTION,
  BOOK_KEYWORDS,
  BOOK_SUBTITLE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

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
      // Every chapter now has a page of its own, so each part references
      // the @id of that page's node rather than pointing only the coded
      // chapters at their /code URL. Matching ids lets the Book node and
      // the chapter pages merge into one entity.
      hasPart: OUTLINE.flatMap((part) =>
        part.chapters.map((ch) => ({
          "@type": "Chapter",
          "@id": `${SITE_URL}${chapterPath(ch.number)}`,
          position: ch.number,
          name: `Chapter ${ch.number}: ${ch.title}`,
          abstract: ch.oneLiner,
          url: `${SITE_URL}${chapterPath(ch.number)}`,
        }))
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

const STATS = [
  {
    value: "18",
    label: "chapters",
    note: "each opening with a vignette that grounds the concept in a concrete actuarial situation",
  },
  {
    value: "5",
    label: "parts",
    note: "foundations, LLMs, agentic architecture, actuarial practice, production and governance",
  },
  {
    value: "4",
    label: "practice domains",
    note: "pricing and underwriting, reserving and claims, life and pensions, risk and compliance",
  },
  {
    value: "9",
    label: "chapters with code",
    note: "runnable Python for every listing in Parts III to V, from your first agent to governance dashboards",
  },
];

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
      {/* Hero: the book itself. */}
      <section className="overflow-x-clip border-b border-border">
        {/* The launch strip runs edge to edge above the hero and is one
            big link to the book's page. The same run repeats six times
            and the track slides by exactly one run, so the loop is
            seamless on any viewport up to five runs wide. Only the first
            run is read out. */}
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
            "grid items-center gap-12 pb-20 pt-16 lg:grid-cols-[1fr_1.05fr] lg:gap-8"
          )}
        >
          <div>
            <h1 data-hero-item className="text-4xl leading-[1.08] sm:text-6xl">
              Agentic AI
              <br />
              for Actuaries
            </h1>
            <p data-hero-item className="mt-3 font-serif text-lg text-cream-300">
              From AI foundations to autonomous actuarial systems
            </p>
            <p data-hero-item className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              A practical guide to building AI agents that price, reserve, and
              report. You still sign the opinion.
            </p>
            {/* The book is published, so the primary action is the book
                itself at ACTEX. The code stays beside it because it is the
                strongest proof on the page that the book delivers. */}
            {/* Stacked and full-width on a phone; side by side once
                both fit on one line. */}
            <div data-hero-item className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
            <p data-hero-item className="mt-4 text-sm text-muted-foreground">
              First edition, 2026. Or{" "}
              <Link href="/book" className="text-cream-200 underline decoration-border underline-offset-4 hover:decoration-gold-400">
                read the chapters
              </Link>{" "}
              here: eighteen of them, nine with code that runs in your browser.
              Short on time? Start with the{" "}
              <Link href="/book/primer" className="text-cream-200 underline decoration-border underline-offset-4 hover:decoration-gold-400">
                primer
              </Link>
              .
            </p>
          </div>
          {/* On a phone the cover leads and the words follow; from lg
              the grid puts the words on the left and the cover on the
              right. */}
          <div data-hero-cover className="relative order-first flex justify-center lg:order-none lg:justify-end">
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

      {/* Overview: what the book promises, and to whom */}
      <section className="border-b border-border">
        <RevealOnScroll className={cn(CONTAINER, "py-16")}>
          <h2 className="max-w-2xl text-2xl leading-snug sm:text-3xl">
            A hands-on guide, structured as a single journey
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {BOOK_PROMISE}
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Written for {joinReaders(TARGET_READERS)}.
          </p>
          <dl className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <StatValue value={stat.value} />
                  <span className="label-mono ml-2">
                    {stat.label}
                  </span>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {stat.note}
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </RevealOnScroll>
      </section>

      {/* The outline: five parts, eighteen chapters */}
      <section id="outline" className="scroll-mt-24 border-b border-border">
        <RevealOnScroll className={cn(CONTAINER, "py-16")}>
          <h2 className="text-2xl leading-snug sm:text-3xl">
            Inside the book
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Five parts that build on each other, from AI literacy to production
            governance. Every chapter closes with a worked case study;
            chapters 9 to 17 ship runnable companion code.
          </p>
          <PartAccordion
            parts={OUTLINE.map(
              (part): AccordionPart => ({
                roman: part.roman,
                title: part.title,
                blurb: part.blurb,
                chapters: part.chapters.map((ch) => ({
                  number: ch.number,
                  title: ch.title,
                  oneLiner: ch.oneLiner,
                  hasCode: Boolean(ch.slug),
                  href: chapterPath(ch.number),
                })),
              })
            )}
          />
          <p className="mt-6 text-sm">
            <Link
              href="/book"
              className="text-cream-200 underline decoration-border underline-offset-4 hover:decoration-gold-400"
            >
              Browse all chapters
            </Link>
          </p>
        </RevealOnScroll>
      </section>

      {/* Companion code directory */}
      <section className="border-b border-border">
        <div className={cn(CONTAINER, "py-16")}>
          <h2 className="text-2xl leading-snug sm:text-3xl">
            Run it before you read it
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            An open repository carries working code for every listing in Parts
            III to V. All datasets are synthetic; Meridian Re, the reinsurer
            the case studies follow, is fictional. Tool scripts run right here
            in your browser, agent scripts run live, and every chapter opens in
            Colab on a free-tier Gemini key.
          </p>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {[
              {
                title: "In your browser",
                body: "Tool scripts run on a Python runtime loaded into the page. Edit them and run again.",
              },
              {
                title: "Live agents",
                body: "Agent scripts run on our server against Gemini, with every tool call streamed as it happens.",
              },
              {
                title: "In Colab",
                body: "Every chapter opens as a notebook where you bring your own free Gemini key.",
              },
            ].map((mode) => (
              <div key={mode.title}>
                <h3 className="text-base font-semibold">{mode.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {mode.body}
                </p>
              </div>
            ))}
          </div>
          {ch09 && featuredScript && featuredAgent && (
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
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/code">All nine code chapters</Link>
            </Button>
            <Button asChild variant="outline">
              <a href={GITHUB_REPO} target="_blank" rel="noreferrer">
                <GithubLogo size={16} aria-hidden="true" />
                View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Pull quote */}
      <section className="border-b border-border">
        <RevealOnScroll className={cn(CONTAINER, "py-16")}>
          <blockquote className="mx-auto max-w-2xl text-center">
            <p className="font-serif text-2xl leading-snug text-cream-100 sm:text-3xl">
              “The difference is not talent. Both hold the same fellowship
              qualification. The difference is the system.”
            </p>
            <footer className="mt-4 font-mono text-xs text-muted-foreground">
              Chapter 1 · The AI Landscape
            </footer>
          </blockquote>
        </RevealOnScroll>
      </section>

      {/* Authors */}
      <section className="border-b border-border">
        <RevealOnScroll className={cn(CONTAINER, "py-16")}>
          <h2 className="text-2xl leading-snug sm:text-3xl">The authors</h2>
          {/* Rendered from AUTHORS rather than written out here: this
              section used to carry its own copy of each biography, which
              meant the page and the JSON-LD could describe the same person
              differently. */}
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
                    <Link
                      href={`/authors/${author.slug}`}
                      className="hover:underline"
                    >
                      {[author.honorificPrefix, author.name]
                        .filter(Boolean)
                        .join(" ")}
                    </Link>
                  </h3>
                  {author.honorificSuffix && (
                    <p className="font-mono text-[11px] text-gold-400">
                      {author.honorificSuffix}
                    </p>
                  )}
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {author.cardBio}
                  </p>
                  {author.links?.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-cream-100"
                    >
                      {link.label}
                      <ArrowUpRight size={12} aria-hidden="true" />
                    </a>
                  ))}
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
              className="text-cream-200 underline underline-offset-2"
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
