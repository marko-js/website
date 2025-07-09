import { rollup, type OutputAsset, type OutputChunk } from "@rollup/browser";
import WritableDOMStream from "writable-dom";

import { cssPlugin } from "./workspace/css-plugin";
import { mainPlugin } from "./workspace/main-plugin";
import { markoPlugin } from "./workspace/marko-plugin";
import { minifyScriptPlugin } from "./workspace/minify-script-plugin";

import { toSizes, type Size } from "./sizes";
import { FileSystem } from "./workspace/fs";

export interface File {
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
  files: File[],
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

export function getSourceMapComment(filename: string, map: any) {
  if (!map) return "";
  if (typeof map === "object") map = JSON.stringify(map);
  switch (/\.[^.]+$/.exec(filename)?.[0]) {
    case ".js":
      return (
        "\n//# sourceURL=" +
        encodeURI(filename) +
        (map
          ? "\n//# sourceMappingURL=" +
            toDataURI("application/json", map)
          : "")
      );
    case ".css":
      return (
        "\n/*# sourceURL=" +
        encodeURI(filename) +
        "*/" +
        (map
          ? "\n/*# sourceMappingURL=" +
            toDataURI("application/json", map) +
            "*/"
          : "")
      );
  }

  throw new Error("Cannot create a sourcemap for " + filename);
}

const assetUrls = new Map<string, string>();
function toAssetURL(id: string, type: string, code: string) {
  let url = assetUrls.get(id);
  if (url) URL.revokeObjectURL(url);
  url = URL.createObjectURL(new Blob([code], { type }));
  assetUrls.set(id, url);
  return url;
}

function toDataURI(type: string, code: string) {
  return `data:${type};charset=utf-8;base64,${btoa(code)}`;
}
