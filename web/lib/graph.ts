/** Derives the cross-links between chapters, concepts, domains and code.
 *
 * Nothing new is declared here. The relationships already exist in the
 * data modules -- a Concept lists its chapters, a Domain lists its code --
 * and this module reads them in both directions so a chapter page can ask
 * "which concepts cover me?" without that edge being written twice and
 * drifting. Every page's related rail is built from these functions, and
 * <RelatedLinks> drops any target whose route does not exist yet. */

import type { RelatedGroup } from "@/components/related-links";
import { CHAPTERS, getChapter } from "./chapters";
import { CONCEPTS, conceptPath } from "./concepts";
import { DOMAINS, domainForChapter, domainPath } from "./domains";
import { GLOSSARY, glossarySlug } from "./glossary";
import { chapterPath, getOutlineChapter } from "./outline";

function chapterLabel(n: number): string {
  const ch = getOutlineChapter(n);
  return ch ? `Chapter ${n}: ${ch.title}` : `Chapter ${n}`;
}

/** Code links carry their chapter number, so a rail listing both a book
 * chapter and a code chapter reads unambiguously. */
function codeLabel(slug: string): string {
  const chapter = getChapter(slug);
  return chapter ? `Chapter ${chapter.number} listings` : slug;
}

/** Concepts that name this chapter among the ones they draw on. */
export function conceptsForChapter(n: number) {
  return CONCEPTS.filter((c) => c.chapters.includes(n));
}

/** Glossary terms the chapter's own text names, matched on word
 * boundaries with an optional plural: a substring match would link
 * "Model" from "modelling" and "Tool" from "toolkit". */
export function termsForChapter(n: number, limit = 6) {
  const ch = getOutlineChapter(n);
  if (!ch) return [];
  const haystack = `${ch.title} ${ch.oneLiner} ${ch.caseStudy}`;
  return GLOSSARY.filter((g) => {
    const escaped = g.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}s?\\b`, "i").test(haystack);
  }).slice(0, limit);
}

export function relatedForChapter(n: number): RelatedGroup[] {
  const domain = domainForChapter(n);
  const concepts = conceptsForChapter(n);
  const code = getOutlineChapter(n)?.slug;

  return [
    {
      title: "Concepts",
      links: concepts.map((c) => ({
        label: c.title,
        href: conceptPath(c.slug),
      })),
    },
    {
      title: "Definitions",
      links: termsForChapter(n, 4).map((t) => ({
        label: t.term,
        href: `/glossary#${glossarySlug(t.term)}`,
      })),
    },
    {
      title: "Runnable code",
      links: code
        ? [
            {
              label: `Chapter ${n} listings`,
              href: `/code/${code}`,
              note: getChapter(code)?.folder,
            },
          ]
        : [{ label: "All runnable chapters", href: "/code" }],
    },
    {
      title: "Practice domain",
      links: domain
        ? [{ label: domain.name, href: domainPath(domain.slug) }]
        : DOMAINS.slice(0, 2).map((d) => ({
            label: d.name,
            href: domainPath(d.slug),
          })),
    },
  ];
}

export function relatedForConcept(slug: string): RelatedGroup[] {
  const concept = CONCEPTS.find((c) => c.slug === slug);
  if (!concept) return [];

  return [
    {
      title: "In the book",
      links: concept.chapters.map((n) => ({
        label: chapterLabel(n),
        href: chapterPath(n),
      })),
    },
    {
      title: "Runnable code",
      links: concept.codeSlugs.map((s) => ({
        label: codeLabel(s),
        href: `/code/${s}`,
      })),
    },
    {
      title: "Practice domains",
      links: concept.domains.map((d) => ({
        label: DOMAINS.find((x) => x.slug === d)?.name ?? d,
        href: domainPath(d),
      })),
    },
    {
      title: "Related concepts",
      links: concept.related.map((r) => ({
        label: CONCEPTS.find((c) => c.slug === r)?.title ?? r,
        href: conceptPath(r),
      })),
    },
  ];
}

export function relatedForDomain(slug: string): RelatedGroup[] {
  const domain = DOMAINS.find((d) => d.slug === slug);
  if (!domain) return [];

  return [
    {
      title: "In the book",
      links: [domain.chapter, ...domain.supportingChapters].map((n) => ({
        label: chapterLabel(n),
        href: chapterPath(n),
      })),
    },
    {
      title: "Runnable code",
      links: domain.codeSlugs.map((s) => ({
        label: codeLabel(s),
        href: `/code/${s}`,
      })),
    },
    {
      title: "Concepts",
      links: domain.conceptSlugs.map((s) => ({
        label: CONCEPTS.find((c) => c.slug === s)?.title ?? s,
        href: conceptPath(s),
      })),
    },
    {
      title: "Other domains",
      links: DOMAINS.filter((d) => d.slug !== slug).map((d) => ({
        label: d.name,
        href: domainPath(d.slug),
      })),
    },
  ];
}

export function relatedForCodeChapter(slug: string): RelatedGroup[] {
  const chapter = CHAPTERS.find((c) => c.slug === slug);
  if (!chapter) return [];
  const domain = domainForChapter(chapter.number);

  return [
    {
      title: "In the book",
      links: [
        {
          label: chapterLabel(chapter.number),
          href: chapterPath(chapter.number),
          note: "Read the chapter",
        },
        { label: "All eighteen chapters", href: "/book" },
      ],
    },
    {
      title: "Concepts",
      links: conceptsForChapter(chapter.number).map((c) => ({
        label: c.title,
        href: conceptPath(c.slug),
      })),
    },
    {
      title: "Practice domain",
      links: domain
        ? [{ label: domain.name, href: domainPath(domain.slug) }]
        : [],
    },
  ];
}
