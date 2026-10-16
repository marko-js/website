import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import {
  bundleClient,
  bundleServer,
  createBuildContext,
  installPackages,
  type File,
} from "./build.ts";
import { highlight } from "./highlight.ts";
import { rootDir } from "./workspace/fs.ts";

export interface StaticBuild {
  html: string;
  css: string;
  js: string;
  /** Highlighted source for each file, in the order given. */
  sources: { path: string; html: string }[];
  /** The rules for every class used by `sources`. */
  sourceCSS: string;
}

// `@rollup/browser` loads its wasm with `fetch(new URL(..., import.meta.url))`,
// which Node's fetch rejects for `file:` URLs.
const nodeFetch = globalThis.fetch;
globalThis.fetch = (input, init) => {
  const url =
    input instanceof URL
      ? input
      : /^file:/.test(String(input)) && new URL(String(input));
  return url && url.protocol === "file:"
    ? fs.promises.readFile(url).then(
        (body) =>
          new Response(body, {
            headers: { "content-type": "application/wasm" },
          }),
      )
    : nodeFetch(input, init);
};

let runtimeFiles: Record<string, string> | undefined;
/** The Marko runtime sources as text, read from the installed `marko` package. */
export function readRuntimeFiles() {
  if (runtimeFiles) return runtimeFiles;
  const distDir = path.join(
    path.dirname(createRequire(import.meta.url).resolve("marko/package.json")),
    "dist",
  );
  runtimeFiles = {};
  for (const file of fs.globSync("{,debug/}{dom,html}{,-*,/**/*}.mjs", {
    cwd: distDir,
  })) {
    runtimeFiles[`marko/${file.replaceAll(path.sep, "/")}`] = fs.readFileSync(
      path.join(distDir, file),
      "utf8",
    );
  }
  return runtimeFiles;
}

/**
 * Compiles and renders an example with no browser: the server bundle is
 * evaluated for the HTML, and the client bundle is returned for hydration.
 * Pass `csr` to skip the server render and mount on the client instead.
 */
export async function buildStatic(
  files: File[],
  { csr = false, optimize = true } = {},
): Promise<StaticBuild> {
  const ctx = createBuildContext(files, optimize);
  const versions = await installPackages(ctx);
  const options = { runtimeFiles: readRuntimeFiles(), versions };

  let html = "";
  if (!csr) {
    const { generate } = await bundleServer(
      ctx,
      `import t from "${rootDir}index.marko";export default t`,
      options,
    );
    const { code } = await generate();
    const mod = await import(
      /* @vite-ignore */ `data:text/javascript;base64,${Buffer.from(code!).toString("base64")}`
    );
    for await (const chunk of mod.default.render()) html += chunk;
  }

  const { generate } = await bundleClient(ctx, csr, options);
  const client = await generate();
  const sources = [];
  let sourceCSS = "";
  for (const { path, content } of files) {
    const highlighted = highlight(path, content);
    sources.push({ path, html: highlighted.html });
    sourceCSS += highlighted.css;
  }
  return {
    html,
    css: client.css ?? "",
    js: client.code ?? "",
    sources,
    sourceCSS,
  };
}
