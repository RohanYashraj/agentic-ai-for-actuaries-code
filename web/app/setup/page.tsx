import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Play, Sparkle, Terminal } from "@phosphor-icons/react/dist/ssr";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { RelatedLinks } from "@/components/related-links";
import { colabUrl, GITHUB_REPO } from "@/lib/links";
import { absolute, breadcrumbList, graph, ID, pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import { cn, CONTAINER } from "@/lib/utils";

const DESCRIPTION =
  "Three ways to run the code: here in the browser, in Colab with a free Google AI Studio key, or on your own machine with uv. Plus the limits on live runs.";

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
  ["240 s", "timeout per run, then server stops"],
];

const FAQ = [
  {
    q: "Can I run the examples without installing anything?",
    a: "Yes. Tool scripts run in your browser; edit them and run again. Agent scripts run on our server against Gemini, and you watch the tool calls come back. Colab is the third option, and needs only a Google account and a free key.",
  },
  {
    q: "Is the companion code free?",
    a: "Yes. The repository is MIT licensed, and every example runs on the Gemini free tier. The datasets are synthetic. Meridian Re, the reinsurer in the case studies, does not exist.",
  },
  {
    q: "Which framework does the code use?",
    a: "Agno for agents and Google Gemini as the default model, gemini-3.8-flash. One line in .env switches provider: MODEL_PROVIDER accepts google, anthropic, or openai, and MODEL_ID picks the model.",
  },
  {
    q: "Does the code here match the book?",
    a: "The chapter scripts are the source of truth. The browser demos are generated from them when the site is built, live runs execute them as they are, and Colab clones the repository. Where a printed listing has been corrected, the repository's errata section says so.",
  },
];

const LINK =
  "text-slate-200 underline decoration-amber-400/40 underline-offset-4 hover:decoration-amber-400 hover:text-amber-300 transition-colors";
const INLINE = "rounded bg-white/10 px-1.5 py-0.5 font-mono text-[12px] text-amber-300 border border-white/10";

function Code({ children }: { children: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-xl bg-[#060913] border border-white/10 p-4 font-mono text-[13px] leading-relaxed text-amber-200 shadow-inner">
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
    <div className={cn(CONTAINER, "py-12")}>
      <JsonLd data={structuredData} />
      <Breadcrumbs trail={TRAIL} />

      <header className="mt-8 max-w-3xl">
        <p className="label-mono">Getting started</p>
        <h1 className="mt-2 text-3xl sm:text-5xl font-serif text-white font-bold tracking-tight">Setup</h1>
        <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-300">
          {DESCRIPTION}
        </p>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 max-w-3xl space-y-10">
          {/* Option 1 */}
          <section id="browser" className="scroll-mt-24 card-glass p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <span className="label-mono text-emerald-400">Option 1</span>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 font-mono text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <Play size={10} weight="fill" /> No setup
              </span>
            </div>
            <h2 className="mt-2 text-xl font-serif text-white font-semibold">On this site, no setup</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Every{" "}
              <Link href="/code" className={LINK}>
                code chapter
              </Link>{" "}
              has a Run button. Tool scripts run in your browser on Pyodide, which is CPython compiled to
              WebAssembly. The first run fetches about 10 MB; later runs are quick. Agent scripts run on our
              server with a shared key, within the limits shown on the right.
            </p>
          </section>

          {/* Option 2 */}
          <section id="colab" className="scroll-mt-24 card-glass p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <span className="label-mono text-amber-400">Option 2</span>
              <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 font-mono text-[11px] text-amber-300 font-medium">
                Free tier
              </span>
            </div>
            <h2 className="mt-2 text-xl font-serif text-white font-semibold">In Colab, with your own free key</h2>
            <ol className="mt-4 list-decimal space-y-3.5 pl-5 text-sm leading-relaxed text-slate-300 marker:text-amber-400 marker:font-bold">
              <li>
                Get a free API key at{" "}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className={LINK}
                >
                  aistudio.google.com/apikey
                </a>
                . The free tier is enough for every script in the book.
              </li>
              <li>
                Open any chapter notebook, for example{" "}
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
                In the Colab left sidebar, open Secrets (the key icon) and add{" "}
                <code className={INLINE}>GOOGLE_API_KEY</code>. The first
                cells install the pinned packages and then run the book&rsquo;s scripts as written.
              </li>
            </ol>
          </section>

          {/* Option 3 */}
          <section id="local" className="scroll-mt-24 card-glass p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <span className="label-mono text-cyan-400">Option 3</span>
              <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 font-mono text-[11px] text-cyan-300 font-medium">
                Your machine
              </span>
            </div>
            <h2 className="mt-2 text-xl font-serif text-white font-semibold">Locally, with uv</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              You need Python 3.11 or later. If you don&rsquo;t have it, uv will fetch one.
            </p>
            <Code>{`# Install uv (skip if you already have it)
curl -LsSf https://astral.sh/uv/install.sh | sh
# Windows: powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

git clone ${GITHUB_REPO}.git
cd agentic-ai-for-actuaries-code
uv sync

cp .env.example .env    # then paste your key: GOOGLE_API_KEY=...

cd ch09_agentic_foundations
uv run --env-file ../.env python 01_column_agent.py`}</Code>
            <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-400">
              Prefer plain pip as printed in the book? Run{" "}
              <code className={INLINE}>python -m venv .venv</code>, activate
              it, then <code className={INLINE}>pip install -r requirements.txt</code>.
              To use Claude or OpenAI instead of Gemini, set{" "}
              <code className={INLINE}>MODEL_PROVIDER</code> and the matching
              key in .env and run{" "}
              <code className={INLINE}>uv sync --extra anthropic</code> or{" "}
              <code className={INLINE}>--extra openai</code>. Chapter
              12&rsquo;s vector script always uses the Google key for
              embeddings.
            </p>
          </section>

          {/* FAQ */}
          <section id="questions" className="scroll-mt-24 pt-6 border-t border-white/10">
            <p className="label-mono">Questions</p>
            <h2 className="mt-2 text-2xl font-serif text-white font-semibold">Questions people ask</h2>
            <div className="mt-6 space-y-4">
              {FAQ.map((item) => (
                <div key={item.q} className="card-glass p-5">
                  <h3 className="font-serif text-base sm:text-lg text-white font-semibold">{item.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar limits widget */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card-glass p-5 border-l-4 border-l-amber-400">
            <p className="label-mono text-amber-400">Live runs on this site</p>
            <dl className="mt-4 space-y-3.5">
              {LIMITS.map(([n, label]) => (
                <div key={label} className="flex items-baseline gap-2.5">
                  <dt className="font-serif text-2xl font-bold text-white">{n}</dt>
                  <dd className="text-xs text-slate-400">{label}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-relaxed text-slate-400">
              Counters reset at midnight UTC. Your IP address is hashed before it is counted and is not stored.
              If you hit a limit, the Colab notebooks have none.
            </p>
          </div>

          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-sm font-medium text-slate-300 transition-colors hover:border-amber-400 hover:text-white"
          >
            <span>Source on GitHub</span>
            <ArrowUpRight size={14} aria-hidden="true" />
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
