/** Single-column fact list with a serif H3. Replaces the authors' 2x2
 * `Facts` card grid, and skips itself when the data is empty (the grid
 * used to render ragged). */
export function FactSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (items.length === 0) return null;
  return (
    <section className="mt-8 max-w-3xl">
      <h3>{title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
