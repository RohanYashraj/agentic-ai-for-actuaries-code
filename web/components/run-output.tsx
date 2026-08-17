"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface OutputLine {
  kind: "stdout" | "stderr" | "system";
  text: string;
}

export function RunOutput({
  lines,
  className,
}: {
  lines: OutputLine[];
  className?: string;
}) {
  const ref = useRef<HTMLPreElement>(null);
  const pinned = useRef(true);

  useEffect(() => {
    const el = ref.current;
    if (el && pinned.current) el.scrollTop = el.scrollHeight;
  }, [lines]);

  if (lines.length === 0) return null;

  return (
    <div className={cn("border-t border-border bg-navy-950/60", className)}>
      <div className="flex items-center justify-between px-3 py-1.5">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Output
        </span>
      </div>
      <pre
        ref={ref}
        onScroll={(e) => {
          const el = e.currentTarget;
          pinned.current =
            el.scrollHeight - el.scrollTop - el.clientHeight < 24;
        }}
        className="max-h-80 overflow-auto px-3 pb-3 font-mono text-[12.5px] leading-relaxed"
      >
        {lines.map((line, i) => (
          <span
            key={i}
            className={cn(
              "block whitespace-pre-wrap",
              line.kind === "stderr" && "text-run-err",
              line.kind === "system" && "text-muted-foreground",
              line.kind === "stdout" && "text-foreground"
            )}
          >
            {line.text}
          </span>
        ))}
      </pre>
    </div>
  );
}
