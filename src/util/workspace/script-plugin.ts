import type { Plugin } from "@rollup/browser";
import {
  pluginTransformTypeScript,
  transformSync,
} from "@marko/compiler/internal/babel";

// Standalone script modules the preview must strip types from before bundling.
// `.marko` carries its own types (compiled by the Marko plugin) and plain `.js`
// needs no transform, so only bare TypeScript files match here.
const TS_FILE = /\.[cm]?ts$/;

/**
 * Transpile standalone `.ts`/`.mts`/`.cts` modules to JavaScript for the
 * in-browser preview. `@rollup/browser` parses JavaScript only, so a `.marko`
 * file importing a sibling `.ts` helper would build in the language server yet
 * fail to run in the preview without this. Reuses the Babel bundled with
 * `@marko/compiler` (already loaded to compile `.marko`) so it adds no weight.
 */
export function scriptPlugin(): Plugin {
  return {
    name: "script",
    transform(code, id) {
      const suffix = /\?.*$/.exec(id)?.[0];
      const file = suffix ? id.slice(0, -suffix.length) : id;
      if (!TS_FILE.test(file)) return;

      const result = transformSync(code, {
        filename: file,
        babelrc: false,
        configFile: false,
        sourceMaps: true,
        plugins: [[pluginTransformTypeScript, {}]],
      });

      if (result?.code == null) return;
      return { code: result.code, map: result.map };
    },
  };
}
