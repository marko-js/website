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

      const learnPath = path.join(process.cwd(), "learn");
      const learnPages = path.join(
        process.cwd(),
        "src",
        "routes",
        "learn",
        "_compiled-learn",
      );

      await fs.rm(learnPages, { recursive: true, force: true });
      await fs.mkdir(learnPages, { recursive: true });

      // Lesson order comes from the numeric filename prefixes, which are
      // stripped from the served URLs.
      const learnFiles = glob
        .sync("**/*.md", { cwd: learnPath })
        .map((file) => file.split(path.sep).join("/"))
        .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
      const learnManifest: { slug: string; title: string }[] = [];

      await Promise.all([
        ...learnFiles.map(async (file, i) => {
          const content = await fs.readFile(
            path.join(learnPath, file),
            "utf-8",
          );
          const { markoCode, headings } = await mdToMarko(content, {
            checkpoints: true,
          });
          const slug = file
            .replace(/\.md$/, "")
            .split("/")
            .map((segment) => segment.replace(/^\d+-/, ""))
            .join("/");
          learnManifest[i] = { slug, title: headings[0].title };
          const target = path.join(learnPages, ...slug.split("/"));
          await fs.mkdir(path.dirname(target), { recursive: true });
          await Promise.all([
            fs.writeFile(`${target}+page.marko`, markoCode),
            fs.writeFile(
              `${target}+meta.json`,
              JSON.stringify({
                pageTitle: headings[0].title,
                headings: headings[0].children,
                hideFooter: true,
              }),
            ),
          ]);
        }),
        ...mdFiles.map(async (file) => {
          const content = await fs.readFile(path.join(docsPath, file), "utf-8");
          await fs.mkdir(path.dirname(path.join(docsPages, file)), {
            recursive: true,
          });
          const { markoCode, headings } = await mdToMarko(content);
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

      await fs.writeFile(
        path.join(learnPages, "manifest.json"),
        JSON.stringify(learnManifest),
      );
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

async function mdToMarko(source: string, opts?: { checkpoints?: boolean }) {
  const headings: HeadingList = [];
  const markoCode = await new Marked()
    .use(
      semanticAdmonitions(),
      headingSections(headings),
      markoDocs(opts?.checkpoints),
    )
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
      playgroundFiles?: Code[];
      playgroundEnd?: boolean;
    }
  }
}

function isPlaygroundFence(token: Tokens.Code) {
  const [lang, ...modifiers] = (token.lang ?? "").trim().split(/\s+/);
  return lang === "marko" && modifiers.includes("playground");
}

function markoDocs(checkpoints?: boolean): MarkedExtension {
  let checkpointCount = 0;
  return {
    async: true,
    hooks: {
      // Consecutive ```marko playground fences (blank lines between them are
      // fine) become the files of a single interactive playground; anything
      // else, including prose, ends the group.
      processAllTokens(tokens) {
        let group: Tokens.Code[] | undefined;
        const endGroup = () => {
          if (group) {
            group[group.length - 1].playgroundEnd = true;
            group = undefined;
          }
        };

        for (const token of tokens) {
          if (token.type === "code" && isPlaygroundFence(token)) {
            if (group) {
              group.push(token);
            } else {
              group = [token];
              token.playgroundFiles = group;
            }
          } else if (token.type !== "space") {
            endGroup();
          }
        }

        endGroup();
        return tokens;
      },
    },
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
      code(token) {
        const { lang, text, html, concise, htmlTS, conciseTS, filename } =
          token;
        let out = "";

        if (token.playgroundFiles) {
          const files = token.playgroundFiles.map((file, i) => {
            const path = file.filename ?? (i === 0 ? "index.marko" : "");
            if (!path) {
              throw new Error(
                "Each fence after the first in a playground group needs a /* filename */ comment",
              );
            }
            return {
              path,
              content: file.text.endsWith("\n") ? file.text : `${file.text}\n`,
            };
          });
          if (!files.some((file) => file.path === "index.marko")) {
            throw new Error(
              "A playground group needs an index.marko entry file",
            );
          }
          if (checkpoints) {
            // In lesson pages, playground fences load into the page's shared
            // workspace instead of embedding their own; the first group is the
            // lesson's starting state.
            out += `<learn-checkpoint files=${JSON.stringify(files)}${checkpointCount++ === 0 ? " auto" : ""}>`;
          } else {
            out += `<app-playground files=${JSON.stringify(files)}>`;
          }
        }

        out += `<app-code-block lang="${lang}"`;
        if (filename) {
          out += ` filename="${filename}"`;
        }
        if (lang === "marko" && (html || concise)) {
          out += ` text=${JSON.stringify(html)} markoAlts=[${JSON.stringify(concise)}${html === htmlTS ? "" : `,${JSON.stringify(htmlTS)},${JSON.stringify(conciseTS)}`}]`;
        } else {
          out += ` text=${JSON.stringify(text)}`;
        }
        out += "/>";

        if (token.playgroundEnd) {
          out += "</>";
        }
        return out;
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
