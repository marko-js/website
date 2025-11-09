import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";

import css from "@shikijs/langs/css";
import html from "@shikijs/langs/html";
import js from "@shikijs/langs/javascript";
import json from "@shikijs/langs/json";
import marko from "@shikijs/langs/marko";
import sh from "@shikijs/langs/shellscript";
import ts from "@shikijs/langs/typescript";
import { dark, light } from "./shiki-theme";

export default await createHighlighterCore({
  engine: createOnigurumaEngine(import("shiki/wasm")),
  themes: [dark, light],
  langs: [css, html, js, json, marko, sh, ts],
});
