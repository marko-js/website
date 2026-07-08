import { URI } from "vscode-uri";
import type {
  CodeAction,
  Command,
  CompletionItem,
  CompletionList,
  Definition,
  Diagnostic,
  Hover,
  LocationLink,
  Position,
  Range,
} from "vscode-languageserver-types";

import { rootDir, type File } from "app/util/workspace";

/** LSP `CompletionContext` (lives in the protocol package, inlined here). */
interface CompletionContext {
  triggerKind: 1 | 2 | 3;
  triggerCharacter?: string;
}

// Client half of the in-browser language server. Owns the worker, keeps the
// server's virtual documents in sync with the playground files, and turns the
// `postMessage` RPC into promise-returning methods the editor can await.

type ServerMessage =
  | { type: "ready"; id: number }
  | { type: "response"; id: number; result?: unknown; error?: string };

type RequestMethod =
  | "doValidate"
  | "doHover"
  | "doComplete"
  | "doCompletionResolve"
  | "doCodeActions"
  | "doCodeActionResolve"
  | "findDefinition";

interface Pending {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}

export class LspClient {
  #worker: Worker;
  #nextId = 1;
  #pending = new Map<number, Pending>();
  #docs = new Map<
    string,
    { version: number; content: string; open: boolean }
  >();
  #ready: Promise<void>;

  constructor() {
    this.#worker = new Worker(new URL("./server.worker.ts", import.meta.url), {
      type: "module",
      name: "marko-language-server",
    });
    this.#worker.addEventListener("message", (event) =>
      this.#onMessage(event.data as ServerMessage),
    );
    this.#worker.addEventListener("error", (e) =>
      console.error("[lsp] worker error", e.message, e.filename, e.lineno),
    );
    this.#worker.addEventListener("messageerror", (e) =>
      console.error("[lsp] worker messageerror", e),
    );
    const id = this.#nextId++;
    this.#ready = new Promise<void>((resolve, reject) => {
      this.#pending.set(id, { resolve: () => resolve(), reject });
    });
    this.#worker.postMessage({ type: "initialize", id });
  }

  get ready() {
    return this.#ready;
  }

  /**
   * Turn a playground file path into the `file://` URI the server keys on.
   * Files are rooted under {@link rootDir} (the same directory the build
   * workspace uses) so the server's Marko tag discovery resolves sibling
   * `.marko` files as custom tags, exactly as the runtime does.
   */
  static uri(path: string) {
    return URI.file(rootDir + path.replace(/^\/+/, "")).toString();
  }

  /** Reverse of {@link uri}: the playground file path a `file://` URI names. */
  static pathForUri(uri: string) {
    const fsPath = URI.parse(uri).fsPath;
    return fsPath.startsWith(rootDir)
      ? fsPath.slice(rootDir.length)
      : fsPath.replace(/^\/+/, "");
  }

  /**
   * Bring the server's open documents in line with the current playground
   * files: open new ones, push edits, and close deleted ones.
   */
  syncFiles(files: File[]) {
    const seen = new Set<string>();
    for (const file of files) {
      const uri = LspClient.uri(file.path);
      seen.add(uri);
      const existing = this.#docs.get(uri);
      if (!existing) {
        this.#docs.set(uri, { version: 1, content: file.content, open: true });
        this.#worker.postMessage({
          type: "didOpen",
          uri,
          languageId: languageIdFor(file.path),
          version: 1,
          text: file.content,
        });
      } else if (existing.content !== file.content) {
        existing.version++;
        existing.content = file.content;
        this.#worker.postMessage({
          type: "didChange",
          uri,
          version: existing.version,
          text: file.content,
        });
      }
    }

    for (const [uri, doc] of this.#docs) {
      if (!seen.has(uri) && doc.open) {
        doc.open = false;
        this.#worker.postMessage({ type: "didClose", uri });
        this.#docs.delete(uri);
      }
    }
  }

  /** Push a single document edit ahead of a request that depends on it. */
  didChange(path: string, content: string) {
    const uri = LspClient.uri(path);
    const existing = this.#docs.get(uri);
    if (existing) {
      if (existing.content === content) return;
      existing.version++;
      existing.content = content;
      this.#worker.postMessage({
        type: "didChange",
        uri,
        version: existing.version,
        text: content,
      });
    } else {
      this.#docs.set(uri, { version: 1, content, open: true });
      this.#worker.postMessage({
        type: "didOpen",
        uri,
        languageId: languageIdFor(path),
        version: 1,
        text: content,
      });
    }
  }

  validate(path: string) {
    return this.#request<Diagnostic[] | undefined>("doValidate", path);
  }

  hover(path: string, position: Position) {
    return this.#request<Hover | undefined>("doHover", path, {
      textDocument: { uri: LspClient.uri(path) },
      position,
    });
  }

  complete(path: string, position: Position, context?: CompletionContext) {
    return this.#request<CompletionList | CompletionItem[] | undefined>(
      "doComplete",
      path,
      {
        textDocument: { uri: LspClient.uri(path) },
        position,
        context,
      },
    );
  }

  resolveCompletion(item: CompletionItem) {
    return this.#request<CompletionItem | undefined>(
      "doCompletionResolve",
      undefined,
      item,
    );
  }

  definition(path: string, position: Position) {
    return this.#request<Definition | LocationLink[] | undefined>(
      "findDefinition",
      path,
      { textDocument: { uri: LspClient.uri(path) }, position },
    );
  }

  codeActions(path: string, range: Range, diagnostics: Diagnostic[]) {
    return this.#request<(Command | CodeAction)[] | undefined>(
      "doCodeActions",
      path,
      {
        textDocument: { uri: LspClient.uri(path) },
        range,
        context: { diagnostics, only: ["quickfix"] },
      },
    );
  }

  resolveCodeAction(action: CodeAction) {
    return this.#request<CodeAction | undefined>(
      "doCodeActionResolve",
      undefined,
      action,
    );
  }

  async #request<T>(
    method: RequestMethod,
    path?: string,
    params?: unknown,
  ): Promise<T> {
    await this.#ready;
    const id = this.#nextId++;
    return new Promise<T>((resolve, reject) => {
      this.#pending.set(id, { resolve: resolve as Pending["resolve"], reject });
      this.#worker.postMessage({
        type: "request",
        id,
        method,
        uri: path === undefined ? undefined : LspClient.uri(path),
        params,
      });
    });
  }

  #onMessage(message: ServerMessage) {
    // Negative ids are worker-global error broadcasts (see worker-error-report).
    if (message.id < 0) {
      console.error(
        "[marko language server]",
        "error" in message ? message.error : message,
      );
      return;
    }
    const pending = this.#pending.get(message.id);
    if (!pending) return;
    this.#pending.delete(message.id);
    if (message.type === "ready") {
      pending.resolve(undefined);
    } else if (message.error) {
      pending.reject(new Error(message.error));
    } else {
      pending.resolve(message.result);
    }
  }
}

let client: LspClient | undefined;
/** Lazily start the language server; only the playground needs it. */
export function getLspClient() {
  return (client ??= new LspClient());
}

function languageIdFor(path: string) {
  switch (path.slice(path.lastIndexOf(".") + 1)) {
    case "marko":
      return "marko";
    case "ts":
    case "mts":
    case "cts":
      return "typescript";
    case "js":
    case "mjs":
    case "cjs":
      return "javascript";
    case "css":
      return "css";
    case "scss":
      return "scss";
    case "less":
      return "less";
    case "json":
      return "json";
    default:
      return "plaintext";
  }
}
