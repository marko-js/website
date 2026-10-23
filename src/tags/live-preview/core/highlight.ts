import type { ShikiTransformer } from "shiki";

import highlighter from "./shiki.ts";

const languages: Record<string, string> = {
  marko: "marko",
  css: "css",
  html: "html",
  xml: "xml",
  js: "js",
  mjs: "js",
  cjs: "js",
  ts: "ts",
  mts: "ts",
  cts: "ts",
  json: "json",
  toml: "toml",
  sh: "sh",
};

export function languageFor(path: string) {
  return languages[/\.([^./]+)$/.exec(path)?.[1] ?? ""];
}

/**
 * Highlights source to HTML whose token colors are classes rather than inline
 * styles. Class names come from a hash of the style, so the same token color
 * is the same class in every example on a page and the rules can be emitted
 * with each example without conflicting.
 */
export function highlight(path: string, content: string) {
  const lang = languageFor(path);
  const rules = new Map<string, string>();
  const getClass = (style: unknown) => {
    const str = styleToStr(style);
    if (!str) return;
    let name = rules.get(str);
    if (!name) {
      name = `lp-${hash(str)}`;
      rules.set(str, name);
    }
    return name;
  };
  const transformer: ShikiTransformer = {
    pre(node) {
      const className = getClass(node.properties.style);
      if (className) {
        node.properties.style = undefined;
        this.addClassToHast(node, className);
      }
    },
    tokens(lines) {
      for (const line of lines) {
        for (const token of line) {
          const className = getClass(token.htmlStyle);
          if (className) {
            token.htmlStyle = undefined;
            token.htmlAttrs ||= {};
            token.htmlAttrs.class = token.htmlAttrs.class
              ? `${token.htmlAttrs.class} ${className}`
              : className;
          }
        }
      }
    },
  };
  const html = lang
    ? highlighter.codeToHtml(content, {
        lang,
        defaultColor: false,
        themes: { light: "marko-light", dark: "marko-dark" },
        transformers: [transformer],
      })
    : `<pre><code>${escapeHTML(content)}</code></pre>`;
  let css = "";
  for (const [style, name] of rules) css += `.${name}{${style}}`;
  return { html, css };
}

function styleToStr(value: unknown): string {
  if (!value) return "";
  if (typeof value !== "object") return `${value}`;
  if (Array.isArray(value))
    return value.map(styleToStr).filter(Boolean).join(";");
  return Object.entries(value)
    .map(([key, v]) => (v ? `${key}:${styleToStr(v)}` : ""))
    .filter(Boolean)
    .join(";");
}

// FNV-1a, enough to keep distinct styles apart.
function hash(str: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

function escapeHTML(text: string) {
  return text.replace(/[&<>]/g, (c) => `&#${c.charCodeAt(0)};`);
}
