import Link from "next/link";
import { cn, CONTAINER } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className={cn(CONTAINER, "flex flex-1 flex-col items-start justify-center py-24")}>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold-300">
        404 · not found
      </p>
      <h1 className="mt-3 font-serif text-3xl text-cream-100">
        This page isn&apos;t in the book.
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        The page you followed doesn&apos;t exist here.
      </p>
      <div className="mt-6 flex gap-4 text-sm">
        <Link href="/" className="text-gold-300 underline-offset-4 hover:underline">
          Go to the homepage
        </Link>
        <Link href="/book" className="text-gold-300 underline-offset-4 hover:underline">
          All chapters
        </Link>
        <Link href="/code" className="text-gold-300 underline-offset-4 hover:underline">
          Browse the code chapters
        </Link>
      </div>
    </main>
  );
}
