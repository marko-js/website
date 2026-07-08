import {
  type Completion,
  type CompletionContext,
  type CompletionResult,
  autocompletion,
  startCompletion,
} from "@codemirror/autocomplete";
import { type Diagnostic as CmDiagnostic, linter } from "@codemirror/lint";
import type { Text } from "@codemirror/state";
import { EditorView, hoverTooltip, keymap } from "@codemirror/view";
import { marked } from "marked";
import type {
  CodeAction,
  Command,
  CompletionItem,
  MarkedString,
  MarkupContent,
  Position,
  Range,
  TextEdit,
  WorkspaceEdit,
} from "vscode-languageserver-types";

import { LspClient } from "./client";

// Bridges the in-browser language server to CodeMirror: diagnostics (with quick
// fixes), hover, completion and go-to-definition. Positions cross the boundary
// as LSP line/character pairs and are mapped to/from CodeMirror offsets here.
// The server does the embedded-language mapping internally, so `.marko` files
// need no special handling on this side.
//
// `openLocation` navigates to a definition target, which may live in another
// playground file; the editor provides it so it can switch tabs.
export function markoLsp(
  client: LspClient,
  path: string,
  openLocation?: (path: string, position: Position) => void,
) {
  return [
    lspDiagnostics(client, path),
    lspHover(client, path),
    autocompletion({ override: [lspCompletions(client, path)] }),
    completionTriggers(),
    lspDefinition(client, path, openLocation),
  ];
}

// CodeMirror only auto-opens completion while typing word characters, so
// member access (`.`), tags (`<`), attribute tags (`@`) and paths (`/`) never
// trigger it. Open completion after one of these is typed, matching the trigger
// characters the language server advertises.
const TRIGGER_CHAR = /^[.<@/]$/;
function completionTriggers() {
  return EditorView.updateListener.of((update) => {
    if (!update.docChanged) return;
    let triggered = false;
    update.changes.iterChanges((_fromA, _toA, _fromB, _toB, inserted) => {
      if (inserted.length === 1 && TRIGGER_CHAR.test(inserted.sliceString(0))) {
        triggered = true;
      }
    });
    // Dispatching from inside an update is not allowed; defer a tick.
    if (triggered) queueMicrotask(() => startCompletion(update.view));
  });
}

function lspDiagnostics(client: LspClient, path: string) {
  return linter(
    async (view): Promise<CmDiagnostic[]> => {
      client.didChange(path, view.state.doc.toString());
      const diagnostics = await client.validate(path).catch(() => undefined);
      if (!diagnostics) return [];
      const { doc } = view.state;
      return Promise.all(
        diagnostics.map(async (d): Promise<CmDiagnostic> => {
          const from = posToOffset(doc, d.range.start);
          const to = posToOffset(doc, d.range.end);
          // Quick fixes for this diagnostic surface as buttons in the lint
          // tooltip.
          const fixes = await client
            .codeActions(path, d.range, [d])
            .catch(() => undefined);
          const actions = fixes?.filter(isCodeAction).map((action) => ({
            name: action.title,
            apply: () => applyCodeAction(view, client, path, action),
          }));
          return {
            from,
            to: to > from ? to : from,
            severity: SEVERITY[d.severity ?? 1] ?? "error",
            message: d.message,
            source: d.source,
            actions: actions?.length ? actions : undefined,
          };
        }),
      );
    },
    { delay: 350 },
  );
}

function lspDefinition(
  client: LspClient,
  path: string,
  openLocation?: (path: string, position: Position) => void,
) {
  const go = (view: EditorView, offset: number) => {
    if (!openLocation) return;
    void client
      .definition(path, offsetToPos(view.state.doc, offset))
      .then((result) => {
        const target = firstDefinition(result);
        if (target) {
          openLocation(LspClient.pathForUri(target.uri), target.range.start);
        }
      })
      .catch(() => {});
  };
  return [
    // Cmd/Ctrl+click jumps to the definition under the pointer.
    EditorView.domEventHandlers({
      mousedown(event, view) {
        if (!openLocation || !(event.metaKey || event.ctrlKey)) return false;
        const offset = view.posAtCoords({ x: event.clientX, y: event.clientY });
        if (offset == null) return false;
        event.preventDefault();
        go(view, offset);
        return true;
      },
    }),
    // F12 jumps to the definition at the cursor.
    keymap.of([
      {
        key: "F12",
        run(view) {
          go(view, view.state.selection.main.head);
          return true;
        },
      },
    ]),
  ];
}

function firstDefinition(
  result: Awaited<ReturnType<LspClient["definition"]>>,
): { uri: string; range: Range } | undefined {
  if (!result) return;
  const first = Array.isArray(result) ? result[0] : result;
  if (!first) return;
  return "targetUri" in first
    ? { uri: first.targetUri, range: first.targetSelectionRange }
    : { uri: first.uri, range: first.range };
}

// A bare `Command` has a string `command`; a `CodeAction` carries an `edit`
// and/or `data`. Only code actions are applied here.
function isCodeAction(action: Command | CodeAction): action is CodeAction {
  return typeof (action as Command).command !== "string";
}

function applyCodeAction(
  view: EditorView,
  client: LspClient,
  path: string,
  action: CodeAction,
) {
  if (action.edit) {
    applyWorkspaceEdit(view, path, action.edit);
  } else if (action.data != null) {
    // The edit is filled in lazily by the resolve request.
    void client
      .resolveCodeAction(action)
      .then((resolved) => {
        if (resolved?.edit) applyWorkspaceEdit(view, path, resolved.edit);
      })
      .catch(() => {});
  }
}

// Apply the parts of a workspace edit that target the current file. Cross-file
// edits (rare for a quick fix) are left alone.
function applyWorkspaceEdit(
  view: EditorView,
  path: string,
  edit: WorkspaceEdit,
) {
  const uri = LspClient.uri(path);
  let edits: TextEdit[] | undefined;
  if (edit.changes) {
    edits = edit.changes[uri];
  } else if (edit.documentChanges) {
    for (const change of edit.documentChanges) {
      if ("textDocument" in change && change.textDocument.uri === uri) {
        edits = (edits ?? []).concat(change.edits);
      }
    }
  }
  if (edits?.length) applyTextEdits(view, edits);
}

function lspHover(client: LspClient, path: string) {
  return hoverTooltip(async (view, pos) => {
    client.didChange(path, view.state.doc.toString());
    const { doc } = view.state;
    const hover = await client.hover(path, offsetToPos(doc, pos));
    const value = hover && renderMarkup(hover.contents);
    if (!value) return null;

    const { from, to } = hover.range
      ? rangeToOffsets(doc, hover.range)
      : { from: pos, to: pos };

    return {
      pos: from,
      end: to,
      above: true,
      create() {
        const dom = document.createElement("div");
        dom.className = "cm-lsp-hover shiki";
        dom.innerHTML = value;
        return { dom };
      },
    };
  });
}

function lspCompletions(client: LspClient, path: string) {
  return async (ctx: CompletionContext): Promise<CompletionResult | null> => {
    client.didChange(path, ctx.state.doc.toString());
    const { doc } = ctx.state;
    const result = await client.complete(path, offsetToPos(doc, ctx.pos), {
      triggerKind: ctx.explicit ? 1 : 2,
    });
    if (!result) return null;

    const items = Array.isArray(result) ? result : result.items;
    if (!items?.length) return null;

    const word = ctx.matchBefore(/[\w$@:./-]*/);
    // Prefer an explicit edit range from the first item so replacement tokens
    // (eg completing over an existing attribute) line up.
    const editStart = items.length ? textEditRange(items[0])?.start : undefined;
    let from: number;
    if (editStart) {
      from = posToOffset(doc, editStart);
    } else if (word) {
      // Anchor filtering at the current token, not across separators: after
      // `greeting.` the members (`toUpperCase`, ...) filter on the empty string
      // past the dot, not the whole `greeting.` prefix (which matches nothing
      // and would hide every result).
      const sep = Math.max(
        word.text.lastIndexOf("."),
        word.text.lastIndexOf("/"),
      );
      from = word.from + (sep < 0 ? 0 : sep + 1);
    } else {
      from = ctx.pos;
    }

    return {
      from,
      options: items.map((item) => toCompletion(client, item)),
      validFor: /[\w$@:./-]*/,
    };
  };
}

function toCompletion(client: LspClient, item: CompletionItem): Completion {
  return {
    label: item.label,
    detail: item.detail || item.labelDetails?.detail,
    type: KIND[item.kind ?? 0],
    boost: item.preselect ? 1 : 0,
    apply(view, _completion, from, to) {
      // `from`/`to` come from CodeMirror and track the live edit: `from` is the
      // completion anchor, `to` is the current cursor. The server's edit range
      // is from request time and goes stale as the user keeps typing (the list
      // is filtered locally via `validFor`, not re-requested), so drive the
      // replacement end off `to`, extending to the server's end only when it
      // reaches further (eg replacing an existing token to the right).
      const range = textEditRange(item);
      const end = range
        ? Math.max(to, posToOffset(view.state.doc, range.end))
        : to;
      let insert = textEditText(item) ?? item.insertText ?? item.label;
      if (item.insertTextFormat === 2) insert = stripSnippet(insert);
      view.dispatch({
        changes: { from, to: end, insert },
        selection: { anchor: from + insert.length },
      });
      // Auto-import completions carry the `import ...` line as
      // additionalTextEdits, filled in lazily by the resolve request. Apply them
      // after the insert (in a separate transaction so the common, edit-free
      // case stays synchronous) so accepting the completion adds the import too.
      if (item.additionalTextEdits) {
        applyTextEdits(view, item.additionalTextEdits);
      } else if (item.detail != null && item.data != null) {
        void client
          .resolveCompletion(item)
          .then((resolved) => {
            if (resolved?.additionalTextEdits) {
              applyTextEdits(view, resolved.additionalTextEdits);
            }
          })
          .catch(() => {});
      }
    },
    info() {
      return renderInfo(client, item);
    },
  };
}

async function renderInfo(client: LspClient, item: CompletionItem) {
  let doc = item.documentation;
  let detail = item.detail;
  if (!doc || !detail) {
    // Docs and signatures are filled in lazily by the resolve request.
    const resolved = await client
      .resolveCompletion(item)
      .catch(() => undefined);
    doc = resolved?.documentation ?? doc;
    detail = resolved?.detail ?? detail;
  }

  const parts: string[] = [];
  if (detail) parts.push("```typescript\n" + detail + "\n```");
  if (doc) parts.push(typeof doc === "string" ? doc : doc.value);
  if (!parts.length) return null;

  const dom = document.createElement("div");
  dom.className = "cm-lsp-info shiki";
  dom.innerHTML = markedToHtml(parts.join("\n\n"));
  return dom;
}

function renderMarkup(
  contents: MarkupContent | MarkedString | MarkedString[],
): string | undefined {
  const md = markupToMarkdown(contents).trim();
  return md ? markedToHtml(md) : undefined;
}

function markupToMarkdown(
  contents: MarkupContent | MarkedString | MarkedString[],
): string {
  if (typeof contents === "string") return contents;
  if (Array.isArray(contents))
    return contents.map(markupToMarkdown).join("\n\n");
  if ("kind" in contents) return contents.value;
  return "```" + contents.language + "\n" + contents.value + "\n```";
}

function markedToHtml(md: string): string {
  return marked.parse(md, { async: false }) as string;
}

const SEVERITY: Record<number, CmDiagnostic["severity"]> = {
  1: "error",
  2: "warning",
  3: "info",
  4: "hint",
};

// LSP CompletionItemKind -> CodeMirror completion type (drives the icon).
const KIND: Record<number, string> = {
  1: "text",
  2: "method",
  3: "function",
  4: "function",
  5: "property",
  6: "variable",
  7: "class",
  8: "interface",
  9: "namespace",
  10: "property",
  11: "type",
  12: "enum",
  13: "enum",
  14: "keyword",
  15: "text",
  16: "constant",
  17: "text",
  18: "text",
  19: "namespace",
  20: "enum",
  21: "constant",
  22: "class",
  23: "variable",
  24: "keyword",
  25: "type",
};

function textEditRange(item: CompletionItem): Range | undefined {
  const edit = item.textEdit;
  if (!edit) return undefined;
  return "range" in edit ? edit.range : edit.replace;
}

function textEditText(item: CompletionItem): string | undefined {
  return item.textEdit?.newText;
}

function stripSnippet(text: string): string {
  return text
    .replace(/\$\{\d+:([^}]*)\}/g, "$1")
    .replace(/\$\{\d+\}/g, "")
    .replace(/\$\d+/g, "");
}

function applyTextEdits(view: EditorView, edits: TextEdit[]) {
  if (!edits.length) return;
  const { doc } = view.state;
  view.dispatch({
    changes: edits.map((edit) => {
      const { from, to } = rangeToOffsets(doc, edit.range);
      return { from, to, insert: edit.newText };
    }),
  });
}

function posToOffset(doc: Text, pos: Position): number {
  if (pos.line >= doc.lines) return doc.length;
  const line = doc.line(pos.line + 1);
  return Math.min(line.from + pos.character, line.to);
}

function offsetToPos(doc: Text, offset: number): Position {
  const line = doc.lineAt(offset);
  return { line: line.number - 1, character: offset - line.from };
}

function rangeToOffsets(doc: Text, range: Range) {
  return {
    from: posToOffset(doc, range.start),
    to: posToOffset(doc, range.end),
  };
}
