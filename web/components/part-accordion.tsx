"use client";

import { useState } from "react";
import Link from "next/link";
import { CaretDown } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export type AccordionPart = {
  roman: string;
  title: string;
  blurb: string;
  chapters: {
    number: number;
    title: string;
    oneLiner: string;
    hasCode: boolean;
    href: string;
  }[];
};

/** The homepage outline: five parts, first open. Chapter lists collapse
 * so the homepage stops duplicating /book at full length. Content stays
 * in the DOM (hidden attribute) so the outline remains crawlable. */
export function PartAccordion({ parts }: { parts: AccordionPart[] }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="divide-y divide-border border-y border-border">
      {parts.map((part, i) => {
        const isOpen = open === i;
        const panelId = `part-panel-${part.roman}`;
        return (
          <section key={part.roman}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="flex w-full items-baseline gap-4 py-5 text-left transition-colors hover:bg-navy-800/30"
            >
              <span className="font-serif text-2xl text-gold-300">
                {part.roman}
              </span>
              <span className="flex-1">
                <span className="block font-serif text-lg text-cream-100">
                  {part.title}
                </span>
                <span className="mt-0.5 block text-sm text-muted-foreground">
                  {part.blurb}
                </span>
              </span>
              <CaretDown
                size={16}
                aria-hidden="true"
                className={cn(
                  "shrink-0 self-center text-muted-foreground transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            <div id={panelId} hidden={!isOpen} className="pb-5">
              <ul className="divide-y divide-border/60">
                {part.chapters.map((ch) => (
                  <li key={ch.number}>
                    <Link
                      href={ch.href}
                      className="grid grid-cols-[44px_1fr] gap-x-3 py-3 transition-colors hover:bg-navy-800/40"
                    >
                      <span className="font-serif text-lg leading-6 text-cream-400">
                        {ch.number}
                      </span>
                      <span>
                        <span className="flex flex-wrap items-baseline gap-x-2 text-[15px] leading-6 text-cream-100">
                          {ch.title}
                          {ch.hasCode && (
                            <span className="font-mono text-xs text-gold-300">
                              runnable
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">
                          {ch.oneLiner}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      })}
    </div>
  );
}
