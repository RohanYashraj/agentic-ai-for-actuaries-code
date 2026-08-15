"use client";

import {
  ArrowSquareOut,
  ArrowsInSimple,
  ArrowsOutSimple,
  CaretDown,
  Play,
  Spinner,
  Stop,
  WarningCircle,
  Wrench,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Editor } from "@/components/code-view";
import type { AgentEntry } from "@/lib/agents";
import { colabUrl } from "@/lib/links";
import { cn } from "@/lib/utils";

type Block =
  | { type: "input"; text: string }
  | { type: "markdown"; text: string }
  | {
      type: "tool";
      name: string;
      callId?: string;
      args?: string;
      result?: string;
      detail?: string;
      done: boolean;
      error?: boolean;
      startedAt: number;
      durationMs?: number;
    }
  | { type: "step"; name: string }
  | { type: "log"; level: string; message: string }
  | { type: "stdout"; lines: string[] };

type RunState =
  | "idle"
  | "starting"
  | "streaming"
  | "done"
  | "stopped"
  | "truncated"
  | "error"
  | "limited";

// A genuine network stall (the server sends keepalive comments every 15s,
// so healthy streams never go this quiet).
const STALL_MS = 45_000;

function reduceBlocks(blocks: Block[], event: Record<string, unknown>): Block[] {
  const next = [...blocks];
  const last = next[next.length - 1];
  switch (event.type) {
    case "RunInput":
      next.push({ type: "input", text: String(event.input ?? "") });
      return next;
    case "RunContent":
    case "RunIntermediateContent": {
      const delta = typeof event.delta === "string" ? event.delta : "";
      if (!delta) return blocks;
      if (last?.type === "markdown") {
        next[next.length - 1] = { ...last, text: last.text + delta };
      } else {
        next.push({ type: "markdown", text: delta });
      }
      return next;
    }
    case "ToolCallStarted":
      next.push({
        type: "tool",
        name: String(event.tool ?? "tool"),
        callId: typeof event.toolCallId === "string" ? event.toolCallId : undefined,
        args: event.args ? String(event.args) : undefined,
        done: false,
        startedAt: Date.now(),
      });
      return next;
    case "ToolCallCompleted":
    case "ToolCallError": {
      const callId =
        typeof event.toolCallId === "string" ? event.toolCallId : undefined;
      const name = typeof event.tool === "string" ? event.tool : undefined;
      // Match by call id first; fall back to newest open chip with the same
      // name; last resort, the oldest open chip. Never leave a chip spinning.
      let idx = callId
        ? next.findIndex((b) => b.type === "tool" && !b.done && b.callId === callId)
        : -1;
      if (idx < 0 && name) {
        for (let i = next.length - 1; i >= 0; i--) {
          const b = next[i];
          if (b.type === "tool" && !b.done && b.name === name) {
            idx = i;
            break;
          }
        }
      }
      if (idx < 0) idx = next.findIndex((b) => b.type === "tool" && !b.done);
      const isError = event.error === true || event.type === "ToolCallError";
      if (idx < 0) {
        if (isError) {
          next.push({
            type: "log",
            level: "error",
            message: String(event.detail ?? "a tool call failed"),
          });
        }
        return next;
      }
      const b = next[idx] as Extract<Block, { type: "tool" }>;
      next[idx] = {
        ...b,
        done: true,
        error: isError || undefined,
        result: event.result ? String(event.result) : b.result,
        detail: typeof event.detail === "string" ? event.detail : undefined,
        durationMs: Date.now() - b.startedAt,
      };
      return next;
    }
    case "StepStarted":
      if (event.step) next.push({ type: "step", name: String(event.step) });
      return next;
    case "StepError": {
      const where = event.step ? `step ${String(event.step)} failed` : "a step failed";
      const why = typeof event.detail === "string" ? ` — ${event.detail}` : "";
      next.push({ type: "log", level: "error", message: where + why });
      return next;
    }
    case "Log": {
      const message = String(event.message ?? "");
      if (!message) return blocks;
      next.push({ type: "log", level: String(event.level ?? "info"), message });
      return next;
    }
    case "Stdout": {
      const line = String(event.line ?? "");
      if (last?.type === "stdout") {
        next[next.length - 1] = { ...last, lines: [...last.lines, line] };
      } else {
        next.push({ type: "stdout", lines: [line] });
      }
      return next;
    }
    default:
      return blocks;
  }
}

function prettyJson(raw?: string): string | undefined {
  if (!raw) return undefined;
  try {
    const v = JSON.parse(raw);
    return typeof v === "string" ? v : JSON.stringify(v, null, 2);
  } catch {
    return raw;
  }
}

function ToolChip({ block }: { block: Extract<Block, { type: "tool" }> }) {
  const args = prettyJson(block.args);
  const result = prettyJson(block.result);
  return (
    <Collapsible className="my-2">
      <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-sm border border-border bg-navy-800/60 px-2.5 py-1.5 text-left font-mono text-xs text-cream-200">
        {!block.done ? (
          <Spinner className="size-3.5 shrink-0 animate-spin text-gold-300" />
        ) : block.error ? (
          <WarningCircle className="size-3.5 shrink-0 text-run-err" />
        ) : (
          <Wrench className="size-3.5 shrink-0 text-run-ok" />
        )}
        <span className="truncate">{block.name}</span>
        {block.done && block.error && (
          <span className="shrink-0 text-run-err">failed</span>
        )}
        {block.done && block.durationMs !== undefined && (
          <span className="shrink-0 text-muted-foreground">
            {(block.durationMs / 1000).toFixed(1)}s
          </span>
        )}
        <CaretDown className="ml-auto size-3 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="rounded-b-sm border-x border-b border-border bg-navy-950/60 px-3 py-2 font-mono text-[11.5px] leading-relaxed text-muted-foreground">
        {block.detail && (
          <p className="mb-1 whitespace-pre-wrap break-all text-run-err">
            {block.detail}
          </p>
        )}
        {args && (
          <div className="break-all">
            <span className="text-cream-400">args</span>
            <pre className="mt-0.5 overflow-x-auto whitespace-pre-wrap">{args}</pre>
          </div>
        )}
        {result && (
          <div className="mt-1 break-all">
            <span className="text-cream-400">result</span>
            <pre className="mt-0.5 overflow-x-auto whitespace-pre-wrap">{result}</pre>
          </div>
        )}
        {!args && !result && !block.detail && <p>no arguments recorded</p>}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AgentRunner({
  agent,
  chapter,
  source,
  title,
}: {
  agent: AgentEntry;
  chapter: string;
  source?: string;
  title?: string;
}) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [state, setState] = useState<RunState>("idle");
  const [expanded, setExpanded] = useState(false);
  const [notice, setNotice] = useState<string>("");
  const [excerpt, setExcerpt] = useState<string>("");
  const [elapsed, setElapsed] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const stoppedRef = useRef(false);
  const startRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [blocks]);

  const running = state === "starting" || state === "streaming";

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(
      () => setElapsed(Math.round((Date.now() - startRef.current) / 1000)),
      1000
    );
    return () => clearInterval(timer);
  }, [running]);

  const handleStop = useCallback(() => {
    stoppedRef.current = true;
    abortRef.current?.abort();
    setState("stopped");
    setNotice("");
  }, []);

  const handleRun = useCallback(async () => {
    setBlocks([]);
    setNotice("");
    setExcerpt("");
    setElapsed(0);
    stoppedRef.current = false;
    startRef.current = Date.now();
    setState("starting");
    const controller = new AbortController();
    abortRef.current = controller;
    let stallTimer: ReturnType<typeof setTimeout> | undefined;
    try {
      const res = await fetch(`/api/py/agents/${agent.id}/run`, {
        method: "POST",
        headers: { "x-agent-run": "1" },
        signal: controller.signal,
      });
      if (res.status === 429) {
        const body = await res.json().catch(() => null);
        setState("limited");
        setNotice(String(body?.limitedBy ?? "day"));
        return;
      }
      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => null);
        setState("error");
        setNotice(
          body?.detail ??
            "The agent runner is not available right now. Open the chapter in Colab instead."
        );
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let failed = false;
      let sawDone = false;
      const armStall = () => {
        clearTimeout(stallTimer);
        stallTimer = setTimeout(
          () => controller.abort(new DOMException("stalled", "TimeoutError")),
          STALL_MS
        );
      };
      armStall();
      for (;;) {
        const { value, done } = await reader.read();
        armStall();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";
        for (const frame of frames) {
          const line = frame.trim();
          if (!line.startsWith("data: ")) continue;
          let event: Record<string, unknown>;
          try {
            event = JSON.parse(line.slice(6));
          } catch {
            continue;
          }
          if (event.type === "Accepted") {
            setState("streaming");
            continue;
          }
          if (event.type === "Done") {
            sawDone = true;
            continue;
          }
          if (
            event.type === "Fatal" ||
            event.type === "RunError" ||
            event.type === "WorkflowError"
          ) {
            failed = true;
            setState("error");
            setNotice(String(event.detail ?? "The run failed on the server."));
            if (typeof event.excerpt === "string") setExcerpt(event.excerpt);
          } else {
            setState((s) => (s === "starting" ? "streaming" : s));
            setBlocks((prev) => reduceBlocks(prev, event));
          }
        }
      }
      if (!failed && !stoppedRef.current) {
        if (sawDone) {
          setState("done");
        } else {
          // Clean EOF without the runner's Done marker: the connection was
          // cut mid-run — do not present a half-finished answer as success.
          setState("truncated");
          setNotice(
            "The stream ended before the run finished. Try again, or open the chapter in Colab."
          );
        }
      }
    } catch (err) {
      if (stoppedRef.current) return;
      if ((err as Error).name === "TimeoutError") {
        setState("error");
        setNotice(
          "The connection went quiet for too long. Try again, or open the chapter in Colab."
        );
      } else if ((err as Error).name !== "AbortError") {
        setState("error");
        setNotice("Connection lost. Try again, or open the chapter in Colab.");
      }
    } finally {
      clearTimeout(stallTimer);
    }
  }, [agent.id]);

  const status = (() => {
    switch (state) {
      case "starting":
        return "starting on the server… cold starts can take ~20s";
      case "streaming":
        return `running · ${elapsed}s of about ${agent.estSeconds}s`;
      case "done":
        return `finished in ${elapsed}s`;
      case "stopped":
        return `stopped after ${elapsed}s`;
      default:
        return `about ${agent.estSeconds}s · live model call`;
    }
  })();

  // The full runner UI: rendered inline, or inside the fullscreen dialog
  // when expanded — one instance, so run state carries over (mirrors the
  // browser-demo runner's shell).
  const runner = (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-border bg-navy-950/60",
        expanded && "flex h-full flex-col rounded-none border-0"
      )}
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2">
        <Button
          size="sm"
          onClick={handleRun}
          disabled={running || (state === "limited" && notice !== "minute")}
          className="h-7 gap-1.5 px-3 text-xs font-medium"
        >
          {running ? (
            <Spinner className="size-3.5 animate-spin" />
          ) : (
            <Play weight="fill" className="size-3" />
          )}
          Run agent
        </Button>
        {running && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleStop}
            className="h-7 gap-1.5 px-3 text-xs font-medium"
          >
            <Stop weight="fill" className="size-3" />
            Stop
          </Button>
        )}
        <span
          aria-live="polite"
          className="truncate font-mono text-[11px] text-muted-foreground"
        >
          {status}
        </span>
        <a
          href={colabUrl(chapter)}
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-cream-100"
        >
          Open in Colab
          <ArrowSquareOut className="size-3" />
        </a>
        {source !== undefined && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setExpanded((v) => !v)}
            className={cn(
              "h-7 shrink-0 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground",
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
        )}
      </div>

      {source !== undefined && (
        <div
          className={cn(
            "border-b border-border",
            expanded && "min-h-0 flex-1 overflow-auto"
          )}
        >
          <Editor source={source} fill={expanded} />
        </div>
      )}

      {state === "limited" && (
        <div className="border-b border-border px-4 py-3 text-sm">
          {notice === "minute" ? (
            <>
              <p className="text-cream-200">
                A few runs launched in under a minute.
              </p>
              <p className="mt-1 text-muted-foreground">
                Give it a moment, then press Run again.
              </p>
            </>
          ) : (
            <>
              <p className="text-cream-200">
                {notice === "global"
                  ? "The site's shared run budget is spent for today."
                  : "You have used today's runs on this connection."}
              </p>
              <p className="mt-1 text-muted-foreground">
                Open the chapter in Colab to keep going with your own free
                Gemini key. Limits reset daily.
              </p>
            </>
          )}
        </div>
      )}
      {state === "truncated" && notice && (
        <div className="border-b border-border px-4 py-3 text-sm text-gold-300">
          {notice}
        </div>
      )}
      {state === "error" && notice && (
        <div className="border-b border-border px-4 py-3 text-sm text-run-err">
          <p>{notice}</p>
          {excerpt && (
            <details className="mt-2">
              <summary className="cursor-pointer font-mono text-[11px] text-muted-foreground">
                error details
              </summary>
              <pre className="mt-1 overflow-x-auto whitespace-pre-wrap font-mono text-[11px] text-muted-foreground">
                {excerpt}
              </pre>
            </details>
          )}
        </div>
      )}

      {blocks.length > 0 && (
        <div
          ref={scrollRef}
          className={cn(
            "overflow-auto px-4 py-3",
            expanded ? "max-h-[32vh] shrink-0" : "max-h-[420px]"
          )}
        >
          {blocks.map((block, i) => {
            switch (block.type) {
              case "input":
                return (
                  <p
                    key={i}
                    className="my-2 border-l-2 border-gold-400/60 pl-3 font-mono text-xs text-cream-400"
                  >
                    {block.text}
                  </p>
                );
              case "step":
                return (
                  <p
                    key={i}
                    className="mt-4 mb-1 font-mono text-[11px] uppercase tracking-[0.18em] text-gold-300"
                  >
                    {block.name}
                  </p>
                );
              case "tool":
                return <ToolChip key={i} block={block} />;
              case "log":
                return (
                  <p
                    key={i}
                    className={`my-1.5 font-mono text-[11.5px] ${
                      block.level === "error" ? "text-run-err" : "text-gold-300"
                    }`}
                  >
                    {block.level === "error" ? "error" : "warning"} ·{" "}
                    {block.message}
                  </p>
                );
              case "stdout":
                return (
                  <pre
                    key={i}
                    className="my-2 overflow-x-auto rounded-sm bg-navy-950 p-2.5 font-mono text-[12px] leading-relaxed text-foreground"
                  >
                    {block.lines.join("\n")}
                  </pre>
                );
              case "markdown":
                return (
                  <div key={i} className="agent-prose">
                    <Markdown remarkPlugins={[remarkGfm]}>
                      {block.text}
                    </Markdown>
                  </div>
                );
            }
          })}
          {state === "done" && (
            <p className="mt-3 font-mono text-[11px] text-muted-foreground">
              ── run complete ──
            </p>
          )}
          {state === "stopped" && (
            <p className="mt-3 font-mono text-[11px] text-muted-foreground">
              ── run stopped ──
            </p>
          )}
        </div>
      )}
      {running && blocks.length === 0 && (
        <p className="px-4 py-3 font-mono text-xs text-muted-foreground">
          {state === "starting"
            ? "Waking the server and preparing the workspace…"
            : "Agent accepted — waiting for the first tokens…"}
        </p>
      )}
      {source !== undefined && blocks.length === 0 && state === "idle" && (
        <p className="shrink-0 px-4 py-3 text-sm text-muted-foreground">
          Runs the unmodified chapter script on the server and streams the
          agent&apos;s tool calls and reasoning here.
        </p>
      )}
    </div>
  );

  if (expanded) {
    return (
      <>
        <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
          Viewing in expanded view
        </div>
        <Dialog open onOpenChange={(open) => !open && setExpanded(false)}>
          <DialogContent
            className="block h-[92vh] w-[96vw] max-w-none overflow-hidden rounded-md p-0 sm:max-w-none"
            showCloseButton
          >
            <DialogTitle className="sr-only">
              {title ?? agent.id} · expanded view
            </DialogTitle>
            <div className="h-full">{runner}</div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return runner;
}
