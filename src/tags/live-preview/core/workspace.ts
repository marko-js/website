import { format } from "prettier/standalone";
import prettierCSS from "prettier/plugins/postcss";
import prettierBabel from "prettier/plugins/babel";
import prettierEstree from "prettier/plugins/estree";
import type { OutputChunk } from "@rollup/browser";
import runtimeFiles from "./runtime-files.ts";
import WritableDOMStream from "writable-dom";

import {
  bundleClient,
  bundleServer,
  cssFile,
  clientFile,
  createBuildContext,
  installPackages,
  serverFile,
  type BuildContext,
  type File,
} from "./build.ts";
import type { MarkoCompiled } from "./workspace/marko-plugin.ts";

import { toByteSizes, type Sizes } from "./sizes.ts";
import { rootDir } from "./workspace/fs.ts";
import type { FileSystem } from "./workspace/fs.ts";
import { prettyPrintHTML } from "./pretty-print-html.ts";

export type { File };
export interface LogEntry {
  ns: "client" | "server";
  method: string;
  text: string;
}
export interface Workspace extends BuildContext {
  fs: FileSystem;
  optimize: boolean;
  markoCompiled?: MarkoCompiled;
  previewReady: boolean;
  previewJS: string;
  previewCSS: string;
  previewHTML: string;
  previewModules: undefined | OutputChunk["modules"];
  buildErrors: undefined | [Error, ...Error[]];
  runtimeErrors: undefined | [Error, ...Error[]];
  server: undefined | Worker;
  logs: LogEntry[];
  stats:
    | undefined
    | {
        markup?: undefined | Sizes;
        script?: undefined | Sizes;
        style?: undefined | Sizes;
      };
}

const encoder = new TextEncoder();
function formatLogArgs(args: unknown[]): string {
  return args
    .map((a) => {
      if (typeof a === "string") return a;
      if (a && typeof a === "object") {
        const err = a as { stack?: unknown };
        if (typeof err.stack === "string") return err.stack;
        try {
          const json = JSON.stringify(a);
          if (json !== undefined) return json;
        } catch {
          // fall through to String()
        }
      }
      return String(a);
    })
    .join(" ");
}

const consoleInjection = (
  c: typeof console,
  ns: string,
  color: string,
  sink?: (method: string, args: unknown[]) => void,
) => {
  const label = `%c[${ns}]%c `;
  const style = `color:${color}; font-weight:bold;`;
  for (const method of [
    "log",
    "info",
    "warn",
    "error",
    "debug",
    "trace",
  ] as const) {
    const f = c[method] as any;
    c[method] = ((...args: unknown[]) => {
      try {
        sink?.(method, args);
      } catch {
        // ignore sink failures
      }
      return f.apply(c, [label, style, "", ...args]);
    }) as any;
  }

  const f = c.assert as any;
  c.assert = (cond, ...args) => {
    if (!cond) {
      try {
        sink?.("assert", args);
      } catch {
        // ignore sink failures
      }
    }
    return f.apply(c, [cond, label, style, "", ...args]);
  };
};

const consoleInjectionScript = (ns: string, color: string, post: string) =>
  `(${consoleInjection.toString()})(console,${JSON.stringify(ns)},${JSON.stringify(color)},(method,args)=>${post}({__mlog:{method,text:(${formatLogArgs.toString()})(args)}}))`;

const frameBootstrap =
  `<script>{
    const post = (data) => parent.postMessage(data, "*");
    const postError = (err) => {
      if (err && typeof err === "object" && "detail" in err) err = err.detail;
      post({
        __merr: {
          name: err && err.name,
          message: String((err && err.message) ?? err ?? "Unknown error"),
          stack: err && err.stack,
        },
      });
    };
    addEventListener("error", (e) => {
      if (!e.defaultPrevented) {
        postError(
          e.error ??
            e.message + "\\n" + e.filename + ":" + e.lineno + "," + e.colno,
        );
      }
    });
    addEventListener("unhandledrejection", (e) => {
      if (!e.defaultPrevented) postError(e.reason);
    });
    ${consoleInjectionScript("client", "#c2185b", "post")}
  }</scr` + `ipt>`;

function isErrorEvent(
  ev: ErrorEvent | PromiseRejectionEvent,
): ev is ErrorEvent {
  return ev.type === "error" && !!(ev as ErrorEvent).message;
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

function toDataURI(type: string, code: string) {
  let binary = "";
  for (const byte of encoder.encode(code)) {
    binary += String.fromCharCode(byte);
  }
  return `data:${type};charset=utf-8;base64,${btoa(binary)}`;
}

/**
 * One preview's state: the running build, its server worker and the blob
 * URLs for its assets. Several can exist on a page without interfering.
 */
export function createWorkspace() {
  let workspace: Workspace | undefined;
  const subs = new Set<(workspace: Workspace) => void>();
  const assetUrls = new Map<string, string>();

  function subscribe(
    handler: (workspace: Workspace) => void,
    signal: AbortSignal,
  ) {
    subs.add(handler);
    signal.addEventListener("abort", () => subs.delete(handler), {
      once: true,
    });

    if (workspace) {
      handler(workspace);
    }
  }

  async function update(
    signal: AbortSignal,
    frame: HTMLIFrameElement,
    files: File[],
    optimize: boolean,
    csr: boolean,
  ) {
    const ctx = createBuildContext(files, optimize);
    const { fs } = ctx;
    // Read before `workspace` is reassigned below: this holds the only reference
    // to the running preview server, which stays up until this build replaces it.
    const previous = workspace;
    if (csr) previous?.server?.terminate();
    const ws: Workspace = (workspace = {
      fs,
      optimize,
      previewReady: workspace?.previewReady ?? false,
      previewJS: "",
      previewCSS: "",
      previewHTML: "",
      previewModules: undefined,
      buildErrors: undefined,
      runtimeErrors: undefined,
      stats: undefined,
      server: undefined,
      logs: [],
    });
    let versions: Record<string, string> = {};
    try {
      versions = await installPackages(ctx);
      if (signal.aborted) return;
      const bundleOptions = { runtimeFiles, versions };

      const serverBuild = csr
        ? undefined
        : (async function buildServer() {
            const file = serverFile;
            const { generate } = await bundleServer(
              ws,
              `import t from "${rootDir}index.marko";let m;onmessage=async e=>{m=e;for await(const c of t.render())if(m==e)postMessage(c);else return;m==e&&postMessage(0)}\n${consoleInjectionScript("server", "#00FFFF", "postMessage")}`,
              bundleOptions,
            );

            if (signal.aborted) return;

            const bundle = await generate();

            if (signal.aborted) return;

            const code = bundle.code;
            previous?.server?.terminate();

            if (!code) {
              return;
            }

            const server = new Worker(
              toAssetURL(
                file,
                "application/javascript",
                code +
                  "onunhandledrejection=e=>{e.preventDefault();throw e.reason}" +
                  getSourceMapComment(file, bundle.map),
              ),
              {
                name: file,
                type: "module",
              },
            );

            // An abort between the check above and here would otherwise strand this
            // worker: `workspace` already points at a newer build, so nothing else
            // holds a reference to terminate it.
            if (signal.aborted) {
              server.terminate();
              return;
            }

            ws.server = server;
            server.addEventListener("error", onRuntimeError, { signal });
          })();
      const browserBuild = (async function buildClient() {
        const file = clientFile;
        const { generate } = await bundleClient(ws, csr, bundleOptions);

        if (signal.aborted) return;

        const bundle = await generate();

        if (signal.aborted) return;

        ws.previewModules = bundle.modules;
        emit();

        const code = bundle.code;
        const cssCode = bundle.css;

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
        window.addEventListener(
          "message",
          (ev) => {
            const data = ev.source === frame.contentWindow && ev.data;
            if (!data || typeof data !== "object") return;
            const { __mlog: mlog, __merr: merr } = data;
            if (mlog && typeof mlog === "object") {
              pushLog("client", String(mlog.method), String(mlog.text));
            } else if (merr && typeof merr === "object") {
              const err = new Error(String(merr.message));
              if (merr.name) err.name = String(merr.name);
              if (merr.stack) err.stack = String(merr.stack);
              pushRuntimeError(err);
            }
          },
          { signal },
        );
        frame.addEventListener(
          "load",
          async () => {
            if (csr) {
              ws.previewReady = true;
              emit();
              return;
            }
            await serverBuild;
            const { server } = ws;
            if (!server || signal.aborted) return;

            const domWriter = WritableDOMStream(frame.contentDocument!.body);
            let rawHTML = "";
            server.onmessage = (ev) => {
              if (signal.aborted) return;
              const data = ev.data;
              if (data && typeof data === "object" && "__mlog" in data) {
                pushLog("server", data.__mlog.method, data.__mlog.text);
              } else if (data) {
                rawHTML += data;
                ws.previewHTML = prettyPrintHTML(rawHTML);
                ws.previewReady = true;
                emit();
                domWriter.write(data);
              } else {
                void toByteSizes(rawHTML).then((size) => {
                  ws.stats = { ...ws.stats, markup: size };
                  emit();
                });
                domWriter.close();
                ws.previewReady = true;
                emit();
              }
            };
            server.postMessage(1);
          },
          { signal },
        );
        frame.srcdoc =
          frameBootstrap +
          (cssCode
            ? `<link rel=stylesheet href="${toAssetURL(
                cssFile,
                "text/css",
                cssCode + getSourceMapComment(cssFile, bundle.cssMap),
              )}">`
            : "") +
          (code
            ? `<script type=module async src="${toAssetURL(
                file,
                "application/javascript",
                code + getSourceMapComment(file, bundle.map),
              )}"></script>`
            : "");
        ws.previewReady = false;
        emit();
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

        pushRuntimeError(err);
      }
    }

    function pushRuntimeError(err: Error) {
      if (signal.aborted) return;
      ws.runtimeErrors = ws.runtimeErrors ? [...ws.runtimeErrors, err] : [err];
      emit();
    }

    function pushLog(ns: LogEntry["ns"], method: string, text: string) {
      if (signal.aborted) return;
      ws.logs = [...ws.logs, { ns, method, text }];
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

  function clearLogs() {
    if (workspace) {
      workspace.logs = [];
      const copy = { ...workspace };
      for (const sub of subs) {
        sub(copy);
      }
    }
  }

  function toAssetURL(id: string, type: string, code: string) {
    let url = assetUrls.get(id);
    if (url) URL.revokeObjectURL(url);
    url = URL.createObjectURL(new Blob([code], { type }));
    assetUrls.set(id, url);
    return url;
  }

  return { subscribe, update, clearLogs };
}

export const { subscribe, update, clearLogs } = createWorkspace();
