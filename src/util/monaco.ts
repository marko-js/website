import "monaco-editor/esm/vs/editor/browser/coreCommands";
import "monaco-editor/esm/vs/editor/contrib/folding/browser/folding";
import "monaco-editor/esm/vs/editor/contrib/multicursor/browser/multicursor";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

import { shikiToMonaco } from "@shikijs/monaco";
import highlighter from "./shiki";

for (const id of highlighter.getLoadedLanguages()) {
  monaco.languages.register({ id });
}

shikiToMonaco(highlighter, monaco);

export default monaco;
