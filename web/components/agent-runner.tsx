"use client";

import {
  ArrowSquareOut,
  CaretDown,
  Play,
  Spinner,
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
import type { AgentEntry } from "@/lib/agents";
import { colabUrl } from "@/lib/links";

type Block =
  | { type: "input"; text: string }
  | { type: "markdown"; text: string }
  | { type: "tool"; name: string; args?: string; result?: string; done: boolean }
  | { type: "step"; name: string }
  | { type: "stdout"; lines: string[] };

type RunState = "idle" | "streaming" | "done" | "error" | "limited";

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
        args: event.args ? String(event.args) : undefined,
        done: false,
      });
      return next;
    case "ToolCallCompleted": {
      for (let i = next.length - 1; i >= 0; i--) {
        const b = next[i];
        if (b.type === "tool" && !b.done && b.name === String(event.tool)) {
          next[i] = {
            ...b,
            done: true,
            result: event.result ? String(event.result) : undefined,
          };
          return next;
        }
      }
      return next;
    }
    case "StepStarted":
      if (event.step) next.push({ type: "step", name: String(event.step) });
      return next;
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

function ToolChip({ block }: { block: Extract<Block, { type: "tool" }> }) {
  return (
    <Collapsible className="my-2">
      <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-sm border border-border bg-navy-800/60 px-2.5 py-1.5 text-left font-mono text-xs text-cream-200">
        {block.done ? (
          <Wrench className="size-3.5 shrink-0 text-run-ok" />
        ) : (
          <Spinner className="size-3.5 shrink-0 animate-spin text-gold-300" />
        )}
        <span className="truncate">{block.name}</span>
        <CaretDown className="ml-auto size-3 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="rounded-b-sm border-x border-b border-border bg-navy-950/60 px-3 py-2 font-mono text-[11.5px] leading-relaxed text-muted-foreground">
        {block.args && (
          <p className="break-all">
            <span className="text-cream-400">args </span>
            {block.args}
          </p>
        )}
        {block.result && (
          <p className="mt-1 break-all">
            <span className="text-cream-400">result </span>
            {block.result}
          </p>
        )}
        {!block.args && !block.result && <p>no arguments recorded</p>}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AgentRunner({
  agent,
  chapter,
  source,
}: {
  agent: AgentEntry;
  chapter: string;
  source?: string;
}) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [state, setState] = useState<RunState>("idle");
  const [notice, setNotice] = useState<string>("");
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [blocks]);

  const handleRun = useCallback(async () => {
    setBlocks([]);
    setNotice("");
    setState("streaming");
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch(`/api/py/agents/${agent.id}/run`, {
        method: "POST",
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
      for (;;) {
        const { value, done } = await reader.read();
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
          if (event.type === "Fatal" || event.type === "RunError") {
            failed = true;
            setState("error");
            setNotice(String(event.detail ?? "The run failed on the server."));
          } else {
            setBlocks((prev) => reduceBlocks(prev, event));
          }
        }
      }
      if (!failed) setState("done");
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setState("error");
        setNotice("Connection lost. Try again, or open the chapter in Colab.");
      }
    }
  }, [agent.id]);

  const streaming = state === "streaming";

  return (
    <div className="overflow-hidden rounded-md border border-border bg-navy-950/60">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <Button
          size="sm"
          onClick={handleRun}
          disabled={streaming || (state === "limited" && notice !== "minute")}
          className="h-7 gap-1.5 px-3 text-xs font-medium"
        >
          {streaming ? (
            <Spinner className="size-3.5 animate-spin" />
          ) : (
            <Play weight="fill" className="size-3" />
          )}
          Run agent
        </Button>
        <span className="font-mono text-[11px] text-muted-foreground">
          about {agent.estSeconds}s · live Gemini call
        </span>
        <a
          href={colabUrl(chapter)}
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-cream-100"
        >
          Open in Colab
          <ArrowSquareOut className="size-3" />
        </a>
      </div>

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
      {state === "error" && notice && (
        <div className="border-b border-border px-4 py-3 text-sm text-run-err">
          {notice}
        </div>
      )}

      {blocks.length > 0 && (
        <div ref={scrollRef} className="max-h-[420px] overflow-auto px-4 py-3">
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
        </div>
      )}
      {source !== undefined && blocks.length === 0 && state === "idle" && (
        <p className="px-4 py-3 text-sm text-muted-foreground">
          Runs the unmodified chapter script on the server and streams the
          agent&apos;s tool calls and reasoning here.
        </p>
      )}
    </div>
  );
}
