import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { RelatedLinks } from "@/components/related-links";
import { DOMAINS, domainPath } from "@/lib/domains";
import { FAQ, FAQ_CATEGORIES } from "@/lib/faq";
import { absolute, breadcrumbList, graph, ID, pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import { cn, CONTAINER } from "@/lib/utils";

const DESCRIPTION =
  "Who the book is for, whether you need Python, which AI frameworks it uses, how to run the examples without installing anything, and what it covers on governance.";

export const metadata: Metadata = pageMetadata({
  title: "Frequently asked questions",
  description: DESCRIPTION,
  path: "/faq",
});

const TRAIL = [
  { name: SITE_NAME, path: "/" },
  { name: "Questions", path: "/faq" },
];

export default function FaqPage() {
  const structuredData = graph(breadcrumbList(TRAIL), {
    "@type": "FAQPage",
    "@id": absolute("/faq"),
    name: `Frequently asked questions · ${SITE_NAME}`,
    description: DESCRIPTION,
    url: absolute("/faq"),
    isPartOf: { "@id": ID.website },
    about: { "@id": ID.book },
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  });

  return (
    <div className={cn(CONTAINER, "py-10")}>
      <JsonLd data={structuredData} />
      <Breadcrumbs trail={TRAIL} />

      <header className="mt-6 max-w-3xl">
        <h1 className="text-3xl leading-tight sm:text-4xl">
          Frequently asked questions
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          The questions readers ask before and while reading, answered
          plainly. Domain-specific questions live on each practice page.
        </p>
      </header>

      <div className="mt-12 space-y-12">
        {FAQ_CATEGORIES.map((category) => {
          const items = FAQ.filter((f) => f.category === category.id);
          if (items.length === 0) return null;
          return (
            <section key={category.id}>
              <h2 className="text-2xl leading-tight">{category.label}</h2>
              <dl className="mt-5 max-w-3xl divide-y divide-border border-t border-border">
                {items.map((item) => (
                  <div key={item.question} className="py-5">
                    <dt className="font-serif text-lg leading-snug text-cream-100">
                      {item.question}
                    </dt>
                    <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {item.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          );
        })}
      </div>

      <RelatedLinks
        groups={[
          {
            title: "Start here",
            links: [
              { label: "Run the code", href: "/code" },
              { label: "All eighteen chapters", href: "/book" },
              { label: "Read the primer", href: "/book/primer" },
            ],
          },
          {
            title: "Practice domains",
            links: DOMAINS.map((d) => ({
              label: d.name,
              href: domainPath(d.slug),
            })),
          },
          {
            title: "Reference",
            links: [
              { label: "Glossary", href: "/glossary" },
              { label: "Sources and standards", href: "/resources" },
              { label: "The authors", href: "/authors" },
            ],
          },
        ]}
      />
    </div>
  );
}
