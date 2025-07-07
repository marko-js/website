import type { Plugin } from "@rollup/browser";
import { ConcatSourceMap } from "./concat-sourcemaps";
export interface CSSPluginOptions {
  browser: boolean;
}
export function cssPlugin({ browser }: CSSPluginOptions): Plugin {
  if (browser) {
    return {
      name: "css",
      transform(code, id) {
        if (id.endsWith(".css")) {
          return {
            code: "",
            meta: {
              css: {
                code,
                map: this.getCombinedSourcemap(),
              },
            },
          };
        }
      },
      renderChunk(_code, chunk) {
        if (!chunk.isEntry || !chunk.facadeModuleId) return;
        const entryMod = this.getModuleInfo(chunk.facadeModuleId);
        const fileName = chunk.fileName.replace(/\.[^.]+$/, "") + ".css";
        const cssBundle = new ConcatSourceMap(fileName);
        const seen = new Set<string>();
        (function crawl(ctx, mod) {
          if (mod && !seen.has(mod.id)) {
            seen.add(mod.id);

            if ("css" in mod.meta) {
              const { css } = mod.meta;
              if (typeof css === "object" && "code" in css) {
                cssBundle.add(mod.id, css.code, css.map);
              }
            }

            for (const id of mod.importedIds) {
              crawl(ctx, ctx.getModuleInfo(id));
            }
          }
        })(this, entryMod);

        const { content, sourceMap } = cssBundle;
        if (content) {
          this.emitFile({
            type: "asset",
            fileName,
            source: content,
          });

          this.emitFile({
            type: "asset",
            fileName: fileName + ".map",
            source: sourceMap.toString(),
          });
        }
      },
    };
  }

  return {
    name: "css",
    transform(_source, id) {
      if (id.endsWith(".css")) {
        return "";
      }
    },
  };
}
