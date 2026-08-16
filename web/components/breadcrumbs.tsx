import Link from "next/link";
import type { Crumb } from "@/lib/seo";

/** Visual counterpart to `breadcrumbList()` in lib/seo. Pass the same trail
 * to both so the rendered path and the structured data cannot disagree.
 * The final crumb is the current page and is not linked. */
export function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="font-mono text-xs text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {trail.map((crumb, i) => {
          const isLast = i === trail.length - 1;
          return (
            <li key={crumb.path} className="flex items-center gap-1.5">
              {i > 0 && (
                <span aria-hidden="true" className="text-border">
                  /
                </span>
              )}
              {isLast ? (
                <span aria-current="page" className="text-cream-200">
                  {crumb.name}
                </span>
              ) : (
                <Link
                  href={crumb.path}
                  className="transition-colors hover:text-cream-100"
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
