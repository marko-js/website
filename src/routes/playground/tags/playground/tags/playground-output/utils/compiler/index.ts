import { rollup, type OutputAsset, type OutputChunk } from "@rollup/browser";

import type { PlaygroundFile } from "../../../../playground.marko";

import { toAssetURL } from "../asset-url";
import { getSourceMapComment } from "../sourcemap-comment";

import { cssPlugin } from "./css-plugin";
import { mainPlugin } from "./main-plugin";
import { markoPlugin } from "./marko-plugin";
import { minifyScriptPlugin } from "./minify-script-plugin";

import { resetFileSystem } from "./fs";

export interface BuildResult {
  client: {
    js?: string;
    css?: string;
  };
  server: {
    js?: string;
  };
}

export async function compile(files: PlaygroundFile[]): Promise<BuildResult> {
  const optimize = true;
  const rootDir = "/tags/";

  resetFileSystem(
    Object.fromEntries(
      files.map(({ path, content }) => [rootDir + path, content]),
    ),
  );

  const [server, client] = await Promise.all([
    bundle({
      code: `import tag from "${rootDir}index.marko";const stream = tag.render().toReadable();self.postMessage(stream,[stream])`,
      browser: false,
      optimize,
    }),
    bundle({
      code: `import "${rootDir}index.marko?hydrate"`,
      browser: true,
      optimize,
    }),
  ]);

  return { server, client };
}

interface BundleOptions {
  code: string;
  browser: boolean;
  optimize: boolean;
}
async function bundle({ optimize, browser, code }: BundleOptions) {
  const baseFile = browser ? "client" : "server";
  const jsFile = `${baseFile}.js`;
  const cssFile = "client.css";
  const { output } = await (
    await rollup({
      plugins: [
        mainPlugin({ browser, code }),
        markoPlugin({ optimize, output: browser ? "dom" : "html" }),
        cssPlugin({ browser }),
        optimize && minifyScriptPlugin(),
      ],
    })
  ).generate({
    file: jsFile,
    format: "es",
    compact: optimize,
    sourcemap: "hidden",
    inlineDynamicImports: true,
  });

  let js = getAssetCode(output, jsFile);
  if (js !== undefined) {
    js += getSourceMapComment(jsFile, getAssetCode(output, jsFile + ".map"));
  }

  let css = browser ? getAssetCode(output, cssFile) : undefined;
  if (css !== undefined) {
    css += getSourceMapComment(cssFile, getAssetCode(output, cssFile + ".map"));
  }

  return {
    js: js && toAssetURL(jsFile, "application/javascript", js),
    css: css && toAssetURL(cssFile, "text/css", css),
  };
}

function getAssetCode(chunks: (OutputChunk | OutputAsset)[], name: string) {
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
