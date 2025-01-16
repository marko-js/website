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
          await fs.writeFile(
            path.join(docsPages, file.replace(".md", "+page.marko")),
            await mdToMarko(content),
          );
          await fs.writeFile(
            path.join(docsPages, file.replace(".md", "+meta.json")),
            `{ "pageTitle": "${path.basename(file, ".md")}" }`,
          );
        }),
      );
    },
  };
}

async function mdToMarko(source: string) {
  return new Marked().use(markedAlert(), headingSections(), markoDocs()).parse(
    // remove zero-width spaces (recommended from marked docs)
    source.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, ""),
    {
      gfm: true,
    },
  );
}

declare module "marked" {
  namespace Tokens {
    interface Code {
      html?: string;
      concise?: string;
    }
  }
}

function markoDocs(): MarkedExtension {
  return {
    async: true,
    async walkTokens(token) {
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
      code({ lang, text, concise, html }) {
        if (lang === "marko") {
          return `<code-block lang="${lang}" text=${JSON.stringify(html)} concise=${JSON.stringify(concise)} />`;
        } else {
          return `<code-block lang="${lang}" text=${JSON.stringify(text)} />`;
        }
      },
      codespan(token) {
        if (/^<[\w-]+>$/.test(token.text))
          return `<code class="marko-codespan__tag">${token.text.substring(1, token.text.length - 1)}</code>`;
        if (/^[\w-]+=$/.test(token.text))
          return `<code class="marko-codespan__attribute">${token.text.substring(0, token.text.length - 1)}</code>`;
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
function headingSections(): MarkedExtension {
  let sectionDepth = 0;
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

        if (depth > sectionDepth) {
          if (depth > sectionDepth + 1) {
            throw new Error(
              "Document does not have proper header nesting; don't skip any levels",
            );
          }
        } else {
          result += "</section>".repeat(sectionDepth - depth + 1);
        }

        const slug = githubSlugger.slug(text);

        result += `<section id="${slug}"><h${depth}>${this.parser.parseInline(tokens)}<a href="#${slug}">#</a></h${depth}>`;

        sectionDepth = depth;

        return result;
      },
    },

    extensions: [
      {
        name: "close-sections",
        renderer() {
          return "</section>".repeat(sectionDepth);
        },
      },
    ],
  };
}
