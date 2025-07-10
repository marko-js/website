import { rollup, type OutputAsset, type OutputChunk } from "@rollup/browser";
import WritableDOMStream from "writable-dom";

import { cssPlugin } from "./workspace/css-plugin";
import { mainPlugin } from "./workspace/main-plugin";
import { markoPlugin } from "./workspace/marko-plugin";
import { minifyScriptPlugin } from "./workspace/minify-script-plugin";

import { toByteSizes, type Sizes } from "./sizes";
import { FileSystem } from "./workspace/fs";

export interface File {
  path: string;
  content: string;
}
export interface Workspace {
  fs: FileSystem;
  optimize: boolean;
  buildErrors: undefined | [Error, ...Error[]];
  runtimeErrors: undefined | [Error, ...Error[]];
  server: Worker | undefined;
  stats:
    | undefined
    | {
        markup: undefined | Sizes;
        script: undefined | Sizes;
        style: undefined | Sizes;
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
    buildErrors: undefined,
    runtimeErrors: undefined,
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
            code: `import t from "${rootDir}index.marko";onmessage=async()=>{for await(const c of t.render())postMessage(c);postMessage(0)}`,
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
      ws.server.addEventListener("error", onRuntimeError, { signal });
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
      const codeSize = code ? toByteSizes(code) : undefined;
      const cssCodeSize = cssCode ? toByteSizes(cssCode) : undefined;

      frame.addEventListener("error", onRuntimeError, { signal });
      frame.addEventListener(
        "load",
        async () => {
          const win = frame.contentWindow!;
          win.addEventListener("error", onRuntimeError, { signal });
          win.addEventListener("unhandledrejection", onRuntimeError, {
            signal,
          });
          await serverBuild;
          const { server } = ws;
          if (!server || signal.aborted) return;

          const htmlStream = new ReadableStream({
            start(c) {
              server.addEventListener(
                "message",
                (ev) => {
                  if (ev.data) {
                    c.enqueue(ev.data);
                  } else {
                    c.close();
                  }
                },
                { signal },
              );
              server.postMessage(1);
            },
          });

          const [htmlStreamA, htmlStreamB] = htmlStream.tee();
          const markupSize = toByteSizes(
            htmlStreamA.pipeThrough(new TextEncoderStream(), { signal }),
          );
          void htmlStreamB.pipeTo(
            new WritableDOMStream(frame.contentDocument!.body),
            { signal },
          );

          ws.stats = {
            markup: await markupSize,
            script: await codeSize,
            style: await cssCodeSize,
          };
          emit();
        },
        { signal },
      );
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
                getSourceMapComment(file, getAssetCode(output, `${file}.map`)),
            )}"></script>`
          : "");
    })();

    await Promise.all([serverBuild, browserBuild]);
  } catch (err) {
    console.error(err);
    ws.buildErrors = ws.buildErrors
      ? [...ws.buildErrors, err as any]
      : [err as any];
    emit();
  }

  function onRuntimeError(ev: ErrorEvent | PromiseRejectionEvent) {
    if (!ev.defaultPrevented) {
      let err = "error" in ev ? ev.error : ev.reason;
      if (!err && isErrorEvent(ev)) {
        err = new Error(
          `${ev.message}\n${ev.filename}:${ev.lineno},${ev.colno}`,
        );
      } else if (err) {
        if ("detail" in err) {
          err = err.detail;
        }
      } else {
        err = new Error("Unknown error");
      }

      ws.runtimeErrors = ws.runtimeErrors ? [...ws.runtimeErrors, err] : [err];
      emit();
    }
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

function isErrorEvent(
  ev: ErrorEvent | PromiseRejectionEvent,
): ev is ErrorEvent {
  return ev.type === "error";
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
          ? "\n//# sourceMappingURL=" + toDataURI("application/json", map)
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
