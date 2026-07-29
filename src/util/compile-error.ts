/**
 * Marko's `CompileError` carries a Babel-style code frame inside its message:
 *
 *     at index.marko:1:2
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

/** Lines of source shown either side of the offending one. */
const CONTEXT_LINES = 2;
/** Tabs are expanded so the caret row lines up on the monospace grid. */
const TAB_WIDTH = 2;

/** The subset of an error worth reading structurally, from any producer. */
interface ErrorMeta {
  loc?: unknown;
  label?: unknown;
  filename?: unknown;
  id?: unknown;
  errors?: unknown;
}

interface NormalLoc {
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
}

/**
 * Flattens aggregates and normalizes each error. Marko raises `CompileErrors`
 * holding one `CompileError` per diagnostic, and each deserves its own card.
 */
export function normalizeErrors(
  errors: readonly unknown[],
  files: Record<string, string> = {},
): ParsedError[] {
  const out: ParsedError[] = [];
  for (const err of errors) collectError(err, files, out);
  return out;
}

function collectError(
  err: unknown,
  files: Record<string, string>,
  out: ParsedError[],
) {
  const children = (err as ErrorMeta | undefined)?.errors;
  if (Array.isArray(children) && children.length) {
    for (const child of children) collectError(child, files, out);
  } else {
    out.push(parseError(err, files));
  }
}

/**
 * Records the file a compile error came from. `CompileError` carries `loc` and
 * `label` but not its filename, and the copy in the message is relativized
 * against a cwd the playground does not have.
 */
export function attachErrorFile<T>(err: T, file: string): T {
  const meta = err as ErrorMeta;
  if (meta && typeof meta === "object") {
    if (Array.isArray(meta.errors)) {
      for (const child of meta.errors) attachErrorFile(child, file);
    }
    if (meta.filename === undefined) meta.filename = file;
  }
  return err;
}

/**
 * Reads position and message off the error itself. Preferred over the frame
 * text, which loses the diagnostic whenever the source is indented with tabs
 * and cannot be relied on for producers other than the Marko compiler.
 */
function fromMetadata(
  err: unknown,
  files: Record<string, string>,
): ParsedError | undefined {
  const meta = err as ErrorMeta | undefined;
  const loc = normalizeLoc(meta?.loc);
  if (!loc) return undefined;

  const file = firstString(meta?.filename, meta?.id);
  const source = file === undefined ? undefined : files[file];
  if (source === undefined) return undefined;

  const label = typeof meta?.label === "string" ? meta.label : undefined;
  return {
    name: errorName(err),
    message: label ?? errorMessage(err).split("\n")[0].trim(),
    frame: buildFrame(displayPath(file!), source, loc),
  };
}

/** Marko and Babel nest under `start`/`end`; Rollup reports a flat position. */
function normalizeLoc(loc: unknown): NormalLoc | undefined {
  const raw = loc as
    | { line?: unknown; column?: unknown; start?: unknown; end?: unknown }
    | undefined;
  if (!raw || typeof raw !== "object") return undefined;

  if (typeof raw.line === "number") {
    return { line: raw.line, column: numberOr(raw.column, 0) };
  }

  const start = raw.start as { line?: unknown; column?: unknown } | undefined;
  if (typeof start?.line !== "number") return undefined;
  const end = raw.end as { line?: unknown; column?: unknown } | undefined;
  return {
    line: start.line,
    column: numberOr(start.column, 0),
    endLine: typeof end?.line === "number" ? end.line : undefined,
    endColumn: typeof end?.column === "number" ? end.column : undefined,
  };
}

function buildFrame(
  file: string,
  source: string,
  loc: NormalLoc,
): CodeFrame | undefined {
  const lines = source.split(/\r?\n/);
  if (loc.line < 1 || loc.line > lines.length) return undefined;

  const from = Math.max(1, loc.line - CONTEXT_LINES);
  const to = Math.min(lines.length, loc.line + CONTEXT_LINES);
  const rows: CodeRow[] = [];

  for (let num = from; num <= to; num++) {
    const raw = lines[num - 1] ?? "";
    if (num !== loc.line) {
      rows.push({ num, code: expandTabs(raw).text, isError: false });
      continue;
    }
    const start = expandTabs(raw, loc.column).column;
    const end =
      loc.endLine === loc.line && loc.endColumn !== undefined
        ? expandTabs(raw, loc.endColumn).column
        : start;
    rows.push({
      num,
      code: expandTabs(raw).text,
      isError: true,
      marker: { start, width: Math.max(1, end - start) },
    });
  }

  return { file, line: loc.line, col: loc.column + 1, rows };
}

/**
 * Renders tabs as spaces and reports where `column` lands once they are, so the
 * caret row and the source row share one grid.
 */
function expandTabs(line: string, column = 0) {
  let text = "";
  let shifted = column;
  for (let i = 0; i < line.length; i++) {
    if (line[i] !== "\t") {
      text += line[i];
      continue;
    }
    const pad = TAB_WIDTH - (text.length % TAB_WIDTH);
    text += " ".repeat(pad);
    if (i < column) shifted += pad - 1;
  }
  return { text, column: shifted };
}

function firstString(...values: unknown[]) {
  for (const value of values) if (typeof value === "string") return value;
  return undefined;
}

function numberOr(value: unknown, fallback: number) {
  return typeof value === "number" ? value : fallback;
}

/** Workspace paths are absolute; the leading slash is noise in the header. */
function displayPath(file: string) {
  return file.replace(/^\//, "");
}

export function parseError(
  err: unknown,
  files: Record<string, string> = {},
): ParsedError {
  const structured = fromMetadata(err, files);
  if (structured) return structured;

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
