/** Structured data (schema.org) as a JSON-LD script tag.
 *
 * Only ever fed static, repo-authored objects — never user or model
 * output. The `<` escape is the Next.js-documented hardening for the
 * dangerouslySetInnerHTML this pattern requires.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
