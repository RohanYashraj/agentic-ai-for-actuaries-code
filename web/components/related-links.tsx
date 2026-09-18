import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { hasRoute } from "@/lib/routes";

export type RelatedLink = { label: string; href: string; note?: string };
export type RelatedGroup = { title: string; links: RelatedLink[] };

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
    <aside className="mt-14 border-t border-white/10 pt-10">
      <p className="label-mono">Keep Exploring</p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {live.map((group) => (
          <div key={group.title} className="card-glass p-5">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-amber-400">
              {group.title}
            </h3>
            <ul className="mt-3 space-y-2.5 text-sm">
              {group.links.map((link) => {
                const isExternal = link.href.startsWith("http");
                return (
                  <li key={`${group.title}-${link.href}-${link.label}`}>
                    {isExternal ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-slate-200 hover:text-amber-300 transition-colors"
                      >
                        <span>{link.label}</span>
                        <ArrowUpRight size={12} />
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="font-medium text-slate-200 hover:text-amber-300 transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                    {link.note && (
                      <span className="block text-xs text-slate-400 mt-0.5">
                        {link.note}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
