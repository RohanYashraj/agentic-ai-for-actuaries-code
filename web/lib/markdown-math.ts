/**
 * Normalise model output so remark-math sees only genuine math.
 *
 * Models mix LaTeX with currency ("$70,967,919 ... $68,669,640"), and
 * remark-math would swallow everything between the two dollar signs as
 * a formula. The mainstream chat UIs avoid this with two conventions,
 * reproduced here:
 *
 *  1. `\( ... \)` and `\[ ... \]` are accepted as inline / display math
 *     (remark-math only knows dollar delimiters, so they are rewritten).
 *  2. A single `$` opens inline math only when the closing `$` satisfies
 *     Pandoc's rules: no whitespace right after the opening, none right
 *     before the closing, no digit right after the closing, and both on
 *     the same paragraph. Any `$` that cannot pair up this way is
 *     escaped so it renders as a literal dollar sign.
 *
 * Fenced and inline code are never touched. `$$ ... $$` spans are left
 * as written, since models only use them deliberately.
 */
export function prepareMathMarkdown(src: string): string {
  // Odd indices are code (fenced, including an unclosed fence during
  // streaming, or inline); even indices are prose.
  const parts = src.split(/(```[\s\S]*?(?:```|$)|`[^`\n]+`)/);
  return parts.map((p, i) => (i % 2 ? p : normalise(p))).join("");
}

function normalise(text: string): string {
  const out = text
    .replace(/\\\[([\s\S]+?)\\\]/g, (_, m: string) => `$$${m}$$`)
    .replace(/\\\(([\s\S]+?)\\\)/g, (_, m: string) => `$${m}$`);
  return escapeUnpairedDollars(out);
}

function escapeUnpairedDollars(text: string): string {
  let result = "";
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === "\\" && i + 1 < text.length) {
      result += ch + text[i + 1];
      i += 2;
      continue;
    }
    if (ch !== "$") {
      result += ch;
      i += 1;
      continue;
    }
    // `$$` display span: copy through to its closing `$$` untouched.
    if (text[i + 1] === "$") {
      const close = text.indexOf("$$", i + 2);
      const end = close === -1 ? text.length : close + 2;
      result += text.slice(i, end);
      i = end;
      continue;
    }
    const close = findInlineClose(text, i);
    if (close === -1) {
      result += "\\$";
      i += 1;
    } else {
      result += text.slice(i, close + 1);
      i = close + 1;
    }
  }
  return result;
}

function findInlineClose(text: string, open: number): number {
  const first = text[open + 1];
  if (first === undefined || /\s/.test(first)) return -1;
  for (let j = open + 1; j < text.length; j++) {
    const c = text[j];
    if (c === "\\") {
      j += 1;
      continue;
    }
    if (c === "\n" && text[j + 1] === "\n") return -1; // paragraph break
    if (c !== "$") continue;
    if (text[j + 1] === "$") return -1; // ran into a display span
    const before = text[j - 1];
    const after = text[j + 1];
    if (/\s/.test(before)) continue; // "$70 ... $68": not a closer
    if (after !== undefined && /[0-9]/.test(after)) continue;
    return j;
  }
  return -1;
}
