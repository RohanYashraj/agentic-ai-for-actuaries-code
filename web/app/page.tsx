import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpenText,
  GithubLogo,
  Terminal,
} from "@phosphor-icons/react/dist/ssr";
import { JsonLd } from "@/components/json-ld";
import { NotifyForm } from "@/components/notify-form";
import { NotifyPopup } from "@/components/notify-popup";
import { Button } from "@/components/ui/button";
import { cn, CONTAINER } from "@/lib/utils";
import { CHAPTERS } from "@/lib/chapters";
import { FEATURED_FAQ } from "@/lib/faq";
import { GITHUB_REPO } from "@/lib/links";
import {
  BOOK_PROMISE,
  chapterPath,
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

export default function LandingPage() {
  return (
    <div>
      <JsonLd data={STRUCTURED_DATA} />
      {/* Hero: the book itself. */}
      <section className="overflow-x-clip border-b border-border">
        <div
          className={cn(
            CONTAINER,
            "grid items-center gap-12 pb-20 pt-16 lg:grid-cols-[1fr_1.05fr] lg:gap-8"
          )}
        >
          <div className="hero-rise">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-gold-400">
              ACTEX · First edition · 2026
            </p>
            <h1 className="mt-4 text-4xl leading-[1.08] sm:text-6xl">
              Agentic AI
              <br />
              for Actuaries
            </h1>
            <p className="mt-3 font-serif text-lg text-cream-300">
              From AI foundations to autonomous actuarial systems
            </p>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              A practical guide to building AI agents that price, reserve, and
              report. You still sign the opinion.
            </p>
            {/* Two co-equal actions, both of which deliver something now.
                Launch updates are the tertiary action further down the
                page: asking a first-time visitor only to wait wastes the
                strongest thing here, which is that the code runs. */}
            {/* Stacked and full-width on a phone; side by side once
                both fit on one line. */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/code">
                  <Terminal size={16} aria-hidden="true" />
                  Explore &amp; run the code
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="/book">
                  <BookOpenText size={16} aria-hidden="true" />
                  Read the chapters
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Eighteen chapters, nine of them with code you can run without
              installing anything.{" "}
              <a
                href="#notify"
                className="text-cream-200 underline decoration-border underline-offset-4 hover:decoration-gold-400"
              >
                Get launch updates
              </a>
              .
            </p>
          </div>
          <div className="hero-rise relative flex justify-center lg:justify-end">
            <div className="book-glow" aria-hidden="true" />
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
          </div>
        </div>
      </section>

      {/* Overview: what the book promises, and to whom */}
      <section className="border-b border-border">
        <div className={cn(CONTAINER, "py-16")}>
          <h2 className="max-w-2xl text-2xl leading-snug sm:text-3xl">
            A hands-on guide, structured as a single journey
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {BOOK_PROMISE}
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Written for{" "}
            {TARGET_READERS.map((reader, i) => (
              <span key={reader}>
                <span className="text-cream-200">
                  {reader.charAt(0).toLowerCase() + reader.slice(1)}
                </span>
                {i < TARGET_READERS.length - 2
                  ? ", "
                  : i === TARGET_READERS.length - 2
                    ? ", and "
                    : "."}
              </span>
            ))}
          </p>
          <dl className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="font-serif text-4xl text-cream-100">
                    {stat.value}
                  </span>
                  <span className="ml-2 font-mono text-xs uppercase tracking-[0.18em] text-gold-400">
                    {stat.label}
                  </span>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {stat.note}
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* The outline: five parts, eighteen chapters */}
      <section id="outline" className="scroll-mt-24 border-b border-border">
        <div className={cn(CONTAINER, "py-16")}>
          <h2 className="text-2xl leading-snug sm:text-3xl">
            Inside the book
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Five parts that build on each other, from AI literacy to production
            governance. Every chapter closes with a worked case study;
            chapters 9 to 17 ship runnable companion code.
          </p>
          <div className="mt-10 space-y-12">
            {OUTLINE.map((part) => (
              <div
                key={part.roman}
                className="grid gap-4 lg:grid-cols-[220px_1fr]"
              >
                <div>
                  <p className="font-serif text-3xl text-gold-300">
                    Part {part.roman}
                  </p>
                  <h3 className="mt-1 text-lg leading-snug text-cream-100">
                    {part.title}
                  </h3>
                  <p className="mt-2 inline-block rounded-sm border border-border px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {part.approach}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {part.blurb}
                  </p>
                </div>
                <div className="divide-y divide-border/60 border-t border-border/60 lg:border-t-0">
                  {part.chapters.map((chapter) => {
                    const inner = (
                      <div className="grid grid-cols-[44px_1fr] gap-x-3 py-4">
                        <span className="font-serif text-xl leading-6 text-cream-400">
                          {chapter.number}
                        </span>
                        <div>
                          <p className="flex flex-wrap items-baseline gap-x-2 leading-6">
                            <span className="text-[15px] text-cream-100">
                              {chapter.title}
                            </span>
                            {chapter.slug && (
                              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold-400">
                                runnable code
                              </span>
                            )}
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            {chapter.oneLiner}
                          </p>
                          <p className="mt-1 font-mono text-[11px] text-muted-foreground/80">
                            Case study · {chapter.caseStudy}
                          </p>
                        </div>
                      </div>
                    );
                    return (
                      <Link
                        key={chapter.number}
                        href={chapterPath(chapter.number)}
                        className="block transition-colors hover:bg-navy-800/40"
                      >
                        {inner}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Companion code directory */}
      <section className="border-b border-border">
        <div className={cn(CONTAINER, "py-16")}>
          <h2 className="text-2xl leading-snug sm:text-3xl">
            Every listing, runnable
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            An open repository carries working code for every listing in Parts
            III to V. All datasets are synthetic; Meridian Re, the reinsurer
            the case studies follow, is fictional. Tool scripts run right here
            in your browser, agent scripts run live, and every chapter opens in
            Colab on a free-tier Gemini key.
          </p>
          <div className="mt-8 overflow-hidden rounded-md border border-border bg-navy-950/50 font-mono text-sm">
            <p className="border-b border-border px-4 py-2.5 text-xs text-muted-foreground">
              agentic-ai-for-actuaries-code/
            </p>
            {CHAPTERS.map((chapter) => (
              <Link
                key={chapter.slug}
                href={`/code/${chapter.slug}`}
                className="flex flex-wrap items-baseline gap-x-2 border-b border-border/60 px-4 py-2.5 transition-colors last:border-b-0 hover:bg-navy-800/50"
              >
                <span className="text-gold-300">{chapter.slug}</span>
                <span className="text-muted-foreground">
                  {chapter.folder.slice(chapter.slug.length)}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {chapter.title}
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-6">
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
        <div className={cn(CONTAINER, "py-16")}>
          <blockquote className="mx-auto max-w-2xl text-center">
            <p className="font-serif text-2xl leading-snug text-cream-100 sm:text-3xl">
              “The difference is not talent. Both hold the same fellowship
              qualification. The difference is the system.”
            </p>
            <footer className="mt-4 font-mono text-xs text-muted-foreground">
              Chapter 1 · The AI Landscape
            </footer>
          </blockquote>
        </div>
      </section>

      {/* Authors */}
      <section className="border-b border-border">
        <div className={cn(CONTAINER, "py-16")}>
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
                      {author.honorificSuffix.split(", ").join(" · ")}
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
        </div>
      </section>

      {/* FAQ teaser */}
      <section className="border-b border-border">
        <div className={cn(CONTAINER, "py-16")}>
          <h2 className="text-2xl leading-snug sm:text-3xl">
            Common questions
          </h2>
          <dl className="mt-8 grid max-w-4xl gap-x-10 gap-y-6 sm:grid-cols-2">
            {FEATURED_FAQ.map((item) => (
              <div key={item.question}>
                <dt className="font-serif text-lg leading-snug text-cream-100">
                  {item.question}
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 text-sm">
            <Link
              href="/faq"
              className="text-cream-200 underline decoration-border underline-offset-4 hover:decoration-gold-400"
            >
              All questions
            </Link>
            {" · "}
            <Link
              href="/glossary"
              className="text-cream-200 underline decoration-border underline-offset-4 hover:decoration-gold-400"
            >
              Glossary
            </Link>
            {" · "}
            <Link
              href="/resources"
              className="text-cream-200 underline decoration-border underline-offset-4 hover:decoration-gold-400"
            >
              Sources and standards
            </Link>
          </p>
        </div>
      </section>

      {/* Launch notify */}
      <section id="notify" className="scroll-mt-24">
        <div className={cn(CONTAINER, "flex flex-col gap-4 py-16")}>
          <h2 className="text-xl text-cream-100">
            Available later this year, free from ACTEX
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            We will email you when the full edition is released. In the
            meantime the{" "}
            <Link
              href="/book/primer"
              className="text-cream-200 underline decoration-border underline-offset-4 hover:decoration-gold-400"
            >
              abridged primer
            </Link>{" "}
            covers the argument in eighteen short chapters, and the code is
            already here.
          </p>
          <NotifyForm />
        </div>
      </section>

      <NotifyPopup />
    </div>
  );
}
