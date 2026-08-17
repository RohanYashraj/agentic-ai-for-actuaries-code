"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export type GlossaryEntry = {
  term: string;
  slug: string;
  definition: string;
  conceptTitle?: string;
  conceptHref?: string;
};

/** Filterable, letter-grouped glossary. Replaces the 29-link jump nav. */
export function GlossaryList({ entries }: { entries: GlossaryEntry[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.term.toLowerCase().includes(q) ||
        e.definition.toLowerCase().includes(q)
    );
  }, [entries, query]);

  const groups = useMemo(() => {
    const byLetter = new Map<string, GlossaryEntry[]>();
    for (const e of filtered) {
      const letter = e.term[0].toUpperCase();
      byLetter.set(letter, [...(byLetter.get(letter) ?? []), e]);
    }
    return [...byLetter.entries()];
  }, [filtered]);

  return (
    <div className="mt-8 max-w-3xl">
      <div>
        <label
          htmlFor="glossary-filter"
          className="block text-sm text-muted-foreground"
        >
          Filter terms
        </label>
        <input
          id="glossary-filter"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="agent, trace, drift..."
          className="mt-1.5 w-full max-w-sm rounded-sm border border-input bg-navy-950/50 px-3 py-2 text-sm text-cream-100 placeholder:text-muted-foreground/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">
          No terms match &ldquo;{query}&rdquo;.{" "}
          <button
            type="button"
            onClick={() => setQuery("")}
            className="text-cream-200 underline decoration-border underline-offset-4 hover:decoration-gold-400"
          >
            Clear the filter
          </button>
        </p>
      ) : (
        groups.map(([letter, items]) => (
          <section key={letter} className="mt-10">
            <h2 className="text-xl sm:text-xl text-gold-300">{letter}</h2>
            <dl className="mt-3 divide-y divide-border border-t border-border">
              {items.map((e) => (
                <div key={e.term} id={e.slug} className="scroll-mt-24 py-5">
                  <dt className="font-serif text-xl text-cream-100">
                    {e.term}
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {e.definition}
                  </dd>
                  {e.conceptTitle && e.conceptHref && (
                    <dd className="mt-2 text-sm">
                      <Link
                        href={e.conceptHref}
                        className="text-cream-200 underline decoration-border underline-offset-4 hover:decoration-gold-400"
                      >
                        {e.conceptTitle} in depth
                      </Link>
                    </dd>
                  )}
                </div>
              ))}
            </dl>
          </section>
        ))
      )}
    </div>
  );
}
