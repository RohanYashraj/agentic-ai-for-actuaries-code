import Link from "next/link";
import { GITHUB_REPO } from "@/lib/links";
import { cn, CONTAINER } from "@/lib/utils";

/** The secondary navigation. The header carries only the primary routes,
 * so pages like /resources and /faq are reachable from here rather than
 * only from a related-links rail. */
const FOOTER_LINKS: { title: string; links: { label: string; href: string }[] }[] =
  [
    {
      title: "The book",
      links: [
        { label: "All chapters", href: "/book" },
        { label: "The primer", href: "/book/primer" },
        { label: "The authors", href: "/authors" },
      ],
    },
    {
      title: "Practice",
      links: [
        { label: "Practice domains", href: "/actuarial-ai" },
        { label: "Run the code", href: "/code" },
      ],
    },
    {
      title: "Reference",
      links: [
        { label: "Concepts", href: "/concepts" },
        { label: "Glossary", href: "/glossary" },
        { label: "Sources and standards", href: "/resources" },
        { label: "Questions", href: "/faq" },
      ],
    },
    {
      title: "Stay close",
      links: [
        { label: "Get launch updates", href: "/#notify" },
        { label: "GitHub", href: GITHUB_REPO },
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
