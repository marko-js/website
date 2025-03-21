import fs from "fs/promises";
import path from "path";
import { Marked, type MarkedExtension, type TokensList } from "marked";
import markedAlert from "marked-alert";
import GithubSlugger from "github-slugger";
import { type PluginOption } from "vite";
import * as prettier from "prettier";
import * as markoPrettier from "prettier-plugin-marko";
import * as compiler from "@marko/compiler";
import { glob } from "glob";
import type { HeadingList } from "../types";

markoPrettier.setCompiler(compiler, {});

export default function markodownPlugin(): PluginOption {
  return {
    name: "markodown",
    enforce: "pre",
    async buildStart() {
      const docsPath = path.join(process.cwd(), "src", "routes", "docs");
      const docsPages = path.join(docsPath, "_docs-pages");
      await fs.mkdir(docsPages, { recursive: true });

      const mdFiles = glob.sync("**/*.md", {
        cwd: docsPath,
        ignore: "_docs-pages/**",
      });

      await Promise.all(
        mdFiles.map(async (file) => {
          const content = await fs.readFile(path.join(docsPath, file), "utf-8");
          await fs.mkdir(path.dirname(path.join(docsPages, file)), {
            recursive: true,
          });
          const { markoCode, headings } = await mdToMarko(content);
          await fs.writeFile(
            path.join(docsPages, file.replace(".md", "+page.marko")),
            markoCode,
          );
          await fs.writeFile(
            path.join(docsPages, file.replace(".md", "+meta.json")),
            `{ "pageTitle": "${headings[0].title}", "headings": ${JSON.stringify(headings)} }`,
          );
        }),
      );
    },
  };
}

async function mdToMarko(source: string) {
  const headings: HeadingList = [];
  const markoCode = await new Marked()
    .use(markedAlert(), headingSections(headings), markoDocs())
    .parse(
      // remove zero-width spaces (recommended from marked docs)
      source.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, ""),
      {
        gfm: true,
      },
    );

  return { headings, markoCode };
}

declare module "marked" {
  namespace Tokens {
    interface Code {
      html?: string;
      concise?: string;
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
        const match = (token.text as string).match(/^\/\* (\w+\.\w+) \*\/\n/);
        if (match) {
          token.text = (token.text as string).substring(match[0].length);
          token.filename = match[1];
        }
      }
      if (token.type === "code" && token.lang === "marko") {
        [token.html, token.concise] = await Promise.all([
          prettier.format(token.text, {
            parser: "marko",
            plugins: [markoPrettier],
            markoSyntax: "html",
          }),
          prettier.format(token.text, {
            parser: "marko",
            plugins: [markoPrettier],
            markoSyntax: "concise",
          }),
        ]);
      } else if (token.type === "codespan") {
        // token.text = (token.text as string).replaceAll("${", "${");
      } else if (token.type === "link") {
        if (/\.\/[\w-]+.md/.test(token.href)) {
          token.href = "." + token.href.replace(".md", "");
        }
      }
    },
    renderer: {
      code({ lang, text, concise, html, filename }) {
        let out = `<code-block lang="${lang}"`;
        if (filename) {
          out += ` filename="${filename}"`;
        }
        if (lang === "marko") {
          out += ` text=${JSON.stringify(html)} concise=${JSON.stringify(concise)}`;
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

        result += `<section id="${slug}"><h${depth}>${this.parser.parseInline(tokens)}<a href="#${slug}">#</a></h${depth}>`;

        lastSectionDepth = depth;

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
          return "</section>".repeat(lastSectionDepth);
        },
      },
    ],
  };
}
