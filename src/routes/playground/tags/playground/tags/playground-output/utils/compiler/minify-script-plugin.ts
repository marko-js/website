import { minify, type MinifyOptions } from "terser";
import type { Plugin } from "@rollup/browser";

export function minifyScriptPlugin(): Plugin {
  const terserOpts: MinifyOptions = {
    mangle: true,
    module: true,
    sourceMap: { asObject: true },
    compress: { drop_debugger: false },
  };
  return {
    name: "minify-script",
    async renderChunk(code) {
      const min = await minify(code, terserOpts);
      return {
        code: min.code || "",
        map: min.map as any,
      };
    },
  };
}
