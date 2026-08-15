import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { JsonLd } from "@/components/json-ld";
import { NotifyForm } from "@/components/notify-form";
import { NotifyPopup } from "@/components/notify-popup";
import { Button } from "@/components/ui/button";
import { cn, CONTAINER } from "@/lib/utils";
import { CHAPTERS } from "@/lib/chapters";
import { GITHUB_REPO } from "@/lib/links";
import { BOOK_PROMISE, OUTLINE, TARGET_READERS } from "@/lib/outline";
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
      hasPart: OUTLINE.flatMap((part) =>
        part.chapters.map((ch) => ({
          "@type": "Chapter",
          position: ch.number,
          name: `Chapter ${ch.number}: ${ch.title}`,
          abstract: ch.oneLiner,
          ...(ch.slug ? { url: `${SITE_URL}/code/${ch.slug}` } : {}),
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
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild>
                <a href="#outline">Read the outline</a>
              </Button>
              <Button asChild variant="outline" className="btn-shimmer">
                <Link href="/code">Run the code</Link>
              </Button>
            </div>
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
      <section id="outline" className="scroll-mt-16 border-b border-border">
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
                    return chapter.slug ? (
                      <Link
                        key={chapter.number}
                        href={`/code/${chapter.slug}`}
                        className="block transition-colors hover:bg-navy-800/40"
                      >
                        {inner}
                      </Link>
                    ) : (
                      <div key={chapter.number}>{inner}</div>
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
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div className="flex gap-4">
              <Image
                src="/author-satya.webp"
                alt="Portrait of Satya Sai Mudigonda"
                width={72}
                height={72}
                className="size-18 shrink-0 rounded-sm border border-border object-cover"
              />
              <div>
                <h3 className="font-serif text-lg text-cream-100">
                  Satya Sai Mudigonda
                </h3>
                <p className="font-mono text-[11px] text-gold-400">
                  CPCU · PMP · AIAI
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Senior tech actuarial consultant and Professor of Practice;
                  Chairman of the Sri Sathya Sai Institute of Actuaries. Thirty
                  plus years across actuarial practice, technology leadership,
                  and data science research.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Image
                src="/author-rohan.jpeg"
                alt="Portrait of Rohan Yashraj Gupta"
                width={72}
                height={72}
                className="size-18 shrink-0 rounded-sm border border-border object-cover"
              />
              <div>
                <h3 className="font-serif text-lg text-cream-100">
                  Dr Rohan Yashraj Gupta
                </h3>
                <p className="font-mono text-[11px] text-gold-400">
                  PhD · FIA · FIAI
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  The first person in India to earn a PhD in actuarial science.
                  Eight years of life and non-life insurance experience, nine
                  published papers, and adjunct professor at the Sri Sathya Sai
                  Institute of Actuaries.
                </p>
                <a
                  href="https://rohanyashraj.com"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-cream-100"
                >
                  rohanyashraj.com
                  <ArrowUpRight size={12} aria-hidden="true" />
                </a>
              </div>
            </div>
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

      {/* Launch notify */}
      <section>
        <div className={cn(CONTAINER, "flex flex-col gap-4 py-16")}>
          <h2 className="text-xl text-cream-100">
            Available later this year, free from ACTEX
          </h2>
          <NotifyForm />
        </div>
      </section>

      <NotifyPopup />
    </div>
  );
}
