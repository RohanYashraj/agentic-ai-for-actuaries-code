import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { RelatedLinks } from "@/components/related-links";
import { colabUrl, GITHUB_REPO } from "@/lib/links";
import { absolute, breadcrumbList, graph, ID, pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import { cn, CONTAINER } from "@/lib/utils";

const DESCRIPTION =
  "Three ways to run the companion code: in the browser on this site, in Colab with a free Google AI Studio key, or locally with uv. Plus the live runner's limits.";

export const metadata: Metadata = pageMetadata({
  title: "Setup",
  description: DESCRIPTION,
  path: "/setup",
});

const TRAIL = [
  { name: SITE_NAME, path: "/" },
  { name: "Setup", path: "/setup" },
];

const LIMITS: [string, string][] = [
  ["4", "runs per minute, per visitor"],
  ["75", "runs per day, per visitor"],
  ["750", "runs per day, site-wide"],
  ["240 s", "per run, then the server stops it"],
];

const FAQ = [
  {
    q: "Can I run the examples without installing anything?",
    a: "Yes. Tool scripts run in your browser on Pyodide, a full CPython compiled to WebAssembly; edit them and run again, entirely locally. Agent scripts run live on our server against Gemini with their tool calls streamed. Colab is the third path: a Google account and your own free key.",
  },
  {
    q: "Is the code free?",
    a: "Yes. Every listing is in an open repository under the MIT licence, and every example runs on the Gemini free tier. All datasets are synthetic; Meridian Re, the reinsurer the case studies follow, is fictional.",
  },
  {
    q: "Which framework does the code use?",
    a: "Agno for agents and Google Gemini as the default model, gemini-3.5-flash-lite. One line in .env switches provider: MODEL_PROVIDER accepts google, anthropic, or openai, and MODEL_ID picks the model.",
  },
  {
    q: "Does the code here match the book?",
    a: "The chapter scripts are the source of truth. Browser demos are generated from them at build time, live runs execute them unmodified, and Colab clones the repository. Corrections to the printed listings are recorded in the repository's errata section.",
  },
];

const LINK =
  "text-cream-100 underline decoration-border underline-offset-4 hover:decoration-gold-400";
const INLINE = "rounded bg-navy-800 px-1 font-mono text-[13px] text-cream-100";

function Code({ children }: { children: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-md bg-navy-950 px-4 py-3 font-mono text-[13px] leading-relaxed text-cream-100">
      <code>{children}</code>
    </pre>
  );
}

export default function SetupPage() {
  const structuredData = graph(breadcrumbList(TRAIL), {
    "@type": "HowTo",
    "@id": absolute("/setup"),
    name: `Setup · ${SITE_NAME}`,
    description: DESCRIPTION,
    url: absolute("/setup"),
    isPartOf: { "@id": ID.website },
    step: [
      {
        "@type": "HowToStep",
        name: "Run in the browser",
        text: "Open any code chapter and press Run.",
      },
      {
        "@type": "HowToStep",
        name: "Run in Colab",
        text: "Open the chapter notebook and add GOOGLE_API_KEY as a Colab secret.",
      },
      {
        "@type": "HowToStep",
        name: "Run locally",
        text: "Install uv, clone the repository, uv sync, add your key to .env.",
      },
    ],
  });

  return (
    <div className={cn(CONTAINER, "py-10")}>
      <JsonLd data={structuredData} />
      <Breadcrumbs trail={TRAIL} />
      <header className="mt-6 max-w-3xl">
        <h1 className="text-3xl leading-tight sm:text-4xl">Setup</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {DESCRIPTION}
        </p>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 max-w-3xl space-y-14">
          <section id="browser" className="scroll-mt-24">
            <p className="label-mono">Option 1</p>
            <h2 className="mt-2">On this site, no setup</h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Every{" "}
              <Link href="/code" className={LINK}>
                code chapter
              </Link>{" "}
              has a Run button. Tool scripts execute in your browser; the
              first run downloads the Python runtime (about 10 MB, more when
              pandas is needed) and later runs are instant. Agent scripts run
              on our server with a shared key, within the limits shown here.
            </p>
          </section>

          <section id="colab" className="scroll-mt-24">
            <p className="label-mono">Option 2</p>
            <h2 className="mt-2">In Colab, with your own free key</h2>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-base leading-relaxed text-muted-foreground marker:text-gold-300">
              <li>
                Get a key at{" "}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className={LINK}
                >
                  aistudio.google.com/apikey
                </a>
                . The free tier covers every example.
              </li>
              <li>
                Open a chapter notebook, for example{" "}
                <a
                  href={colabUrl("ch09")}
                  target="_blank"
                  rel="noreferrer"
                  className={LINK}
                >
                  Chapter 9 in Colab
                </a>
                .
              </li>
              <li>
                In the left sidebar, open Secrets (the key icon) and add{" "}
                <code className={INLINE}>GOOGLE_API_KEY</code>. The first
                cells clone the repository and install the pins; the notebook
                then runs the chapter&rsquo;s scripts unchanged.
              </li>
            </ol>
          </section>

          <section id="local" className="scroll-mt-24">
            <p className="label-mono">Option 3</p>
            <h2 className="mt-2">Locally, with uv</h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Python 3.11 or later. uv installs one for you if needed.
            </p>
            <Code>{`# Install uv (skip if you have it)
curl -LsSf https://astral.sh/uv/install.sh | sh
# Windows: powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

git clone ${GITHUB_REPO}.git
cd agentic-ai-for-actuaries-code
uv sync

cp .env.example .env    # then paste your key: GOOGLE_API_KEY=...

cd ch09_agentic_foundations
uv run --env-file ../.env python 01_column_agent.py`}</Code>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Prefer plain pip, as printed in the book?{" "}
              <code className={INLINE}>python -m venv .venv</code>, activate
              it, then <code className={INLINE}>pip install -r requirements.txt</code>.
              To use Claude or OpenAI instead of Gemini, set{" "}
              <code className={INLINE}>MODEL_PROVIDER</code> and the matching
              key in .env and run{" "}
              <code className={INLINE}>uv sync --extra anthropic</code> or{" "}
              <code className={INLINE}>--extra openai</code>. Chapter
              12&rsquo;s vector script always needs the Google key for
              embeddings.
            </p>
          </section>

          <section id="questions" className="scroll-mt-24">
            <h2>Questions</h2>
            <dl className="mt-6 divide-y divide-border">
              {FAQ.map((item) => (
                <div key={item.q} className="py-5">
                  <dt className="font-serif text-lg text-cream-100">{item.q}</dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                    {item.a}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-md border border-border bg-card p-5">
            <p className="label-mono">Live runs on this site</p>
            <dl className="mt-4 space-y-3">
              {LIMITS.map(([n, label]) => (
                <div key={label} className="flex items-baseline gap-3">
                  <dt className="font-serif text-2xl text-cream-100">{n}</dt>
                  <dd className="text-sm text-muted-foreground">{label}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Counters reset on UTC days. Your address is hashed before it is
              counted and never stored. When a limit is reached, the
              chapter&rsquo;s Colab notebook is the unlimited path.
            </p>
          </div>
          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noreferrer"
            className={cn("mt-4 inline-flex items-center gap-1 text-sm", LINK)}
          >
            View on GitHub
            <ArrowUpRight size={12} aria-hidden="true" />
          </a>
        </aside>
      </div>

      <RelatedLinks
        groups={[
          {
            title: "Run it",
            links: [{ label: "All nine code chapters", href: "/code" }],
          },
          {
            title: "The data",
            links: [{ label: "The synthetic datasets", href: "/data" }],
          },
        ]}
      />
    </div>
  );
}
