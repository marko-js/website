import init, { transform } from "lightningcss-wasm";
import type { Plugin } from "@rollup/browser";
import { ConcatSourceMap } from "./concat-sourcemaps";
export interface CSSPluginOptions {
  optimize: boolean;
  browser: boolean;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();
export function cssPlugin({ browser, optimize }: CSSPluginOptions): Plugin {
  if (browser) {
    return {
      name: "css",
      async transform(code, id) {
        if (id.endsWith(".css")) {
          let jsCode = "";
          let map = this.getCombinedSourcemap();
          if (id.endsWith(".module.css")) {
            await initOnce();
            const result = transform({
              filename: id,
              sourceMap: true,
              cssModules: true,
              errorRecovery: true,
              code: encoder.encode(code),
              inputSourceMap: JSON.stringify(map),
            });
            code = decoder.decode(result.code);
            map = JSON.parse(decoder.decode(result.map!));
            if (result.exports) {
              for (const key in result.exports) {
                jsCode += `export const ${toCamelCase(key)} = ${JSON.stringify(result.exports[key].name)};\n`;
              }
            }
          }
          return {
            code: jsCode,
            meta: {
              css: {
                code,
                map,
              },
            },
          };
        }
      },
      async renderChunk(_code, chunk) {
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

        let code = cssBundle.content;
        if (code) {
          let map: string | void = cssBundle.sourceMap.toString();

          if (optimize) {
            await initOnce();
            const min = transform({
              filename: fileName,
              code: encoder.encode(code),
              errorRecovery: true,
              inputSourceMap: map,
              sourceMap: true,
              minify: true,
            });
            code = decoder.decode(min.code);
            map = decoder.decode(min.map!);
          }

          this.emitFile({
            type: "asset",
            fileName,
            source: code,
          });

          this.emitFile({
            type: "asset",
            fileName: fileName + ".map",
            source: map,
          });
        }
      },
    };
  }

  return {
    name: "css",
    async transform(code, id) {
      if (id.endsWith(".css")) {
        let jsCode = "";
        if (id.endsWith(".module.css")) {
          await initOnce();
          const result = transform({
            filename: id,
            sourceMap: true,
            cssModules: true,
            errorRecovery: true,
            code: encoder.encode(code),
          });
          if (result.exports) {
            for (const key in result.exports) {
              jsCode += `export const ${toCamelCase(key)} = ${JSON.stringify(result.exports[key].name)};\n`;
            }
          }
        }
        return { code: jsCode, map: null };
      }
    },
  };
}

let initPromise: Promise<unknown> | undefined;
function initOnce() {
  return initPromise ??= init();
}

function toCamelCase(str: string): string {
  return str.replace(/(?<=-)[a-z]/g, toUpperCase);
}

function toUpperCase(str: string) {
  return str.toUpperCase();
}
