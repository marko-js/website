import { Annotation, EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

import type { File, Variants } from "./build.ts";
import { compactExtensions } from "./codemirror.ts";
import { languageFor } from "./highlight.ts";
import type { Workspace } from "./workspace.ts";

export interface AttachOptions {
  /** Per file, the forms its source can be shown in, for files that have them. */
  variants?: (Variants | null)[];
  /** Compile as soon as this loads rather than on the first edit. */
  build?: boolean;
  csr?: boolean;
  signal: AbortSignal;
}

/**
 * Dispatched on `document` by a host page when the reader changes how code is
 * shown. Examples that have several forms of a file switch to the matching one.
 */
export const syntaxEvent = "live-preview:syntax";
export interface SyntaxDetail {
  concise: boolean;
  ts: boolean;
}

// The compiler, bundler and formatter are by far the heaviest part of a
// preview, so they load on demand: warmed when an editor takes focus, and
// required once the first edit needs a rebuild.
type Workspaces = typeof import("./workspace.ts");
let workspaces: Promise<Workspaces> | undefined;
const loadWorkspace = () => (workspaces ??= import("./workspace.ts"));

// Marks edits made by this module so they do not trigger a rebuild.
const programmatic = Annotation.define<boolean>();

const formKey = ({ concise, ts }: SyntaxDetail): keyof Variants =>
  concise ? (ts ? "conciseTS" : "concise") : ts ? "htmlTS" : "html";
const formClass: Record<keyof Variants, string> = {
  html: "html",
  concise: "concise",
  htmlTS: "html-ts",
  conciseTS: "concise-ts",
};

/**
 * Upgrades server-rendered `<live-preview>` markup in place: each source pane
 * (already editable as plain contenteditable text) becomes a CodeMirror editor
 * holding the same text, caret, scroll position and focus, and edits rebuild
 * the preview.
 */
export function attach(
  root: HTMLElement,
  files: File[],
  { variants = [], build = false, csr = false, signal }: AttachOptions,
) {
  const frame = root.querySelector<HTMLIFrameElement>("iframe")!;
  const errors = root.querySelector<HTMLElement>(".errors");
  const current = files.map((file) => ({ ...file }));
  const views: EditorView[] = [];
  // The form each file is showing, and the first-render text of every form.
  const shown: (keyof Variants | undefined)[] = [];
  let timer: ReturnType<typeof setTimeout> | undefined;
  let run: AbortController | undefined;
  let workspace: ReturnType<Workspaces["createWorkspace"]> | undefined;

  root.querySelectorAll<HTMLElement>(".source").forEach((source, i) => {
    const forms = variants[i];
    const panes = [...source.querySelectorAll<HTMLElement>(".variant")];
    // The pane a reader sees is the one that gets the editor; the rest go.
    const pane =
      panes.find((p) => getComputedStyle(p).display !== "none") ?? panes[0];
    const key = forms
      ? (Object.keys(formClass) as (keyof Variants)[]).find((k) =>
          pane.classList.contains(formClass[k]),
        )
      : undefined;
    shown[i] = key;
    for (const other of panes) if (other !== pane) other.remove();
    // One editor now holds whichever form is shown, so the host's rules for
    // picking a pane no longer apply.
    source.classList.remove("has-variants");
    pane.className = "variant";

    const typed = pane.textContent ?? "";
    const original = (key && forms?.[key]) ?? files[i].content;
    views.push(
      swap(pane, current[i], (content, user) => {
        current[i].content = content;
        if (user) schedule();
      }),
    );
    // Typed in before this loaded.
    if (typed !== original) {
      current[i].content = typed;
      schedule();
    }
  });

  document.addEventListener(
    syntaxEvent,
    (event) => void showSyntax((event as CustomEvent<SyntaxDetail>).detail),
    { signal },
  );

  root.addEventListener("focusin", () => void loadWorkspace(), { signal });
  if (root.contains(document.activeElement)) void loadWorkspace();
  if (build) schedule(0);

  signal.addEventListener("abort", () => {
    clearTimeout(timer);
    run?.abort();
    for (const view of views) view.destroy();
  });

  // An unedited file takes the matching form it was rendered with. An edited
  // one is converted, which can fail while the code is mid-edit; it then stays
  // as it is.
  async function showSyntax(syntax: SyntaxDetail) {
    const key = formKey(syntax);
    await Promise.all(
      views.map(async (view, i) => {
        const forms = variants[i];
        if (!forms || shown[i] === key) return;
        const text = view.state.doc.toString();
        let next: string;
        if (text === forms[shown[i]!]) {
          next = forms[key];
        } else {
          try {
            const { convertMarko } = await import("./convert.ts");
            next = await convertMarko(text, files[i].path, syntax);
          } catch {
            return;
          }
          // Edited again while converting.
          if (view.state.doc.toString() !== text) return;
        }
        shown[i] = key;
        view.dispatch({
          changes: { from: 0, to: text.length, insert: next },
          annotations: programmatic.of(true),
        });
      }),
    );
  }

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
  onChange: (content: string, user: boolean) => void,
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
          if (update.docChanged) {
            const own = update.transactions.some((tr) =>
              tr.annotation(programmatic),
            );
            onChange(update.state.doc.toString(), !own);
          }
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
