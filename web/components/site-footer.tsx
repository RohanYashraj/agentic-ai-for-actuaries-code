import Link from "next/link";
import { ArrowUpRight, BookOpenText } from "@phosphor-icons/react/dist/ssr";
import { GridMotif } from "@/components/grid-motif";
import { ACTEX_BOOK_URL, GITHUB_REPO } from "@/lib/links";
import { cn, CONTAINER } from "@/lib/utils";

const FOOTER_LINKS: {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
}[] = [
  {
    title: "Code",
    links: [
      { label: "Run the code", href: "/code" },
      { label: "Setup", href: "/setup" },
      { label: "Data", href: "/data" },
      { label: "GitHub Repository", href: GITHUB_REPO, external: true },
    ],
  },
  {
    title: "Book & Publisher",
    links: [
      { label: "About the book", href: "/book" },
      { label: "Free on ACTEX Learning", href: ACTEX_BOOK_URL, external: true },
      {
        label: "Sri Sathya Sai Institute of Actuaries",
        href: "https://sssia.org",
        external: true,
      },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative border-t border-white/10 bg-[#060913] text-slate-400 overflow-hidden">
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute -top-24 right-1/4 h-48 w-96 rounded-full bg-amber-500/5 blur-3xl"
        aria-hidden="true"
      />

      <div className={cn(CONTAINER, "relative py-14")}>
        <GridMotif
          tone="dark"
          tile={8}
          gap={3}
          rows={3}
          className="absolute right-4 top-12 opacity-60 sm:right-8"
        />

        <nav
          aria-label="Footer"
          className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_2fr]"
        >
          {FOOTER_LINKS.map((group) => (
            <div key={group.title}>
              <h2 className="label-mono text-gold-400">{group.title}</h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                {group.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-slate-300 transition-colors hover:text-gold-300"
                      >
                        <span>{link.label}</span>
                        <ArrowUpRight size={12} aria-hidden="true" />
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-slate-300 transition-colors hover:text-gold-300"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="max-w-md text-sm leading-relaxed lg:justify-self-end lg:text-right">
            <div className="flex items-center gap-2 lg:justify-end">
              <span className="flex size-6 items-center justify-center rounded-md bg-gold-400 text-navy-950 font-bold">
                <BookOpenText size={14} weight="bold" />
              </span>
              <p className="font-serif text-lg text-white font-semibold">
                Agentic AI{" "}
                <span className="bg-gradient-to-r from-gold-400 to-amber-300 bg-clip-text text-transparent">
                  for Actuaries
                </span>
              </p>
            </div>
            <p className="mt-2.5 text-slate-400 text-xs sm:text-sm">
              Companion code for the book published by ACTEX Learning. Every listing
              from chapters 9 to 17, runnable in your browser, live on our server,
              or in Colab.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 lg:justify-end">
              <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-mono text-amber-300">
                First Edition 2026
              </span>
              <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-mono text-emerald-400">
                100% Free Book
              </span>
            </div>
          </div>
        </nav>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Code is MIT licensed. The book text is © 2026 Satya Sai
            Mudigonda and Rohan Yashraj Gupta.
          </p>
          <p className="text-slate-400">Published by ACTEX Learning, first edition 2026.</p>
        </div>
      </div>
    </footer>
  );
}
