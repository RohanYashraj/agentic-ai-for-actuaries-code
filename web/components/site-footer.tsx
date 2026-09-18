import Link from "next/link";
import { ACTEX_BOOK_URL, GITHUB_REPO } from "@/lib/links";
import { cn, CONTAINER } from "@/lib/utils";

/** The secondary navigation: the same routes as the header plus the
 * external homes of the code and the book. */
const FOOTER_LINKS: { title: string; links: { label: string; href: string }[] }[] =
  [
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
        { label: "Sri Sathya Sai Institute of Actuaries", href: "https://sssia.org" },
      ],
    },
  ];

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className={cn(CONTAINER, "py-10")}>
        <nav
          aria-label="Footer"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {FOOTER_LINKS.map((group) => (
            <div key={group.title}>
              <h2 className="label-mono">{group.title}</h2>
              <ul className="mt-2.5 space-y-2.5 text-sm sm:space-y-1.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith("http") ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground transition-colors hover:text-cream-100"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-muted-foreground transition-colors hover:text-cream-100"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Companion site for{" "}
            <span className="font-serif text-cream-100">
              Agentic AI <span className="text-gold-400">for Actuaries</span>
            </span>
          </p>
          <p className="text-xs">
            © 2026 Satya Sai Mudigonda &amp; Rohan Yashraj Gupta
          </p>
        </div>
      </div>
    </footer>
  );
}
