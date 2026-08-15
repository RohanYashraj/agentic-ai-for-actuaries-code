import type { Metadata } from "next";
import Link from "next/link";
import { Play, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { AGENT_SCRIPTS } from "@/lib/agents";
import { CHAPTERS } from "@/lib/chapters";
import { cn, CONTAINER } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Run the code",
  description:
    "Every companion listing from the book: tool scripts run editable in your browser, agent scripts run live against Gemini, and every chapter opens in Colab.",
};

export default function CodeIndexPage() {
  return (
    <div className={cn(CONTAINER, "py-12")}>
      <header className="max-w-3xl">
        <h1 className="text-3xl leading-tight sm:text-4xl">
          Every listing, runnable
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          The companion code for Parts III to V of the book, three ways. Tool
          scripts run editable right here, on a Python runtime inside your
          browser. Agent scripts run live on our server against Gemini, with
          their tool calls streamed as they happen. And every chapter opens as
          a Colab notebook where you bring your own free Gemini key and go as
          far as you like.
        </p>
      </header>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        {CHAPTERS.map((chapter) => {
          const demoCount = chapter.scripts.filter((s) => s.demoId).length;
          const agentCount = chapter.scripts.filter(
            (s) =>
              s.agentId &&
              AGENT_SCRIPTS.find((a) => a.id === s.agentId)?.runnable
          ).length;
          return (
            <Link
              key={chapter.slug}
              href={`/code/${chapter.slug}`}
              className="group rounded-md border border-border bg-card p-5 transition-colors hover:border-gold-400/50"
            >
              <p className="font-mono text-xs text-gold-400">
                Chapter {chapter.number}
              </p>
              <h2 className="mt-1.5 text-lg leading-snug text-cream-100 group-hover:text-cream-100">
                {chapter.title}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {chapter.blurb}
              </p>
              <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
                {demoCount > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Play size={11} className="text-run-ok" aria-hidden="true" />
                    {demoCount} browser demo{demoCount > 1 ? "s" : ""}
                  </span>
                )}
                {agentCount > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Sparkle
                      size={11}
                      className="text-gold-400"
                      aria-hidden="true"
                    />
                    {agentCount} live agent{agentCount > 1 ? "s" : ""}
                  </span>
                )}
                <span>Colab</span>
              </p>
            </Link>
          );
        })}
      </section>

      <section className="mt-12 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        <h2 className="text-xl text-cream-100">Notes for the curious</h2>
        <p className="mt-3">
          Browser demos run on Pyodide, a full CPython compiled to WebAssembly.
          The first run downloads the runtime (about 10 MB, more with pandas);
          after that, runs are instant and entirely local. The demo sources are
          generated from the repository scripts at build time, so what you run
          here is what is in the book.
        </p>
        <p className="mt-3">
          Live agent runs execute the unmodified chapter scripts on the server
          with a shared Gemini key and modest rate limits. When the shared
          limit runs out, the Colab notebooks take over: they are the
          full-fidelity path and always available.
        </p>
      </section>
    </div>
  );
}
