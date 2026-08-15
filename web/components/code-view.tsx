"use client";

import { python } from "@codemirror/lang-python";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { ArrowsOutSimple } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { codeTheme } from "@/lib/editor-theme";

const extensions = [python(), EditorView.lineWrapping];

function Editor({ source, fill }: { source: string; fill?: boolean }) {
  return (
    <CodeMirror
      value={source}
      readOnly
      editable={false}
      theme={codeTheme}
      extensions={extensions}
      basicSetup={{
        lineNumbers: true,
        foldGutter: false,
        highlightActiveLine: false,
        autocompletion: false,
      }}
      className={fill ? "h-full overflow-auto" : "max-h-[420px] overflow-auto"}
    />
  );
}

/** Read-only source display sharing the editor's skin.
 * With `expandable`, a floating button opens a near-fullscreen popup. */
export function CodeView({
  source,
  expandable = false,
  title,
}: {
  source: string;
  expandable?: boolean;
  title?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!expandable) return <Editor source={source} />;

  return (
    <div className="relative">
      <Editor source={source} />
      <Button
        size="sm"
        variant="secondary"
        onClick={() => setExpanded(true)}
        className="absolute right-2 top-2 h-7 gap-1.5 px-2 text-xs shadow-sm"
      >
        <ArrowsOutSimple className="size-3.5" />
        Expand
      </Button>
      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent
          className="block h-[92vh] w-[96vw] max-w-none overflow-hidden rounded-md p-0 sm:max-w-none"
          showCloseButton
        >
          <DialogTitle className="sr-only">
            {title ?? "Source code"} · expanded view
          </DialogTitle>
          <div className="flex h-full flex-col">
            {title && (
              <p className="shrink-0 border-b border-border px-4 py-2.5 pr-12 font-mono text-xs text-muted-foreground">
                {title}
              </p>
            )}
            <div className="min-h-0 flex-1">
              <Editor source={source} fill />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
