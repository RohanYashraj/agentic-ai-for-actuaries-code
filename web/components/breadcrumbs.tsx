import Link from "next/link";
import type { Crumb } from "@/lib/seo";

/** Visual counterpart to `breadcrumbList()` in lib/seo. Pass the same trail
 * to both so the rendered path and the structured data cannot disagree.
 * The final crumb is the current page and is not linked. */
export function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="font-mono text-xs text-slate-400">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {trail.map((crumb, i) => {
          const isLast = i === trail.length - 1;
          return (
            <li key={crumb.path} className="flex items-center gap-2">
              {i > 0 && (
                <span aria-hidden="true" className="text-slate-600 select-none">
                  /
                </span>
              )}
              {isLast ? (
                <span aria-current="page" className="font-semibold text-amber-300">
                  {crumb.name}
                </span>
              ) : (
                <Link
                  href={crumb.path}
                  className="transition-colors hover:text-white"
                >
                  {crumb.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
