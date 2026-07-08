// Assembles the in-browser language server: it takes the embedded services from
// `@marko/language-server/browser` and fills the environment seams with the
// worker-local glue (a virtual filesystem, a `ts.System`, the injected Marko
// compiler), then exposes the service over a small `postMessage` RPC. The
// heavy lifting -- extracting Marko into TS/CSS and running TypeScript and the
// CSS language service -- lives in the language server; only the environment is
// provided here.
import "./globals";
import "./project-defaults";

import { Project } from "@marko/language-tools";
import {
  clearMarkoCacheForFile,
  createService,
  documents,
  MarkoPlugin,
  ScriptPlugin,
  setSystem,
  setupMessages,
  StylePlugin,
  workspace,
} from "@marko/language-server/browser";
import type { InitializeParams } from "vscode-languageserver";
import { URI } from "vscode-uri";
import ts from "typescript/lib/tsserverlibrary";

import { createBrowserSystem } from "./system";
import * as vfs from "./vfs";

// TypeScript reaches for a `ts.System` outside the language-service host (config
// discovery, module resolution). The bundled `ts.sys` is a read-only getter, so
// the server reads an injectable system instead; install the virtual-disk one
// now, before any request builds a project.
setSystem(createBrowserSystem(ts));

// No LSP connection in the browser: `getConfiguration` yields defaults and
// notifications are dropped.
workspace.setup({
  onDidChangeConfiguration() {},
  workspace: { getConfiguration: async () => ({}) },
} as never);
setupMessages({ sendNotification() {} } as never);

// The jsdom-backed HTML (a11y) plugin cannot run in a worker, so the browser
// service composes only Marko, TypeScript and CSS.
const service = createService([MarkoPlugin, ScriptPlugin, StylePlugin]);

// Marko parse/analysis is cached per document; a `TextDocument` is mutated in
// place on edit, so its cache entry must be invalidated on every change (the
// Node entry does the same via its `didChangeTextDocument` handler).
documents.onFileChange((changeDoc) => {
  if (changeDoc) {
    clearMarkoCacheForFile(changeDoc);
  } else {
    Project.clearCaches();
  }
});

const notCancelled = {
  isCancellationRequested: false,
  onCancellationRequested: () => ({ dispose() {} }),
};

/** Messages the playground client sends to this worker. */
export type ClientMessage =
  | { type: "initialize"; id: number; params?: Partial<InitializeParams> }
  | {
      type: "didOpen";
      uri: string;
      languageId: string;
      version: number;
      text: string;
    }
  | { type: "didChange"; uri: string; version: number; text: string }
  | { type: "didClose"; uri: string }
  | {
      type: "request";
      id: number;
      method: RequestMethod;
      uri?: string;
      params?: unknown;
    };

/** Messages this worker sends back to the client. */
export type ServerMessage =
  | { type: "ready"; id: number }
  | { type: "response"; id: number; result?: unknown; error?: string };

export type RequestMethod =
  | "doValidate"
  | "doHover"
  | "doComplete"
  | "doCompletionResolve"
  | "doCodeActions"
  | "doCodeActionResolve"
  | "findDefinition"
  | "findReferences"
  | "findDocumentHighlights"
  | "findDocumentSymbols"
  | "findDocumentColors"
  | "getColorPresentations";

interface Scope {
  postMessage(message: ServerMessage): void;
  addEventListener(
    type: "message",
    listener: (event: { data: ClientMessage }) => void,
  ): void;
}

export interface StartOptions {
  /**
   * Virtual-disk seed files, keyed by absolute path: the bundled `lib.*.d.ts`,
   * the Marko type definitions and a project `tsconfig.json`.
   */
  assets: Record<string, string>;
}

/** Wire the language server up to a worker-like scope (`self`). */
export function start(scope: Scope, { assets }: StartOptions): void {
  for (const path in assets) {
    vfs.writeFile(path, assets[path]);
    // Also seed as a (non-open) document so the TypeScript host reads the libs
    // and type definitions directly, without depending on the Node `fs` shim.
    documents.preload(pathToUri(path), languageIdForPath(path), assets[path]);
  }

  if (!vfs.fileExists("/tsconfig.json")) {
    vfs.writeFile("/tsconfig.json", DEFAULT_TSCONFIG);
  }

  scope.addEventListener("message", (event) => {
    void handle(scope, event.data);
  });
}

async function handle(scope: Scope, message: ClientMessage): Promise<void> {
  switch (message.type) {
    case "initialize": {
      await service.initialize?.({
        capabilities: {},
        processId: null,
        rootUri: null,
        workspaceFolders: null,
        ...message.params,
      } as InitializeParams);
      scope.postMessage({ type: "ready", id: message.id });
      break;
    }

    case "didOpen": {
      vfs.writeFile(uriToPath(message.uri), message.text);
      documents.doOpen({
        textDocument: {
          uri: message.uri,
          languageId: message.languageId,
          version: message.version,
          text: message.text,
        },
      });
      break;
    }

    case "didChange": {
      vfs.writeFile(uriToPath(message.uri), message.text);
      documents.doChange({
        textDocument: { uri: message.uri, version: message.version },
        contentChanges: [{ text: message.text }],
      });
      break;
    }

    case "didClose": {
      documents.doClose({ textDocument: { uri: message.uri } });
      break;
    }

    case "request": {
      try {
        const result = await dispatch(message);
        scope.postMessage({ type: "response", id: message.id, result });
      } catch (err) {
        scope.postMessage({
          type: "response",
          id: message.id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
      break;
    }
  }
}

async function dispatch(message: {
  method: RequestMethod;
  uri?: string;
  params?: unknown;
}): Promise<unknown> {
  // Resolve methods take the item/action directly rather than a document.
  if (message.method === "doCompletionResolve") {
    return service.doCompletionResolve?.(message.params as never, notCancelled);
  }
  if (message.method === "doCodeActionResolve") {
    return service.doCodeActionResolve?.(message.params as never, notCancelled);
  }

  const doc = message.uri ? documents.get(message.uri) : undefined;
  if (!doc) return undefined;

  if (message.method === "doValidate") {
    return service.doValidate?.(doc);
  }

  const handler = service[message.method] as
    ((doc: unknown, params: unknown, token: unknown) => unknown) | undefined;
  return handler?.(doc, message.params, notCancelled);
}

function uriToPath(uri: string): string {
  return URI.parse(uri).fsPath || "/";
}

function pathToUri(path: string): string {
  return URI.file(path).toString();
}

function languageIdForPath(path: string): string {
  const ext = path.slice(path.lastIndexOf(".") + 1);
  switch (ext) {
    case "ts":
    case "mts":
    case "cts":
      return "typescript";
    case "js":
    case "mjs":
    case "cjs":
      return "javascript";
    case "json":
      return "json";
    case "marko":
      return "marko";
    case "css":
    case "scss":
    case "less":
      return ext;
    default:
      return "typescript";
  }
}

const DEFAULT_TSCONFIG = JSON.stringify({
  compilerOptions: {
    target: "ESNext",
    module: "ESNext",
    moduleResolution: "Bundler",
    lib: ["DOM", "DOM.Iterable", "ESNext"],
    strict: true,
    jsx: "preserve",
    allowJs: true,
    checkJs: false,
    skipLibCheck: true,
  },
  include: [],
});
