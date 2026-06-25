import { formatWithCursor } from "prettier/standalone";
import prettierBabel from "prettier/plugins/babel";
import prettierEstree from "prettier/plugins/estree";
import prettierCSS from "prettier/plugins/postcss";
import * as prettierMarko from "prettier-plugin-marko";

function optionsFor(ext: string) {
  switch (ext) {
    case "marko":
      // Marko embeds js/ts/css, so include those plugins for the embedded code.
      return {
        parser: "marko",
        plugins: [prettierMarko, prettierBabel, prettierEstree, prettierCSS],
      };
    case "js":
    case "jsx":
    case "mjs":
    case "cjs":
      return { parser: "babel", plugins: [prettierBabel, prettierEstree] };
    case "ts":
    case "tsx":
      return { parser: "babel-ts", plugins: [prettierBabel, prettierEstree] };
    case "json":
      return { parser: "json", plugins: [prettierBabel, prettierEstree] };
    case "css":
      return { parser: "css", plugins: [prettierCSS] };
  }
}

export function formatCode(content: string, cursorOffset: number, ext: string) {
  const options = optionsFor(ext);
  if (!options) return;
  return formatWithCursor(content, { ...options, cursorOffset });
}
