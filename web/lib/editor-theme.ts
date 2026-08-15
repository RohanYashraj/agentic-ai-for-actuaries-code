"use client";

import { EditorView } from "@codemirror/view";
import { githubDarkInit } from "@uiw/codemirror-theme-github";

/** Code panels share the site's navy ledger: GitHub dark syntax colors on navy-950. */
export const codeTheme = [
  githubDarkInit({
    settings: {
      background: "#0d1626",
      foreground: "#c3cad8",
      caret: "#e2b466",
      selection: "rgba(211, 162, 83, 0.25)",
      selectionMatch: "rgba(211, 162, 83, 0.18)",
      lineHighlight: "rgba(236, 228, 212, 0.04)",
      gutterBackground: "#0d1626",
      gutterForeground: "#5c6b85",
      gutterBorder: "rgba(236, 228, 212, 0.1)",
    },
  }),
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
