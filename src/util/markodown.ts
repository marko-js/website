import fs from "fs/promises";
import path from "path";
import {
  Marked,
  type MarkedExtension,
  Renderer,
  type Tokens,
  type TokensList,
} from "marked";
import GithubSlugger from "github-slugger";
import { type PluginOption } from "vite";
import { format } from "prettier/standalone";
import * as prettierMarko from "prettier-plugin-marko";
import * as compiler from "@marko/compiler";
import { glob } from "glob";
import type { HeadingList } from "../types";
import { buildSearchIndex } from "./search-index-builder";
import {
  defaultBannerSources,
  docsBannerSources,
  renderDefaultBanner,
  renderDocsBanner,
} from "./og-banner";

export default function markodownPlugin(): PluginOption {
  return {
    name: "markodown",
    enforce: "pre",
    async buildStart() {
      const docsPath = path.join(process.cwd(), "docs");
      const docsPages = path.join(
        process.cwd(),
        "src",
        "routes",
        "docs",
        "_compiled-docs",
      );

      await fs.rm(docsPages, { recursive: true, force: true });
      await fs.mkdir(docsPages, { recursive: true });

      const mdFiles = glob.sync("**/*.md", {
        cwd: docsPath,
      });

      await Promise.all([
        ...mdFiles.map(async (file) => {
          const content = await fs.readFile(path.join(docsPath, file), "utf-8");
          await fs.mkdir(path.dirname(path.join(docsPages, file)), {
            recursive: true,
          });
          const { markoCode, headings, description } = await mdToMarko(content);
          const ogFile = file.split(path.sep).join("/").replace(".md", ".png");
          await Promise.all([
            fs.writeFile(
              path.join(docsPages, file.replace(".md", "+page.marko")),
              markoCode,
            ),
            fs.writeFile(
              path.join(docsPages, file.replace(".md", "+meta.json")),
              JSON.stringify({
                pageTitle: headings[0].title,
                description,
                headings: headings[0].children,
                ogImage: `/og/docs/${ogFile}`,
              }),
            ),
            buildDocsBanner(docsPath, file, ogFile, headings[0].title),
          ]);
        }),
        buildDefaultBanner("default"),
        buildDefaultBanner("playground", "Playground"),
        pruneDocsBanners(mdFiles),
        buildSearchIndex(docsPath),
      ]);
    },
  };
}

const ogDocsDir = () => path.join(process.cwd(), "public", "og", "docs");

async function isStale(target: string, ...sources: string[]) {
  try {
    const targetStat = await fs.stat(target);
    const sourceStats = await Promise.all(
      sources.map((source) => fs.stat(source)),
    );
    return sourceStats.some((stat) => stat.mtimeMs > targetStat.mtimeMs);
  } catch {
    return true;
  }
}

const bannerModule = () =>
  path.join(process.cwd(), "src", "util", "og-banner.ts");

async function buildDocsBanner(
  docsPath: string,
  mdFile: string,
  ogFile: string,
  title: string,
) {
  const target = path.join(ogDocsDir(), ogFile);
  const section = ogFile.includes("/")
    ? ogFile.slice(0, ogFile.indexOf("/"))
    : ogFile.replace(".png", "");
  if (
    await isStale(
      target,
      path.join(docsPath, mdFile),
      bannerModule(),
      ...docsBannerSources(section),
    )
  ) {
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, await renderDocsBanner(title, section));
  }
}

async function buildDefaultBanner(name: string, suffix?: string) {
  // this module is a source too since it provides the suffix
  const self = path.join(process.cwd(), "src", "util", "markodown.ts");
  const target = path.join(process.cwd(), "public", "og", `${name}.png`);
  if (await isStale(target, bannerModule(), self, ...defaultBannerSources())) {
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, await renderDefaultBanner(suffix));
  }
}

async function pruneDocsBanners(mdFiles: string[]) {
  const expected = new Set(
    mdFiles.map((file) =>
      file.split(path.sep).join("/").replace(".md", ".png"),
    ),
  );
  await Promise.all(
    glob
      .sync("**/*.png", { cwd: ogDocsDir(), posix: true })
      .filter((png) => !expected.has(png))
      .map((png) => fs.rm(path.join(ogDocsDir(), png))),
  );
}

async function mdToMarko(source: string) {
  const headings: HeadingList = [];
  const markoCode = await new Marked()
    .use(semanticAdmonitions(), headingSections(headings), markoDocs())
    .parse(
      // remove zero-width spaces (recommended from marked docs)
      source.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, ""),
      {
        gfm: true,
      },
    );

  return { headings, markoCode, description: extractDescription(source) };
}

const DESCRIPTION_MAX = 160;

/**
 * The opening prose of a doc, used as its `<meta name=description>`. Docs
 * usually lead with a `> [!TLDR]` callout, which lexes as a blockquote rather
 * than a paragraph and so is skipped in favor of the intro that follows it.
 * A doc with no prose at all (only headings) gets no description and falls
 * back to the site default.
 */
export function extractDescription(source: string) {
  const tokens = new Marked().lexer(source, { gfm: true });

  for (const token of tokens) {
    if (token.type === "paragraph") {
      // A paragraph holding only a badge or screenshot flattens to nothing,
      // so the search continues past it.
      const text = clamp(inlineText(token.tokens));
      if (text) {
        return text;
      }
    }
  }

  // A doc with no prose at all is usually one that opens straight into its
  // TLDR bullets, so those stand in for the intro.
  for (const token of tokens) {
    const text = clamp(blockText(token));
    if (text) {
      return text;
    }
  }
}

/**
 * Flattens the block content of a callout or list, dropping the `[!TLDR]`
 * marker that opens one and reading each bullet as its own clause.
 */
function blockText(token: Tokens.Generic): string {
  switch (token.type) {
    case "list":
      return (token.items as Tokens.Generic[])
        .map(blockText)
        .filter(Boolean)
        .join("; ");
    case "blockquote":
    case "list_item":
      return ((token.tokens ?? []) as Tokens.Generic[])
        .map(blockText)
        .filter(Boolean)
        .join(" ");
    case "paragraph":
    case "text":
      return inlineText(token.tokens).replace(/^\s*\[!\w+]\s*/, "");
    default:
      return "";
  }
}

/**
 * Flattens inline tokens to their text, so links read as their label and
 * `code` loses its backticks. Images contribute nothing.
 */
function inlineText(tokens: Tokens.Generic[] | undefined): string {
  let text = "";

  for (const token of tokens ?? []) {
    switch (token.type) {
      case "image":
      case "html":
        break;
      case "br":
        text += " ";
        break;
      default:
        text += token.tokens
          ? inlineText(token.tokens)
          : decodeEntities(token.text ?? "");
        break;
    }
  }

  return text;
}

const entities: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

function decodeEntities(text: string) {
  return text.replace(/&(?:amp|lt|gt|quot|#39);/g, (match) => entities[match]);
}

/**
 * Search results show roughly {@link DESCRIPTION_MAX} characters, so the
 * paragraph is cut back to whole sentences that fit. A first sentence longer
 * than the budget is cut at a word instead.
 */
function clamp(text: string) {
  const description = text.replace(/\s+/g, " ").trim();
  if (description.length <= DESCRIPTION_MAX) {
    return description;
  }

  const sentences = description.match(/[^.!?]+(?:[.!?]+|$)/g) ?? [];
  let kept = "";
  for (const sentence of sentences) {
    if (kept && kept.length + sentence.length > DESCRIPTION_MAX) break;
    kept += sentence;
  }

  kept = kept.trim();
  if (kept && kept.length <= DESCRIPTION_MAX) {
    return kept;
  }

  const cut = description.slice(0, DESCRIPTION_MAX);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:]$/, "") + "…";
}

function semanticAdmonitions(): MarkedExtension {
  const typeMap: Record<string, string> = {
    note: "Note",
    tip: "Tip",
    important: "Important",
    warning: "Warning",
    caution: "Caution",
    tldr: "TL;DR",
  };

  let nextCotId = 0;

  return {
    renderer: {
      blockquote(token) {
        const word = /^\[!(\w*)]/.exec(token.text ?? "");
        const variant = word?.[1]?.toLowerCase();
        if (variant && variant in typeMap) {
          // logic inspired from https://github.com/bent10/marked-extensions/blob/main/packages/alert/src/index.ts#L42-L58

          let body: string;
          const { length } = word![0];
          const firstParagraph = token.tokens[0] as Tokens.Paragraph;

          if (firstParagraph.raw.trim().length === length) {
            body = this.parser.parse(
              token.tokens.slice(
                firstParagraph.tokens[1]?.type === "br" ? 2 : 1,
              ),
            );
          } else {
            const firstText = firstParagraph.tokens[0] as Tokens.Text;
            firstText.raw = firstText.raw.substring(length);
            firstText.text = firstText.text.substring(length);

            if (firstParagraph.tokens[1]?.type === "br") {
              firstParagraph.tokens.splice(1, 1);
            }
            body = this.parser.parse(token.tokens);
          }
          const id = `callout-cot-${nextCotId++}`;

          return `<\${"callout"} role="note" aria-labelledby="${id}" class="admonition-${variant}"><\${"cot"} id="${id}">${typeMap[variant]}</>${body}</>`;
        }

        return false;
      },
    },
  };
}

declare module "marked" {
  namespace Tokens {
    interface Code {
      html?: string;
      concise?: string;
      htmlTS?: string;
      conciseTS?: string;
      filename?: string;
    }
  }
}

function markoDocs(): MarkedExtension {
  return {
    async: true,
    async walkTokens(token) {
      if (token.type === "code") {
        // named files begin with `/* file.name */\n`
        const match = (token.text as string).match(
          /^\/\* ([\w\./+$-]+\.\w+) \*\/\n/,
        );

        if (match) {
          token.text = (token.text as string).slice(match[0].length);
          token.filename = match[1];
        }

        if (token.lang.startsWith("marko")) {
          const modifiers = token.lang.trim().split(/\s+/).toSpliced(0, 1);
          token.lang = "marko";

          if (!modifiers.includes("no-format")) {
            const unlock = await acquireMutexLock();
            const text = (() => {
              try {
                return compiler.compileSync(
                  token.text,
                  token.filename || "temp.marko",
                  {
                    output: "source",
                    stripTypes: true,
                    sourceMaps: false,
                  },
                ).code;
              } catch {
                return token.text;
              }
            })();

            const [htmlFormat, conciseFormat, htmlTSFormat, conciseTSFormat] =
              await Promise.all([
                format(text, {
                  parser: "marko",
                  plugins: [prettierMarko],
                  markoSyntax: "html",
                }),
                format(text, {
                  parser: "marko",
                  plugins: [prettierMarko],
                  markoSyntax: "concise",
                }),
                format(token.text, {
                  parser: "marko",
                  plugins: [prettierMarko],
                  markoSyntax: "html",
                }),
                format(token.text, {
                  parser: "marko",
                  plugins: [prettierMarko],
                  markoSyntax: "concise",
                }),
              ]);
            token.html = htmlFormat.trim();
            token.concise = conciseFormat.trim();
            token.htmlTS = htmlTSFormat.trim();
            token.conciseTS = conciseTSFormat.trim();

            unlock();
          }
        }
      }
      if (token.type === "code" && token.lang === "marko") {
      } else if (token.type === "codespan") {
        // token.text = (token.text as string).replaceAll("${", "${");
      } else if (token.type === "link") {
        token.href = token.href.replace(/\.md(#.*)?$/, "$1");
      }
    },
    renderer: {
      table(token) {
        return `<div class="table-scroll">${Renderer.prototype.table.call(this, token)}</div>`;
      },
      code({ lang, text, html, concise, htmlTS, conciseTS, filename }) {
        let out = `<app-code-block lang="${lang}"`;
        if (filename) {
          out += ` filename="${filename}"`;
        }
        if (lang === "marko" && (html || concise)) {
          out += ` text=${JSON.stringify(html)} markoAlts=[${JSON.stringify(concise)}${html === htmlTS ? "" : `,${JSON.stringify(htmlTS)},${JSON.stringify(conciseTS)}`}]`;
        } else {
          out += ` text=${JSON.stringify(text)}`;
        }
        return out + "/>";
      },
      codespan(token) {
        return `<code>${token.text
          .replaceAll("$!{", "&#36;!{")
          .replaceAll("${", "&#36;{")
          .replaceAll("<", "&lt;")}</code>`;
      },
    },
  };
}

/**
 * Wrap all headings and their contents (everything until the
 * next heading of the same depth) in a `<section>` tag, instead
 * of keeping a flat structure for the whole document
 */
function headingSections(headings: HeadingList): MarkedExtension {
  let lastSectionDepth = 0;
  let closeSections = false;

  let tokens: TokensList | undefined;

  const githubSlugger = new GithubSlugger();

  return {
    tokenizer: {
      heading() {
        if (!closeSections) {
          tokens = this.lexer.tokens;
          tokens.push({ type: "close-sections", raw: "" });
          closeSections = true;
        }
        return false;
      },
    },
    walkTokens(token) {
      if (tokens && token.type === "close-sections") {
        /*
           I can't _believe_ this awkward two-step hack is the way, but it looks like it's what they do
           in [official plugins](https://github.com/bent10/marked-extensions/blob/main/packages/footnote/src/index.ts)
        */
        tokens.push({ ...token });
        token.type = "space";
        token.raw = "";
        tokens = undefined;
      }
    },
    renderer: {
      heading({ depth, text, tokens }) {
        let result = "";

        if (depth > lastSectionDepth) {
          if (depth > lastSectionDepth + 1) {
            throw new Error(
              "Document does not have proper header nesting; don't skip any levels",
            );
          }
        } else {
          result += "</section>".repeat(lastSectionDepth - depth + 1);
        }

        const slug = githubSlugger.slug(text);
        const headingHTML = this.parser.parseInline(tokens);
        lastSectionDepth = depth;

        if (depth === 1) {
          result += `<h1 id="${slug}">${headingHTML}</h1>`;
        } else {
          result += `<section id="${slug}"><h${depth}><a href="#${slug}">${headingHTML}</a></h${depth}>`;
        }

        let headingList = headings;
        for (let i = 1; i < depth; i++) {
          headingList = headingList[headingList.length - 1].children;
        }
        headingList.push({
          id: slug,
          title: text.replace(/`/g, ""),
          children: [],
        });

        return result;
      },
    },

    extensions: [
      {
        name: "close-sections",
        renderer() {
          if (lastSectionDepth > 1) {
            return "</section>".repeat(lastSectionDepth - 1);
          }
        },
      },
    ],
  };
}

let lock: Promise<void> | undefined;
async function acquireMutexLock() {
  const currLock = lock;
  let resolve!: () => void;
  lock = new Promise((_) => (resolve = _));
  await currLock;
  return resolve;
}
