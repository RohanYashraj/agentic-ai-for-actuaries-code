"use client";

/** Typed client for the static Pyodide worker (public/pyodide-worker.js).
 *
 * One shared worker per page; runs are serialized (Pyodide's stdout and
 * cwd are process-global). cancel() terminates the worker and respawns a
 * fresh one on the next run — the worker rebuilds its caches itself.
 */

export interface WorkerDemoSpec {
  dir: string;
  entry: string;
  files: string[];
  packages: string[];
  data: string[];
}

export type DemoRunEvent =
  | { kind: "status"; text: string }
  | { kind: "stdout"; text: string }
  | { kind: "stderr"; text: string }
  | { kind: "done"; ms: number }
  | { kind: "error"; message: string };

type Listener = (event: DemoRunEvent) => void;

let worker: Worker | null = null;
let seq = 0;
const listeners = new Map<number, Listener>();

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker("/pyodide-worker.js");
    worker.onmessage = (e: MessageEvent) => {
      const msg = e.data;
      const listener = listeners.get(msg.id);
      if (!listener) return;
      switch (msg.type) {
        case "status":
        case "stdout":
        case "stderr":
          listener({ kind: msg.type, text: msg.text });
          break;
        case "done":
          listener({ kind: "done", ms: msg.ms });
          listeners.delete(msg.id);
          break;
        case "error":
          listener({ kind: "error", message: msg.message });
          listeners.delete(msg.id);
          break;
      }
    };
  }
  return worker;
}

export function runDemo(
  spec: WorkerDemoSpec,
  entrySource: string,
  onEvent: Listener
): { cancel: () => void } {
  const id = ++seq;
  listeners.set(id, onEvent);
  getWorker().postMessage({ type: "run", id, spec, entrySource });
  return {
    cancel: () => {
      if (!listeners.has(id)) return;
      listeners.delete(id);
      // Terminating kills every queued run too; drop all listeners so
      // panes don't wait forever, then respawn lazily on the next run.
      for (const [otherId, listener] of listeners) {
        listener({ kind: "error", message: "cancelled" });
        listeners.delete(otherId);
      }
      worker?.terminate();
      worker = null;
      onEvent({ kind: "error", message: "cancelled" });
    },
  };
}
