/** Shared metadata and structured-data helpers.
 *
 * Two things live here. First, `pageMetadata`, so canonical URLs and
 * OpenGraph tags are built one way instead of being retyped on every
 * route. Second, the stable JSON-LD node ids: the book, the primer, the
 * site, and each author are single entities, and every page that mentions
 * one must point at the same @id rather than declaring a fresh copy.
 * Search engines and answer engines merge on those ids, so duplicating a
 * node is worse than omitting it. */

import type { Metadata } from "next";
import { AUTHORS, type Author, SITE_NAME, SITE_URL } from "./site";

export const ID = {
  book: `${SITE_URL}/#book`,
  primer: `${SITE_URL}/#primer`,
  website: `${SITE_URL}/#website`,
  organization: `${SITE_URL}/#sssia`,
} as const;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Author @ids predate this module and are referenced by the landing page,
 * so the shape is kept exactly as it was: origin + "/#" + the slug, which
 * is the slugified name. Changing it would split each author into two
 * entities as far as a consumer merging on @id is concerned. */
export function authorId(author: Author): string {
  return `${SITE_URL}/#${author.slug}`;
}

export function authorPath(author: Author): string {
  return `/authors/${author.slug}`;
}

/** Minimal Person references for embedding in other nodes. The full Person
 * nodes are declared once, on the landing page and the author pages. */
export function authorRefs() {
  return AUTHORS.map((a) => ({
    "@type": "Person" as const,
    "@id": authorId(a),
    name: a.name,
  }));
}

export function absolute(path: string): string {
  return path.startsWith("http") ? path : `${SITE_URL}${path}`;
}

export function pageMetadata({
  title,
  description,
  path,
  keywords,
  ogType = "website",
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  ogType?: "website" | "article" | "book";
}): Metadata {
  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: path },
    openGraph: {
      type: ogType === "book" ? "article" : ogType,
      url: path,
      title: `${title} · ${SITE_NAME}`,
      description,
    },
  };
}

export type Crumb = { name: string; path: string };

/** BreadcrumbList JSON-LD. The trail should start at the site root and end
 * at the current page. */
export function breadcrumbList(trail: Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: absolute(crumb.path),
    })),
  };
}

export function graph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
