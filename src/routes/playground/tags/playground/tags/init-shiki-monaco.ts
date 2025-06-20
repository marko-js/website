import { shikiToMonaco } from "@shikijs/monaco";
import * as monaco from "monaco-editor-core";
import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";

import markoLang from "@shikijs/langs/marko";
import javascriptLang from "@shikijs/langs/javascript";
import typescriptLang from "@shikijs/langs/typescript";
import htmlLang from "@shikijs/langs/html";
import cssLang from "@shikijs/langs/css";
import jsonLang from "@shikijs/langs/json";

import { markoDark, markoLight } from "app/util/syntax-highlight-theme";

import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
(globalThis as any).MonacoEnvironment = {
  async getWorker() {
    return new EditorWorker();
  }
};

const langs = [
  ...new Set(
    [
      markoLang,
      javascriptLang,
      typescriptLang,
      htmlLang,
      cssLang,
      jsonLang,
    ].flat(),
  ),
];

export const highlighter = await createHighlighterCore({
  langs,
  themes: [markoDark, markoLight],
  engine: createOnigurumaEngine(import("shiki/wasm")),
});
for (const lang of langs) {
  monaco.languages.register({ id: lang.name });
}

shikiToMonaco(highlighter, monaco);
