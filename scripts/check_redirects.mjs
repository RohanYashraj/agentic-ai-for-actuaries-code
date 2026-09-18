#!/usr/bin/env node
/**
 * Every route retired in the 2026-09 rebrand must redirect, permanently,
 * to a page that exists. check_site_graph.mjs only knows the App Router
 * tree, so a deleted page with no redirect would 404 silently for every
 * inbound link that predates the rebrand. Node 24+ strips the types
 * from next.config.ts on import.
 *
 * Run from anywhere:  node scripts/check_redirects.mjs
 */
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const config = (
  await import(pathToFileURL(join(REPO, "web/next.config.ts")).href)
).default;
const rules = await config.redirects();

const RETIRED = [
  "/book/chapters/01",
  "/book/chapters/17",
  "/book/primer",
  "/concepts",
  "/concepts/agentic-ai",
  "/actuarial-ai",
  "/actuarial-ai/pricing",
  "/glossary",
  "/resources",
  "/faq",
  "/authors",
  "/authors/rohan-yashraj-gupta",
];

function toRegex(source) {
  return new RegExp("^" + source.replace(/:[A-Za-z0-9_]+/g, "[^/]+") + "$");
}

let failures = 0;
for (const path of RETIRED) {
  const hits = rules.filter((r) => toRegex(r.source).test(path));
  if (hits.length !== 1) {
    console.error(`✗ ${path}: ${hits.length} matching redirects`);
    failures++;
    continue;
  }
  const { destination, permanent } = hits[0];
  const page = join(
    REPO,
    "web/app",
    destination === "/" ? "" : destination,
    "page.tsx"
  );
  if (!permanent || !existsSync(page)) {
    console.error(
      `✗ ${path} → ${destination}: ${permanent ? "target page missing" : "not permanent"}`
    );
    failures++;
  }
}
if (failures) process.exit(1);
console.log(
  `✓ ${RETIRED.length} retired paths redirect permanently to live pages`
);
