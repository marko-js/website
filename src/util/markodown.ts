import fs from "fs/promises";
import path from "path";
import {
  Marked,
  type MarkedExtension,
  type Tokens,
  type TokensList,
} from "marked";
import GithubSlugger from "github-slugger";
import { type PluginOption } from "vite";
import * as prettier from "prettier";
import * as markoPrettier from "prettier-plugin-marko";
import * as compiler from "@marko/compiler";
import { glob } from "glob";
import type { HeadingList } from "../types";

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

      await Promise.all(
        mdFiles.map(async (file) => {
          const content = await fs.readFile(path.join(docsPath, file), "utf-8");
          await fs.mkdir(path.dirname(path.join(docsPages, file)), {
            recursive: true,
          });
          const { markoCode, headings } = await mdToMarko(content);
          await Promise.all([
            fs.writeFile(
              path.join(docsPages, file.replace(".md", "+page.marko")),
              markoCode,
            ),
            fs.writeFile(
              path.join(docsPages, file.replace(".md", "+meta.json")),
              JSON.stringify({
                pageTitle: headings[0].title,
                headings: headings[0].children,
              }),
            ),
          ]);
        }),
      );
    },
  };
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

  return { headings, markoCode };
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
          /^\/\* ([\w\./-]+\.\w+) \*\/\n/,
        );

        if (match) {
          token.text = (token.text as string).slice(match[0].length);
          token.filename = match[1];
        }

        // skip sections surrounded by `<!-- ignore --> <!-- /ignore -->`
        let ignoreStart;
        while (
          (ignoreStart = (token.text as string).indexOf("<!-- ignore -->")) >= 0
        ) {
          token.text =
            (token.text as string).slice(0, ignoreStart) +
            (token.text as string).slice(
              (token.text as string).indexOf("<!-- /ignore -->") +
                "<!-- /ignore -->".length,
            );
        }
      }
      if (token.type === "code" && token.lang === "marko") {
        const releaseLock = await acquireMutexLock();

        markoPrettier.setCompiler(compiler, {
          stripTypes: true,
        });
        token.html = (
          await prettier.format(token.text, {
            parser: "marko",
            plugins: [markoPrettier],
            markoSyntax: "html",
          })
        ).trim();
        token.concise = (
          await prettier.format(token.text, {
            parser: "marko",
            plugins: [markoPrettier],
            markoSyntax: "concise",
          })
        ).trim();

        markoPrettier.setCompiler(compiler, {});
        token.htmlTS = (
          await prettier.format(token.text, {
            parser: "marko",
            plugins: [markoPrettier],
            markoSyntax: "html",
          })
        ).trim();
        token.conciseTS = (
          await prettier.format(token.text, {
            parser: "marko",
            plugins: [markoPrettier],
            markoSyntax: "concise",
          })
        ).trim();

        releaseLock();
      } else if (token.type === "codespan") {
        // token.text = (token.text as string).replaceAll("${", "${");
      } else if (token.type === "link") {
        token.href = token.href.replace(/\.md(#.*)?$/, "$1");
      }
    },
    renderer: {
      code({ lang, text, html, concise, htmlTS, conciseTS, filename }) {
        let out = `<app-code-block lang="${lang}"`;
        if (filename) {
          out += ` filename="${filename}"`;
        }
        if (lang === "marko") {
          out += ` text=${JSON.stringify(html)} markoAlts=[${JSON.stringify(concise)},${JSON.stringify(htmlTS)},${JSON.stringify(conciseTS)}]`;
        } else {
          out += ` text=${JSON.stringify(text)}`;
        }
        return out + "/>";
      },
      codespan(token) {
        return `<code>${token.text
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
