import Link from "next/link";
import { GridMotif } from "@/components/grid-motif";
import { ACTEX_BOOK_URL, GITHUB_REPO } from "@/lib/links";
import { cn, CONTAINER } from "@/lib/utils";

/** The secondary navigation: the same routes as the header plus the
 * external homes of the code and the book. Navy, like the hero, so the
 * page closes in the cover's colours. */
const FOOTER_LINKS: {
  title: string;
  links: { label: string; href: string }[];
}[] = [
  {
    title: "Code",
    links: [
      { label: "Run the code", href: "/code" },
      { label: "Setup", href: "/setup" },
      { label: "Data", href: "/data" },
      { label: "GitHub", href: GITHUB_REPO },
    ],
  },
  {
    title: "Book",
    links: [
      { label: "About the book", href: "/book" },
      { label: "Get it free at ACTEX", href: ACTEX_BOOK_URL },
      {
        label: "Sri Sathya Sai Institute of Actuaries",
        href: "https://sssia.org",
      },
    ],
  },
];

const LINK = "text-paper transition-colors hover:text-gold";

export function SiteFooter() {
  return (
    <footer className="bg-ink-2 text-paper-dim">
      <div className={cn(CONTAINER, "relative py-12")}>
        <GridMotif
          tone="dark"
          tile={8}
          gap={3}
          rows={3}
          className="absolute right-4 top-12 sm:right-6"
        />
        <nav
          aria-label="Footer"
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_2fr]"
        >
          {FOOTER_LINKS.map((group) => (
            <div key={group.title}>
              <h2 className="label-mono text-gold">{group.title}</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {group.links.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith("http") ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className={LINK}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className={LINK}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="max-w-sm text-sm leading-relaxed lg:justify-self-end lg:text-right">
            <p className="font-serif text-base text-paper">
              Agentic AI <span className="text-gold">for Actuaries</span>
            </p>
            <p className="mt-2">
              Companion code for the book. Every listing from chapters 9 to
              17, runnable in your browser, live on our server, or in Colab.
            </p>
          </div>
        </nav>

        <div className="mt-10 flex flex-col gap-2 border-t border-paper/15 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            Code is MIT licensed. The book text is © 2026 Satya Sai
            Mudigonda and Rohan Yashraj Gupta.
          </p>
          <p>Published by ACTEX Learning, first edition 2026.</p>
        </div>
      </div>
    </footer>
  );
}
