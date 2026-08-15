"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn, CONTAINER } from "@/lib/utils";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className={cn(CONTAINER, "flex flex-1 flex-col items-start justify-center py-24")}>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-run-err">
        something went wrong
      </p>
      <h1 className="mt-3 font-serif text-3xl text-cream-100">
        The page hit an unexpected error.
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        Reloading usually clears it. If it keeps happening, the chapter
        code still runs in Colab.
      </p>
      <Button onClick={reset} size="sm" className="mt-6 h-8 px-4 text-xs font-medium">
        Try again
      </Button>
    </main>
  );
}
