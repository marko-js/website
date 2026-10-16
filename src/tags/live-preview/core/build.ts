import { rollup, type OutputAsset, type OutputChunk } from "@rollup/browser";

import { cdnPlugin } from "./workspace/cdn-plugin.ts";
import { cssPlugin } from "./workspace/css-plugin.ts";
import { FileSystem, rootDir } from "./workspace/fs.ts";
import { mainPlugin } from "./workspace/main-plugin.ts";
import { markoPlugin, type MarkoCompiled } from "./workspace/marko-plugin.ts";
import { fetchNodeModules } from "./workspace/npm.ts";
import { minifyScriptPlugin } from "./workspace/minify-script-plugin.ts";

export interface File {
  path: string;
  content: string;
}

/** The part of a workspace the bundler plugins need. No DOM, no workers. */
export interface BuildContext {
  fs: FileSystem;
  optimize: boolean;
  markoCompiled?: MarkoCompiled;
}

export interface Bundle {
  code: string | undefined;
  map: string | undefined;
  css: string | undefined;
  cssMap: string | undefined;
  modules: OutputChunk["modules"] | undefined;
}

export interface BundleOptions {
  /** Marko runtime sources as text, keyed by `marko/<file>.mjs`. */
  runtimeFiles: Record<string, string>;
  /** Pinned versions of `package.json` dependencies, from `installPackages`. */
  versions?: Record<string, string>;
}

// Files sit directly in the workspace directory, so a playground file is at
// the path the author typed rather than under scaffolding they never asked
// for. `marko.json` is what buys that: without it the compiler only discovers
// custom tags inside a directory literally named `tags` or `components`.
export const packageJsonPath = `${rootDir}package.json`;
export const markoJsonPath = `${rootDir}marko.json`;
const markoJson = JSON.stringify({ "tags-dir": "." });

export function createBuildContext(
  files: File[],
  optimize: boolean,
): BuildContext {
  const fs = new FileSystem({});
  // Written first so an author who adds their own `marko.json` tab still wins.
  fs.files[markoJsonPath] = markoJson;
  for (const file of files) {
    fs.files[
      file.path === "package.json" ? packageJsonPath : rootDir + file.path
    ] = file.content;
  }
  return { fs, optimize };
}

/** Fetches the `package.json` dependencies into the context's file system. */
export async function installPackages(ctx: BuildContext) {
  const packageJson = ctx.fs.files[packageJsonPath];
  if (!packageJson) return {};
  const nodeModules = await fetchNodeModules(packageJson);
  for (const path in nodeModules.files) {
    ctx.fs.files[rootDir.slice(0, -1) + path] = nodeModules.files[path];
  }
  return nodeModules.versions;
}

export const serverFile = "server.js";
export const clientFile = "client.js";
export const cssFile = "client.css";

export async function bundleServer(
  ctx: BuildContext,
  entry: string,
  { runtimeFiles, versions = {} }: BundleOptions,
) {
  const build = await rollup({
    plugins: [
      mainPlugin({ ws: ctx, browser: false, code: entry }),
      markoPlugin({ ws: ctx, browser: false, runtimeFiles }),
      cssPlugin({ browser: false }),
      cdnPlugin({ versions }),
      minifyScriptPlugin(),
    ],
  });
  return { build, generate: () => generate(build, serverFile, ctx) };
}

export async function bundleClient(
  ctx: BuildContext,
  csr: boolean,
  { runtimeFiles, versions = {} }: BundleOptions,
) {
  const build = await rollup({
    plugins: [
      mainPlugin({
        ws: ctx,
        browser: true,
        code: csr
          ? `import t from "${rootDir}index.marko";t.mount({}, document.body)`
          : `import "${rootDir}index.marko?hydrate"`,
      }),
      markoPlugin({ ws: ctx, browser: true, runtimeFiles }),
      cssPlugin({ browser: true }),
      cdnPlugin({ versions }),
      minifyScriptPlugin(),
    ],
  });
  return { build, generate: () => generate(build, clientFile, ctx) };
}

async function generate(
  build: Awaited<ReturnType<typeof rollup>>,
  file: string,
  ctx: BuildContext,
): Promise<Bundle> {
  const { output } = await build.generate({
    file,
    format: "es",
    compact: ctx.optimize,
    sourcemap: "hidden",
    inlineDynamicImports: true,
  });
  const css = file.replace(/\.js$/, ".css");
  return {
    code: getAssetCode(output, file),
    map: getAssetCode(output, `${file}.map`),
    css: getAssetCode(output, css),
    cssMap: getAssetCode(output, `${css}.map`),
    modules: (output[0] as OutputChunk | undefined)?.modules,
  };
}

export function getAssetCode(
  chunks: (OutputChunk | OutputAsset)[],
  name: string,
) {
  for (const chunk of chunks) {
    if (chunk.fileName === name) {
      if (chunk.type === "asset") {
        return chunk.source as string;
      } else {
        return chunk.code;
      }
    }
  }
}
