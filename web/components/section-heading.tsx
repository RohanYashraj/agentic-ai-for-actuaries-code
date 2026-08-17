import { cn } from "@/lib/utils";

/** The site's section heading. Serif H2, sized by the global base layer.
 * Replaces the mono-uppercase pseudo-headings the first edition used. */
export function SectionHeading({
  id,
  children,
  className,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 id={id} className={cn("scroll-mt-24", className)}>
      {children}
    </h2>
  );
}
