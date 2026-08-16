/** The site's route registry.
 *
 * Every indexable page is declared here once, and the sitemap is generated
 * from it. The previous sitemap hardcoded its URL list, which meant a new
 * page was crawlable only if someone remembered to add it in two places.
 *
 * `hasRoute` also lets shared components — the related-links rail in
 * particular — link to a page only once that page actually exists, so the
 * cross-linking can be written ahead of the routes it points at without
 * shipping dead ends. `scripts/check_site_graph.mjs` enforces the reverse
 * direction: no internal href may point outside this registry. */

import { CHAPTERS } from "./chapters";
import { CONCEPTS, conceptPath } from "./concepts";
import { DOMAINS, domainPath } from "./domains";
import { CHAPTER_LIST, chapterPath } from "./outline";
import { AUTHORS } from "./site";

export type SiteRoute = {
  path: string;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
};

export const ROUTES: SiteRoute[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/book", changeFrequency: "weekly", priority: 0.9 },
  { path: "/book/primer", changeFrequency: "monthly", priority: 0.8 },
  ...CHAPTER_LIST.map((c) => ({
    path: chapterPath(c.number),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  })),
  { path: "/code", changeFrequency: "weekly", priority: 0.8 },
  ...CHAPTERS.map((c) => ({
    path: `/code/${c.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  })),
  { path: "/actuarial-ai", changeFrequency: "monthly", priority: 0.8 },
  ...DOMAINS.map((d) => ({
    path: domainPath(d.slug),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  })),
  ...CONCEPTS.map((c) => ({
    path: conceptPath(c.slug),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  })),
  { path: "/glossary", changeFrequency: "monthly", priority: 0.6 },
  { path: "/authors", changeFrequency: "monthly", priority: 0.6 },
  ...AUTHORS.map((a) => ({
    path: `/authors/${a.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  })),
  { path: "/resources", changeFrequency: "monthly", priority: 0.6 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.7 },
];

const ROUTE_PATHS = new Set(ROUTES.map((r) => r.path));

/** True when `path` (ignoring any #fragment) is a declared page. */
export function hasRoute(path: string): boolean {
  return ROUTE_PATHS.has(path.split("#")[0]);
}
