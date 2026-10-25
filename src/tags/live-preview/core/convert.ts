import * as compiler from "@marko/compiler";
import * as translator from "marko/translator";

import { FileSystem, rootDir } from "./workspace/fs.ts";
import { setResolveFileSystem } from "./workspace/modules-shim.ts";
import "./workspace/marko-plugin.ts";

export interface Syntax {
  concise: boolean;
  ts: boolean;
}

// Compiling resolves taglibs through the shimmed file system, which only needs
// to exist; the source being converted imports nothing.
const fs = new FileSystem({ [`${rootDir}marko.json`]: "{}" });

/**
 * Rewrites Marko source into the other html/concise and TypeScript/JavaScript
 * forms. Types cannot be recovered, so asking for TypeScript only changes the
 * syntax. Throws when the source does not parse, as mid-edit code often does.
 */
export async function convertMarko(
  source: string,
  path: string,
  { concise, ts }: Syntax,
) {
  const [{ format }, babel, estree, marko] = await Promise.all([
    import("prettier/standalone"),
    import("prettier/plugins/babel"),
    import("prettier/plugins/estree"),
    import("prettier-plugin-marko"),
  ]);

  let code = source;
  if (!ts) code = stripTypes(source, path) ?? source;
  return (
    await format(code, {
      parser: "marko",
      markoSyntax: concise ? "concise" : "html",
      plugins: [marko, babel.default, estree.default],
    } as any)
  ).trim();
}

function stripTypes(source: string, path: string) {
  setResolveFileSystem(fs);
  const file = rootDir + path;
  const opts = { translator, output: "source", sourceMaps: false } as const;
  const js = compiler.compileSync(source, file, {
    ...opts,
    stripTypes: true,
  }).code;
  const withTypes = compiler.compileSync(source, file, {
    ...opts,
    stripTypes: false,
  }).code;
  return js === withTypes ? undefined : js;
}
