import { shikiToMonaco } from "@shikijs/monaco";
import * as monaco from "monaco-editor-core";
import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";

import darkTheme from "@shikijs/themes/vitesse-dark";

import markoLang from "@shikijs/langs/marko";
import javascriptLang from "@shikijs/langs/javascript";
import typescriptLang from "@shikijs/langs/typescript";
import htmlLang from "@shikijs/langs/html";
import cssLang from "@shikijs/langs/css";
const langs = [
  markoLang,
  javascriptLang,
  typescriptLang,
  htmlLang,
  cssLang,
].flat();

const highlighter = await createHighlighterCore({
  langs,
  themes: [darkTheme],
  engine: createOnigurumaEngine(import("shiki/wasm")),
});
for (const lang of langs) {
  monaco.languages.register({ id: lang.name });
}
shikiToMonaco(highlighter, monaco);
