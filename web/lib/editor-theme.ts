"use client";

import { EditorView } from "@codemirror/view";
import { githubLight } from "@uiw/codemirror-theme-github";

/** Code panels use the standard GitHub light look; the site's mono font. */
export const codeTheme = [
  githubLight,
  EditorView.theme({
    "&": {
      fontFamily: "var(--font-plex-mono), ui-monospace, monospace",
    },
    ".cm-content": {
      fontFamily: "var(--font-plex-mono), ui-monospace, monospace",
    },
    ".cm-gutters": {
      fontFamily: "var(--font-plex-mono), ui-monospace, monospace",
    },
  }),
];
