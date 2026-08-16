#!/usr/bin/env node
/**
 * Guards the site's internal link graph.
 *
 * The pages cross-link heavily -- chapters to code, code to chapters,
 * glossary entries back into the book -- and every one of those links is
 * written by hand. A renamed route silently turns a dozen of them into
 * 404s, and nothing in the Next.js build fails when that happens.
 *
 * So: derive the set of real routes from the App Router file tree, scan
 * the source for literal internal hrefs, and fail on any that cannot
 * resolve. Deriving routes from the filesystem rather than from
 * lib/routes.ts is deliberate -- it means the check still catches a page
 * that was deleted but left in the registry.
 *
 * Run from anywhere:  node scripts/check_site_graph.mjs
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WEB = join(REPO, "web");
const APP = join(WEB, "app");

/** Routes that exist but are not App Router pages. */
const EXTRA_ROUTES = ["/llms.txt", "/robots.txt", "/sitemap.xml"];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

/** Turn app/book/chapters/[chapter]/page.tsx into a matcher for
 * /book/chapters/<anything>. Route groups "(name)" contribute no segment. */
function routePatterns() {
  const patterns = [];
  for (const file of walk(APP)) {
    if (!/[/\\]page\.tsx$/.test(file)) continue;
    const segments = relative(APP, dirname(file))
      .split(/[/\\]/)
      .filter((s) => s && !s.startsWith("(") && !s.startsWith("@"));
    const source = segments
      .map((s) =>
        s.startsWith("[") ? "[^/]+" : s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      )
      .join("/");
    patterns.push(new RegExp(`^/${source}$`.replace("^/$", "^/$")));
  }
  for (const route of EXTRA_ROUTES) patterns.push(new RegExp(`^${route}$`));
  return patterns;
}

/** Literal internal hrefs: href="/x" and href={`/x/${...}`}. Template
 * literals have their interpolations replaced by a wildcard segment so a
 * computed slug is checked structurally rather than skipped.
 *
 * Only JSX props are matched. Object-literal `href:` values are passed to
 * <RelatedLinks>, which filters against the route registry at render time
 * and drops anything that does not resolve -- that is how a page declares
 * a relationship to a route built in a later pass without shipping a dead
 * link. Flagging those here would defeat the mechanism. */
function findLinks(file) {
  const source = readFileSync(file, "utf8");
  const found = [];
  const quoted = /href=(?:"(\/[^"#?]*)[^"]*"|'(\/[^'#?]*)[^']*')/g;
  const templated = /href=\{`(\/[^`]*)`\}/g;
  for (const m of source.matchAll(quoted)) {
    found.push(m[1] ?? m[2]);
  }
  for (const m of source.matchAll(templated)) {
    found.push(m[1].replace(/\$\{[^}]*\}/g, "x").split("#")[0].split("?")[0]);
  }
  return found;
}

const patterns = routePatterns();
const sources = [join(WEB, "app"), join(WEB, "components")]
  .flatMap((dir) => walk(dir))
  .filter((f) => /\.tsx?$/.test(f));

const failures = [];
for (const file of sources) {
  for (const href of findLinks(file)) {
    const path = href.length > 1 ? href.replace(/\/$/, "") : href;
    if (!patterns.some((p) => p.test(path))) {
      failures.push(`${relative(REPO, file)}: ${href}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Internal links with no matching route:\n");
  for (const failure of failures) console.error(`  ${failure}`);
  console.error(
    `\n${failures.length} broken link${failures.length > 1 ? "s" : ""}.`
  );
  process.exit(1);
}

console.log(
  `check_site_graph: ${sources.length} files scanned, all internal links resolve.`
);
