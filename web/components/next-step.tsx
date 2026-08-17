import Link from "next/link";
import { Button } from "@/components/ui/button";

/** End-of-page single action. Every content page closes with exactly one
 * of these instead of a pile of co-equal links. */
export function NextStep({
  heading,
  description,
  href,
  cta,
  secondaryHref,
  secondaryLabel,
}: {
  heading: string;
  description?: string;
  href: string;
  cta: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="mt-12 max-w-3xl rounded-md border border-border bg-card px-6 py-6">
      <h2 className="text-xl sm:text-xl">{heading}</h2>
      {description && (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-3">
        <Button asChild size="sm">
          <Link href={href}>{cta}</Link>
        </Button>
        {secondaryHref && secondaryLabel && (
          <Button asChild size="sm" variant="outline">
            <Link href={secondaryHref}>{secondaryLabel}</Link>
          </Button>
        )}
      </div>
    </section>
  );
}
