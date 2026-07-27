/**
 * Marko's `CompileError` carries a Babel-style code frame inside its message:
 *
 *     at app/tags/index.marko:1:2
 *     > 1 | <log/>
 *         |  ^^^ The [`<log>` tag](https://markojs.com/docs/...) requires ...
 *       2 |
 *
 * Rendering that string as-is loses the alignment the frame depends on and
 * leaves the diagnostic's markdown as literal brackets and raw URLs. Parsing it
 * back into rows lets the playground syntax highlight the source, align the
 * carets on a real grid, and turn the links into links.
 */

/** `at <file>:<line>:<col>` */
const LOCATION_ROW = /^\s*at (.+?):(\d+):(\d+)\s*$/;
/** `> 1 | <source>` for the offending line, `  2 | <source>` for context. */
const CODE_ROW = /^(\s*)(>)?\s*(\d+) \|(?: ?(.*))?$/;
/** `    |  ^^^ <message>` — the pipe aligns with the code rows' pipe. */
const MARKER_ROW = /^\s*\|( *)(\^+) ?(.*)$/;

const DOCS_ORIGIN = "https://markojs.com/";

export interface CodeRow {
  num: number;
  code: string;
  /** The line the compiler pointed at, marked `>` in the raw frame. */
  isError: boolean;
  /** Column offset and width of the `^^^` run underlining this row. */
  marker?: { start: number; width: number };
}

export interface CodeFrame {
  file: string;
  line: number;
  col: number;
  rows: CodeRow[];
}

export interface ParsedError {
  name: string;
  /** The diagnostic itself, as markdown. Empty when the error carries none. */
  message: string;
  frame?: CodeFrame;
  /** Anything that did not belong to the frame, such as a runtime stack. */
  details?: string;
}

export function parseError(err: unknown): ParsedError {
  const name = errorName(err);
  const raw = errorMessage(err);
  const lines = raw.split("\n");

  let frame: CodeFrame | undefined;
  let message = "";
  const leading: string[] = [];
  const trailing: string[] = [];

  for (const line of lines) {
    const location = LOCATION_ROW.exec(line);
    if (location && !frame) {
      frame = {
        file: location[1],
        line: +location[2],
        col: +location[3],
        rows: [],
      };
      continue;
    }

    if (frame) {
      const code = CODE_ROW.exec(line);
      if (code) {
        frame.rows.push({
          num: +code[3],
          code: code[4] ?? "",
          isError: !!code[2],
        });
        continue;
      }

      const marker = MARKER_ROW.exec(line);
      if (marker) {
        const row = frame.rows[frame.rows.length - 1];
        if (row) {
          // The code starts one space past the pipe, so the caret's own
          // leading run is one wider than its offset into the source line.
          row.marker = { start: marker[1].length - 1, width: marker[2].length };
        }
        if (marker[3]) message = marker[3];
        continue;
      }
    }

    if (line.trim()) (frame ? trailing : leading).push(line);
  }

  // A frame whose trailing context line is blank adds nothing but height.
  while (frame?.rows.length && isBlankTail(frame.rows)) frame.rows.pop();

  if (!message) message = leading.join("\n").trim();
  else if (leading.length) trailing.unshift(...leading);

  return {
    name,
    message,
    frame: frame?.rows.length ? frame : undefined,
    details: trailing.join("\n").trim() || undefined,
  };
}

function isBlankTail(rows: CodeRow[]) {
  const last = rows[rows.length - 1];
  return rows.length > 1 && !last.isError && !last.marker && !last.code.trim();
}

function errorName(err: unknown) {
  const name = (err as Error)?.name;
  return typeof name === "string" && name ? name : "Error";
}

function errorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  return typeof err === "string" ? err : String(err);
}

export type Inline =
  | { type: "text"; value: string }
  | { type: "code"; value: string }
  | { type: "link"; href: string; external: boolean; children: Inline[] };

/** `[label](href)` or `` `code` ``. Labels may themselves hold code spans. */
const INLINE_TOKEN = /\[((?:[^[\]]|\[[^\]]*\])*)\]\(([^\s)]+)\)|`([^`]+)`/g;

/**
 * Diagnostics are authored as markdown, but only ever use links and code spans,
 * so a full markdown parser would be far more machinery than the grammar needs.
 */
export function parseInline(markdown: string): Inline[] {
  const nodes: Inline[] = [];
  let last = 0;

  for (const match of markdown.matchAll(INLINE_TOKEN)) {
    pushText(nodes, markdown.slice(last, match.index));
    last = match.index + match[0].length;

    if (match[3] !== undefined) {
      nodes.push({ type: "code", value: match[3] });
    } else {
      const href = resolveHref(match[2]);
      nodes.push({
        type: "link",
        href,
        external: href === match[2] && /^[a-z]+:/i.test(href),
        children: parseInline(match[1]),
      });
    }
  }

  pushText(nodes, markdown.slice(last));
  return nodes;
}

function pushText(nodes: Inline[], value: string) {
  if (value) nodes.push({ type: "text", value });
}

/**
 * Diagnostics link to markojs.com absolutely. The playground is served from
 * that same site, so keep those links in-page — and on the right deploy, since
 * PR previews live under a base path.
 */
function resolveHref(href: string) {
  if (!href.startsWith(DOCS_ORIGIN)) return href;
  // `import.meta.env` is absent when this module runs outside the bundler.
  const base =
    typeof import.meta.env === "undefined" ? "/" : import.meta.env.BASE_URL;
  return base + href.slice(DOCS_ORIGIN.length);
}

const LANGS: Record<string, string> = {
  marko: "marko",
  js: "js",
  mjs: "js",
  cjs: "js",
  ts: "ts",
  mts: "ts",
  json: "json",
  css: "css",
  html: "html",
};

export function langForFile(file: string | undefined) {
  const ext = file?.slice(file.lastIndexOf(".") + 1).toLowerCase();
  return (ext && LANGS[ext]) || "marko";
}
