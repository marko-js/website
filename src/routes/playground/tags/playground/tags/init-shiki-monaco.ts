import 'monaco-editor/esm/vs/editor/browser/coreCommands';
import 'monaco-editor/esm/vs/editor/contrib/folding/browser/folding';
import 'monaco-editor/esm/vs/editor/contrib/multicursor/browser/multicursor';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

import { shikiToMonaco } from "@shikijs/monaco";
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRawEngine } from "shiki/engine/javascript";

import markoLang from "@shikijs/langs-precompiled/marko";
import javascriptLang from "@shikijs/langs-precompiled/javascript";
import typescriptLang from "@shikijs/langs-precompiled/typescript";
import htmlLang from "@shikijs/langs-precompiled/html";
import cssLang from "@shikijs/langs-precompiled/css";
import jsonLang from "@shikijs/langs-precompiled/json";

import { markoDark, markoLight } from "app/util/syntax-highlight-theme";

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
  engine: createJavaScriptRawEngine(),
});
for (const lang of langs) {
  monaco.languages.register({ id: lang.name });
}

shikiToMonaco(highlighter, monaco);

export default monaco;
