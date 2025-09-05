import { format } from "prettier/standalone";
import prettierCSS from "prettier/plugins/postcss";
import prettierBabel from "prettier/plugins/babel";
import prettierEstree from "prettier/plugins/estree";
import { rollup, type OutputAsset, type OutputChunk } from "@rollup/browser";
import WritableDOMStream from "writable-dom";

import { cdnPlugin } from "./workspace/cdn-plugin";
import { cssPlugin } from "./workspace/css-plugin";
import { mainPlugin } from "./workspace/main-plugin";
import { markoPlugin } from "./workspace/marko-plugin";
import { minifyScriptPlugin } from "./workspace/minify-script-plugin";

import { toByteSizes, type Sizes } from "./sizes";
import { FileSystem } from "./workspace/fs";
import { prettyPrintHTML } from "./pretty-print-html";

export interface File {
  path: string;
  content: string;
}
export interface Workspace {
  fs: FileSystem;
  optimize: boolean;
  previewJS: string;
  previewCSS: string;
  previewHTML: string;
  previewModules: undefined | OutputChunk["modules"];
  buildErrors: undefined | [Error, ...Error[]];
  runtimeErrors: undefined | [Error, ...Error[]];
  server: undefined | Worker;
  stats:
    | undefined
    | {
        markup?: undefined | Sizes;
        script?: undefined | Sizes;
        style?: undefined | Sizes;
      };
}

let workspace: Workspace | undefined;
const rootDir = "/tags/";
const subs = new Set<(workspace: Workspace) => void>();
const consoleInjection = (c: typeof console, ns: string, color: string) => {
  const label = `%c[${ns}]%c `;
  const style = `color:${color}; font-weight:bold;`;
  for (const method of [
    "log",
    "info",
    "warn",
    "error",
    "debug",
    "trace",
  ] as (keyof typeof console)[]) {
    const f = c[method] as any;
    c[method] = ((...args: unknown[]) =>
      f.apply(c, [label, style, "", ...args])) as any;
  }

  const f = c.assert as any;
  c.assert = (cond, ...args) => f.apply(c, [cond, label, style, "", ...args]);
};

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
    previewJS: "",
    previewCSS: "",
    previewHTML: "",
    previewModules: undefined,
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
            code: `import t from "${rootDir}index.marko";let m;onmessage=async e=>{m=e;for await(const c of t.render())if(m==e)postMessage(c);else return;m==e&&postMessage(0)}\n(${consoleInjection.toString()})(console, "server", "#00FFFF")`,
          }),
          markoPlugin({
            ws,
            browser: false,
          }),
          cssPlugin({ browser: false }),
          cdnPlugin(),
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
          cdnPlugin(),
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

      ws.previewModules = output[0]?.modules;
      emit();

      const code = getAssetCode(output, file);
      const cssCode = getAssetCode(output, cssFile);

      if (code) {
        void toByteSizes(code).then((size) => {
          ws.stats = { ...ws.stats, script: size };
          emit();
        });

        void format(code, {
          parser: "babel",
          plugins: [prettierBabel, prettierEstree],
        }).then((formattedCode) => {
          ws.previewJS = formattedCode;
          emit();
        });
      }

      if (cssCode) {
        void toByteSizes(cssCode).then((size) => {
          ws.stats = { ...ws.stats, style: size };
          emit();
        });

        void format(cssCode, {
          parser: "css",
          plugins: [prettierCSS],
        }).then((formattedCode) => {
          ws.previewCSS = formattedCode;
          emit();
        });
      }

      frame.addEventListener("error", onRuntimeError, { signal });
      frame.addEventListener(
        "load",
        async () => {
          const win = frame.contentWindow! as Window & typeof globalThis;
          if (typeof window.console === "object") {
            consoleInjection(win.console, "client", "#c2185b");
          }
          win.addEventListener("error", onRuntimeError, { signal });
          win.addEventListener("unhandledrejection", onRuntimeError, {
            signal,
          });
          await serverBuild;
          const { server } = ws;
          if (!server || signal.aborted) return;

          const domWriter = WritableDOMStream(frame.contentDocument!.body);
          let rawHTML = "";
          server.onmessage = (ev) => {
            if (signal.aborted) return;
            if (ev.data) {
              rawHTML += ev.data;
              ws.previewHTML = prettyPrintHTML(rawHTML);
              emit();
              domWriter.write(ev.data);
            } else {
              void toByteSizes(rawHTML).then((size) => {
                ws.stats = { ...ws.stats, markup: size };
                emit();
              });
              domWriter.close();
            }
          };
          server.postMessage(1);
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
