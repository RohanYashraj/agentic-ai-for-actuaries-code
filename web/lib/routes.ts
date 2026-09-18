/** The site's route registry. Every indexable page is declared here once;
 * the sitemap is generated from it, and `hasRoute` lets the related-links
 * rail drop a link whose target does not exist. `scripts/check_site_graph.mjs`
 * enforces the reverse direction: no internal href may point outside the
 * App Router tree. */

import { CHAPTERS } from "./chapters";

export type SiteRoute = {
  path: string;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
};

export const ROUTES: SiteRoute[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/code", changeFrequency: "weekly", priority: 0.9 },
  ...CHAPTERS.map((c) => ({
    path: `/code/${c.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  })),
  { path: "/setup", changeFrequency: "monthly", priority: 0.7 },
  { path: "/data", changeFrequency: "monthly", priority: 0.7 },
  { path: "/book", changeFrequency: "monthly", priority: 0.7 },
];

const ROUTE_PATHS = new Set(ROUTES.map((r) => r.path));

/** True when `path` (ignoring any #fragment or ?query) is a declared page. */
export function hasRoute(path: string): boolean {
  return ROUTE_PATHS.has(path.split(/[#?]/)[0]);
}
