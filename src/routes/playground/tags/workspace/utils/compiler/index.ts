import { rollup, type OutputAsset, type OutputChunk } from "@rollup/browser";
import WritableDOMStream from "writable-dom";

import { toAssetURL } from "../asset-url";
import { getSourceMapComment } from "../sourcemap-comment";

import { cssPlugin } from "./css-plugin";
import { mainPlugin } from "./main-plugin";
import { markoPlugin } from "./marko-plugin";
import { minifyScriptPlugin } from "./minify-script-plugin";

import { FileSystem } from "../fs";
import { toSizes, type Size } from "../sizes";

export interface WorkspaceFile {
  path: string;
  content: string;
}
export interface Workspace {
  fs: FileSystem;
  optimize: boolean;
  errors: undefined | [Error, ...Error[]];
  server: Worker | undefined;
  stats:
    | undefined
    | {
        markup: undefined | Size;
        script: undefined | Size;
        style: undefined | Size;
      };
}

let workspace: Workspace | undefined;
const rootDir = "/tags/";
const subs = new Set<(workspace: Workspace) => void>();

export function subscribe(
  handler: (workspace: Workspace) => void,
  signal: AbortSignal,
) {
  subs.add(handler);
  signal.addEventListener("abort", () => subs.delete(handler), {
    once: true,
  });

  if (workspace) {
    for (const sub of subs) {
      sub(workspace);
    }
  }
}

export async function update(
  signal: AbortSignal,
  frame: HTMLIFrameElement,
  files: WorkspaceFile[],
  optimize: boolean,
) {
  const fs = new FileSystem({});
  const ws: Workspace = (workspace = {
    fs,
    optimize,
    errors: undefined,
    stats: undefined,
    server: undefined,
  });
  for (const file of files) {
    fs.files[rootDir + file.path] = file.content;
  }

  try {
    const serverBuild = (async function buildServer() {
      const file = "server.js";
      const build = await rollup({
        plugins: [
          mainPlugin({
            ws,
            browser: false,
            code: `import tag from "${rootDir}index.marko";self.onmessage=()=>{const stream = tag.render().toReadable();self.postMessage(stream,[stream])}`,
          }),
          markoPlugin({
            ws,
            browser: false,
          }),
          cssPlugin({ browser: false }),
          minifyScriptPlugin(),
        ],
      });

      if (signal.aborted) return;

      const { output } = await build.generate({
        file,
        format: "es",
        compact: optimize,
        sourcemap: "hidden",
        inlineDynamicImports: true,
      });

      if (signal.aborted) return;

      const code = getAssetCode(output, file);
      workspace.server?.terminate();

      if (!code) {
        return;
      }

      ws.server = new Worker(
        toAssetURL(
          file,
          "application/javascript",
          code + getSourceMapComment(file, getAssetCode(output, `${file}.map`)),
        ),
        {
          name: file,
          type: "module",
        },
      );
      ws.server.addEventListener("error", onError, { signal });
    })();
    const browserBuild = (async function buildClient() {
      const file = "client.js";
      const cssFile = "client.css";
      const build = await rollup({
        plugins: [
          mainPlugin({
            ws,
            browser: true,
            code: `import "${rootDir}index.marko?hydrate"`,
          }),
          markoPlugin({ ws, browser: true }),
          cssPlugin({ browser: true }),
          minifyScriptPlugin(),
        ],
      });

      if (signal.aborted) return;

      const { output } = await build.generate({
        file,
        format: "es",
        compact: optimize,
        sourcemap: "hidden",
        inlineDynamicImports: true,
      });

      if (signal.aborted) return;

      const code = getAssetCode(output, file);
      const cssCode = getAssetCode(output, cssFile);

      await new Promise((resolve, reject) => {
        frame.addEventListener("load", resolve, { signal });
        frame.addEventListener("error", reject, { signal });
        frame.srcdoc =
          (cssCode
            ? `<link rel=stylesheet href="${toAssetURL(
                cssFile,
                "text/css",
                cssCode +
                  getSourceMapComment(
                    cssFile,
                    getAssetCode(output, `${cssFile}.map`),
                  ),
              )}">`
            : "") +
          (code
            ? `<script type=module async src="${toAssetURL(
                file,
                "application/javascript",
                code +
                  getSourceMapComment(
                    file,
                    getAssetCode(output, `${file}.map`),
                  ),
              )}"></script>`
            : "");
      });

      const win = frame.contentWindow!;
      win.addEventListener("error", onError, { signal });
      win.addEventListener("unhandledrejection", onError, { signal });
      await serverBuild;

      const msg = await new Promise<MessageEvent | void>((resolve, reject) => {
        if (!ws.server || signal.aborted) return resolve();
        ws.server.onmessage = resolve;
        ws.server.onerror = reject;
        ws.server.postMessage(1);
      });

      const htmlStream = msg?.data;
      if (signal.aborted || !(htmlStream instanceof ReadableStream)) return;

      const codeSize = code ? toSizes(code) : undefined;
      const cssCodeSize = cssCode ? toSizes(cssCode) : undefined;
      const [htmlStreamA, htmlStreamB] = htmlStream.tee();
      const markupSize = toSizes(htmlStreamA);
      void htmlStreamB
        .pipeThrough(new TextDecoderStream(), { signal })
        .pipeTo(new WritableDOMStream(frame.contentDocument!.body), { signal });

      ws.stats = {
        markup: await markupSize,
        script: await codeSize,
        style: await cssCodeSize,
      };
      emit();
    })();
    await serverBuild;
    await browserBuild;
  } catch (err) {
    addError(err);
  }

  function onError(ev: ErrorEvent | PromiseRejectionEvent) {
    if (!ev.defaultPrevented) {
      let err = "error" in ev ? ev.error : ev.reason || ev;
      if ("detail" in err) err = err.detail;
      addError(err);
    }
  }

  function addError(err: any) {
    console.error(err);
    ws.errors = ws.errors ? [...ws.errors, err] : [err];
    emit();
  }

  function emit() {
    if (!signal.aborted) {
      const copy = { ...ws };
      for (const sub of subs) {
        sub(copy);
      }
    }
  }
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
