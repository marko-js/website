import { rollup, type OutputAsset, type OutputChunk } from "@rollup/browser";

import type { PlaygroundFile } from "../../../../playground.marko";

import { toAssetURL } from "../asset-url";
import { getSourceMapComment } from "../sourcemap-comment";

import { cssPlugin } from "./css-plugin";
import { mainPlugin } from "./main-plugin";
import { markoPlugin } from "./marko-plugin";
import { minifyScriptPlugin } from "./minify-script-plugin";

import { resetFileSystem } from "./fs";
import { toSizes } from "../sizes";

export interface BuildResult {
  client: {
    js?: BuildAsset;
    css?: BuildAsset;
  };
  server: {
    js?: BuildAsset;
  };
}

export interface BuildAsset {
  url: string;
  sizes: Awaited<ReturnType<typeof toSizes>>;
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
        cssPlugin({ optimize, browser }),
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


  const jsCode = getAssetCode(output, jsFile);
  const jsCodeSize = jsCode ? toSizes(jsCode) : undefined;
  let js: BuildAsset | undefined;

  const cssCode = browser ? getAssetCode(output, cssFile) : undefined;
  const cssCodeSize = cssCode ? toSizes(cssCode) : undefined;
  let css: BuildAsset | undefined;

  if (jsCode) {
    js = {
      url: toAssetURL(
        jsFile,
        "application/javascript",
        jsCode +
          getSourceMapComment(jsFile, getAssetCode(output, jsFile + ".map")),
      ),
      sizes: await jsCodeSize!,
    };
  }

  if (cssCode) {
    css = {
      url: toAssetURL(
        cssFile,
        "text/css",
        cssCode +
          getSourceMapComment(cssFile, getAssetCode(output, cssFile + ".map")),
      ),
      sizes: await cssCodeSize!,
    };
  }

  return { js, css };
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
