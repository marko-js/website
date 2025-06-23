import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRawEngine } from "shiki/engine/javascript";

import css from "@shikijs/langs-precompiled/css";
import html from "@shikijs/langs-precompiled/html";
import js from "@shikijs/langs-precompiled/javascript";
import json from "@shikijs/langs-precompiled/json";
import marko from "@shikijs/langs-precompiled/marko";
import sh from "@shikijs/langs-precompiled/shellscript";
import ts from "@shikijs/langs-precompiled/typescript";
import { dark, light } from "./shiki-theme";

export default await createHighlighterCore({
  engine: createJavaScriptRawEngine(),
  themes: [dark, light],
  langs: [css, html, js, json, marko, sh, ts],
});
