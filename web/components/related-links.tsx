import Link from "next/link";
import { hasRoute } from "@/lib/routes";

export type RelatedLink = { label: string; href: string; note?: string };
export type RelatedGroup = { title: string; links: RelatedLink[] };

/** The rail that turns the site from a set of pages into a connected graph.
 *
 * Links whose target is not in the route registry are dropped rather than
 * rendered dead, so a page can declare its relationships before the pages
 * on the other end have been built. External links (http, mailto) pass
 * through untouched. */
function isLive(href: string): boolean {
  if (/^[a-z]+:/i.test(href) || href.startsWith("//")) return true;
  return hasRoute(href);
}

export function RelatedLinks({ groups }: { groups: RelatedGroup[] }) {
  const live = groups
    .map((group) => ({ ...group, links: group.links.filter((l) => isLive(l.href)) }))
    .filter((group) => group.links.length > 0);

  if (live.length === 0) return null;

  return (
    <aside className="mt-12 border-t border-border pt-8">
      <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-gold-300">
        Keep reading
      </h2>
      <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {live.map((group) => (
          <div key={group.title}>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              {group.title}
            </h3>
            {/* Looser on a phone: these are thumb targets there, not
                a dense reference rail. */}
            <ul className="mt-2.5 space-y-3 text-sm sm:space-y-2">
              {group.links.map((link) => (
                <li key={`${group.title}-${link.href}-${link.label}`}>
                  <Link
                    href={link.href}
                    className="text-cream-200 underline decoration-border underline-offset-4 transition-colors hover:text-cream-100 hover:decoration-gold-400"
                  >
                    {link.label}
                  </Link>
                  {link.note && (
                    <span className="block text-xs text-muted-foreground">
                      {link.note}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
