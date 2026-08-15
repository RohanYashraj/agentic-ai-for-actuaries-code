import fs from "node:fs";
import path from "node:path";

export interface DemoSpec {
  dir: string;
  chapterDir: string;
  entry: string;
  files: string[];
  packages: string[];
  data: string[];
  title: string;
  description: string;
}

export type DemoManifest = Record<string, DemoSpec>;

const DEMOS_ROOT = path.join(process.cwd(), "public", "demos");

/** Server-side: the generated manifest (built by scripts/build_demos.py). */
export function loadManifest(): DemoManifest {
  const raw = fs.readFileSync(path.join(DEMOS_ROOT, "manifest.json"), "utf-8");
  return JSON.parse(raw) as DemoManifest;
}

/** Server-side: a generated demo entry file's source, for initial render. */
export function loadDemoSource(spec: DemoSpec): string {
  return fs.readFileSync(
    path.join(DEMOS_ROOT, spec.dir, spec.entry),
    "utf-8"
  );
}
