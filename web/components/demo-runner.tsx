"use client";

import { python } from "@codemirror/lang-python";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import {
  ArrowCounterClockwise,
  ArrowsInSimple,
  ArrowsOutSimple,
  Play,
  Spinner,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { OutputLine, RunOutput } from "@/components/run-output";
import type { DemoSpec } from "@/lib/demos";
import { codeTheme } from "@/lib/editor-theme";
import { runDemo } from "@/lib/pyodide/client";
import { cn } from "@/lib/utils";

type RunState = "idle" | "running" | "done" | "error";

const extensions = [python(), EditorView.lineWrapping];

export function DemoRunner({
  spec,
  initialSource,
}: {
  spec: DemoSpec;
  initialSource: string;
}) {
  const [source, setSource] = useState(initialSource);
  const [lines, setLines] = useState<OutputLine[]>([]);
  const [state, setState] = useState<RunState>("idle");
  const [status, setStatus] = useState<string>(spec.entry);
  const [expanded, setExpanded] = useState(false);
  // CodeMirror renders nothing until mounted; keep the source in the
  // server HTML (crawlers, no-JS readers, first paint) via a <pre>.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const cancelRef = useRef<(() => void) | null>(null);

  const append = useCallback((line: OutputLine) => {
    setLines((prev) => [...prev, line]);
  }, []);

  const handleRun = useCallback(() => {
    setLines([]);
    setState("running");
    setStatus("starting…");
    const { cancel } = runDemo(
      { ...spec },
      source,
      (event) => {
        switch (event.kind) {
          case "status":
            setStatus(event.text);
            break;
          case "stdout":
          case "stderr":
            append({ kind: event.kind, text: event.text });
            break;
          case "done":
            setState("done");
            setStatus(
              `finished in ${(event.ms / 1000).toFixed(1)}s. Edit the code and run again.`
            );
            append({ kind: "system", text: "── finished ──" });
            break;
          case "error": {
            setState("error");
            if (/loading Python|importScripts|fetch failed/i.test(event.message)) {
              setStatus("Python could not load");
              append({
                kind: "stderr",
                text: "The Python runtime could not load in this browser. Use the chapter's Colab notebook instead.",
              });
            } else {
              setStatus("error");
              for (const l of event.message.split("\n")) {
                append({ kind: "stderr", text: l });
              }
            }
            break;
          }
        }
      }
    );
    cancelRef.current = cancel;
  }, [append, source, spec]);

  const handleReset = useCallback(() => {
    cancelRef.current?.();
    cancelRef.current = null;
    setSource(initialSource);
    setLines([]);
    setState("idle");
    setStatus(spec.entry);
  }, [initialSource, spec.entry]);

  const running = state === "running";

  // The full runner UI: rendered inline, or inside the fullscreen dialog
  // when expanded. One instance at a time, so edits and output carry over.
  const runner = (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-border bg-navy-950/60",
        expanded && "flex h-full flex-col rounded-none border-0"
      )}
    >
      {/* Wraps on a phone: in one row the status was squeezed to a few
          pixels and the filename never showed. */}
      <div className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1.5 border-b border-border px-3 py-2">
        <Button
          size="sm"
          onClick={handleRun}
          disabled={running}
          className="h-7 gap-1.5 px-3 text-xs font-medium"
        >
          {running ? (
            <Spinner className="size-3.5 animate-spin" />
          ) : (
            <Play weight="fill" className="size-3" />
          )}
          Run
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleReset}
          className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowCounterClockwise className="size-3.5" />
          Reset
        </Button>
        <span
          className="order-last w-full truncate font-mono text-[11px] text-muted-foreground sm:order-none sm:ml-auto sm:w-auto"
          aria-live="polite"
        >
          {status}
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setExpanded((v) => !v)}
          className={cn(
            "ml-auto h-7 shrink-0 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground sm:ml-0",
            expanded && "mr-8"
          )}
        >
          {expanded ? (
            <ArrowsInSimple className="size-3.5" />
          ) : (
            <ArrowsOutSimple className="size-3.5" />
          )}
          <span className="sr-only sm:not-sr-only">
            {expanded ? "Collapse" : "Expand"}
          </span>
        </Button>
      </div>
      {mounted ? (
        <CodeMirror
          value={source}
          onChange={setSource}
          theme={codeTheme}
          extensions={extensions}
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            highlightActiveLine: true,
            autocompletion: false,
          }}
          className={cn(
            expanded ? "min-h-0 flex-1 overflow-auto" : "max-h-[480px] overflow-auto"
          )}
        />
      ) : (
        <pre
          className={cn(
            "overflow-auto whitespace-pre bg-navy-950 px-4 py-3 font-mono text-[12px] leading-relaxed text-foreground",
            expanded ? "min-h-0 flex-1" : "max-h-[480px]"
          )}
        >
          {source}
        </pre>
      )}
      <RunOutput
        lines={lines}
        className={expanded ? "shrink-0 [&_pre]:max-h-[28vh]" : undefined}
      />
    </div>
  );

  if (expanded) {
    return (
      <>
        <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
          Editing in expanded view
        </div>
        <Dialog open onOpenChange={(open) => !open && setExpanded(false)}>
          <DialogContent
            className="block h-[92vh] w-[96vw] max-w-none overflow-hidden rounded-md p-0 sm:max-w-none"
            showCloseButton
          >
            <DialogTitle className="sr-only">
              {spec.entry} · expanded editor
            </DialogTitle>
            <div className="h-full">{runner}</div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return runner;
}
