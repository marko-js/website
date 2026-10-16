import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

import type { File } from "./build.ts";
import { compactExtensions } from "./codemirror.ts";
import { languageFor } from "./highlight.ts";
import type { Workspace } from "./workspace.ts";

export interface AttachOptions {
  /** Compile as soon as this loads rather than on the first edit. */
  build?: boolean;
  csr?: boolean;
  signal: AbortSignal;
}

// The compiler, bundler and formatter are by far the heaviest part of a
// preview, so they load on demand: warmed when an editor takes focus, and
// required once the first edit needs a rebuild.
type Workspaces = typeof import("./workspace.ts");
let workspaces: Promise<Workspaces> | undefined;
const loadWorkspace = () => (workspaces ??= import("./workspace.ts"));

/**
 * Upgrades server-rendered `<live-preview>` markup in place: each source pane
 * (already editable as plain contenteditable text) becomes a CodeMirror editor
 * holding the same text, caret, scroll position and focus, and edits rebuild
 * the preview.
 */
export function attach(
  root: HTMLElement,
  files: File[],
  { build = false, csr = false, signal }: AttachOptions,
) {
  const frame = root.querySelector<HTMLIFrameElement>("iframe")!;
  const errors = root.querySelector<HTMLElement>(".errors");
  const current = files.map((file) => ({ ...file }));
  const views: EditorView[] = [];
  let timer: ReturnType<typeof setTimeout> | undefined;
  let run: AbortController | undefined;
  let workspace: ReturnType<Workspaces["createWorkspace"]> | undefined;

  const panes = root.querySelectorAll<HTMLElement>(".source");
  panes.forEach((pane, i) => {
    const typed = pane.textContent ?? "";
    views.push(
      swap(pane, current[i], (content) => {
        current[i].content = content;
        schedule();
      }),
    );
    // Typed in before this loaded.
    if (typed !== files[i].content) {
      current[i].content = typed;
      schedule();
    }
  });

  root.addEventListener("focusin", () => void loadWorkspace(), { signal });
  if (root.contains(document.activeElement)) void loadWorkspace();
  if (build) schedule(0);

  signal.addEventListener("abort", () => {
    clearTimeout(timer);
    run?.abort();
    for (const view of views) view.destroy();
  });

  function schedule(delay = 300) {
    clearTimeout(timer);
    timer = setTimeout(rebuild, delay);
  }

  async function rebuild() {
    workspace ??= (await loadWorkspace()).createWorkspace();
    if (signal.aborted) return;
    run?.abort();
    const controller = (run = new AbortController());
    workspace.subscribe(showErrors, controller.signal);
    // Not minified: a rebuild on every pause in typing should be quick.
    await workspace.update(
      controller.signal,
      frame,
      current.map((file) => ({ ...file })),
      false,
      csr,
    );
  }

  function showErrors(ws: Workspace) {
    if (!errors) return;
    const list = ws.buildErrors ?? ws.runtimeErrors;
    errors.hidden = !list;
    errors.textContent = list ? String(list[0].message) : "";
  }
}

function swap(
  pane: HTMLElement,
  file: File,
  onChange: (content: string) => void,
) {
  const text = pane.textContent ?? "";
  const { scrollTop, scrollLeft } = pane;
  const focused = document.activeElement === pane;
  const selection = getSelection();
  let anchor = 0;
  let head = 0;
  if (selection?.anchorNode && pane.contains(selection.anchorNode)) {
    anchor = offsetIn(pane, selection.anchorNode, selection.anchorOffset);
    head = offsetIn(
      pane,
      selection.focusNode ?? selection.anchorNode,
      selection.focusOffset,
    );
  }

  // Everything below runs in one task, so the browser never paints a frame
  // between the static text and the editor that replaces it.
  pane.removeAttribute("contenteditable");
  pane.removeAttribute("role");
  pane.replaceChildren();
  const view = new EditorView({
    parent: pane,
    state: EditorState.create({
      doc: text,
      selection: {
        anchor: Math.min(anchor, text.length),
        head: Math.min(head, text.length),
      },
      extensions: [
        ...compactExtensions(languageFor(file.path)),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) onChange(update.state.doc.toString());
        }),
      ],
    }),
  });
  pane.scrollTop = scrollTop;
  pane.scrollLeft = scrollLeft;
  if (focused) view.focus();
  return view;
}

function offsetIn(root: Node, node: Node, offset: number) {
  const range = document.createRange();
  range.selectNodeContents(root);
  range.setEnd(node, offset);
  return range.toString().length;
}
