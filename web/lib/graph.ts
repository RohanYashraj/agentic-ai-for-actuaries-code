import type { RelatedGroup } from "@/components/related-links";
import { CHAPTERS } from "./chapters";
import { getPartOf } from "./outline";

/** Related-links rail for /code/[chapter]: neighbouring code chapters,
 * plus setup and data. */
export function relatedForCodeChapter(slug: string): RelatedGroup[] {
  const i = CHAPTERS.findIndex((c) => c.slug === slug);
  if (i === -1) return [];
  const chapter = CHAPTERS[i];
  const part = getPartOf(chapter.number);
  const neighbours = [CHAPTERS[i - 1], CHAPTERS[i + 1]].filter(Boolean);
  return [
    {
      title: "Next in the code",
      links: neighbours.map((c) => ({
        label: `Chapter ${c.number}: ${c.title}`,
        href: `/code/${c.slug}`,
      })),
    },
    {
      title: "Run it yourself",
      links: [
        { label: "Setup", href: "/setup", note: "Colab, local install, limits" },
        { label: "Data", href: "/data", note: "The synthetic datasets" },
      ],
    },
    {
      title: "In the book",
      links: [
        {
          label: part ? `Part ${part.roman}: ${part.title}` : "The book",
          href: "/book",
        },
      ],
    },
  ];
}
