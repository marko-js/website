import {
  type ViewUpdate,
  EditorView,
  Decoration,
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  ViewPlugin,
  lineNumbers,
} from "@codemirror/view";
import {
  Compartment,
  EditorState,
  RangeSetBuilder,
  type RangeSet,
} from "@codemirror/state";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import {
  acceptCompletion,
  autocompletion,
  closeBrackets,
  completeAnyWord,
  completionKeymap,
} from "@codemirror/autocomplete";
import { foldGutter, foldService } from "@codemirror/language";
import highlighter from "app/util/shiki";
import { styleToClass } from "./style-to-class";

const langConfig = new Compartment();
export function update(view: EditorView, content: string, lang: string) {
  const curLang = (langConfig.get(view.state) as any)?.lang as
    | string
    | undefined;
  const effects =
    curLang === lang ? undefined : langConfig.reconfigure(shiki(lang));

  const curContent = view.state.doc.toString();
  const changes =
    curContent === content
      ? undefined
      : {
          from: 0,
          to: curContent.length,
          insert: content,
        };

  if (effects || changes) {
    view.dispatch({ effects, changes });
  }
}

const baseLanguageData = [
  {
    commentTokens: { line: "//", block: { open: "/*", close: "*/" } },
    closeBrackets: { brackets: ["(", "[", "{", '"', "'", "`"] },
  },
];

export default [
  history(),
  drawSelection(),
  highlightActiveLine(),
  highlightSelectionMatches(),
  highlightActiveLineGutter(),
  autocompletion({ override: [completeAnyWord] }),
  EditorState.allowMultipleSelections.of(true),
  EditorState.languageData.of(() => baseLanguageData),
  langConfig.of(shiki()),
  closeBrackets(),
  lineNumbers(),
  foldGutter({
    markerDOM(open) {
      const span = document.createElement("span");
      span.className = "cm-foldMarker" + (open ? " cm-foldMarkerOpen" : "");
      span.textContent = "›";
      return span;
    },
  }),
  foldOnIndent(),
  keymap.of([
    { key: "Tab", run: acceptCompletion },
    indentWithTab,
    ...defaultKeymap,
    ...historyKeymap,
    ...searchKeymap,
    ...completionKeymap,
  ]),
];

function foldOnIndent() {
  return foldService.of(({ doc }, pos) => {
    const start = doc.lineAt(pos);
    const startIndent = getIndentation(start.text);
    let end = start.number;
    let indented = false;

    for (let i = start.number + 1; i <= doc.lines; i++) {
      const text = doc.line(i).text;
      if (/^\s*$/.test(text)) {
        end = i;
      } else if (getIndentation(text) > startIndent) {
        end = i;
        indented = true;
      } else {
        break;
      }
    }

    if (indented) {
      return { from: start.to, to: doc.line(end).to };
    }

    return null;
  });
}

function getIndentation(line: string): number {
  const match = line.match(/^\s*/);
  return match ? match[0].length : 0;
}

function shiki(lang?: string) {
  const plugin = ViewPlugin.fromClass(
    class {
      declare decorations: RangeSet<Decoration>;
      static lang = lang;

      constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view);
      }

      update(update: ViewUpdate) {
        if (update.docChanged) {
          this.decorations = this.buildDecorations(update.view);
        }
      }

      buildDecorations(view: EditorView) {
        const builder = new RangeSetBuilder<Decoration>();
        if (!lang) return builder.finish();
        const { tokens } = highlighter.codeToTokens(view.state.doc.toString(), {
          lang: lang,
          defaultColor: false,
          themes: {
            light: "marko-light",
            dark: "marko-dark",
          },
        });

        for (const line of tokens) {
          for (const token of line) {
            const className = styleToClass(token.htmlStyle);
            if (className) {
              builder.add(
                token.offset,
                token.offset + token.content.length,
                Decoration.mark({ class: className }),
              );
            }
          }
        }

        return builder.finish();
      }
    },
    {
      decorations: (v) => v.decorations,
    },
  );

  (plugin as any).lang = lang;
  return plugin;
}
