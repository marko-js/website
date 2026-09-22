// Browser stand-in for the `fs/promises` API. Only the CSS language service's
// file-system provider uses this (for `@import` directory listings); reads are
// served from the virtual disk and missing entries reject like Node would.
import * as vfs from "../vfs";

interface Dirent {
  name: string;
  isFile(): boolean;
  isDirectory(): boolean;
}

class Stats {
  constructor(private readonly kind: "file" | "dir") {}
  mtimeMs = 0;
  ctimeMs = 0;
  size = 0;
  isFile() {
    return this.kind === "file";
  }
  isDirectory() {
    return this.kind === "dir";
  }
}

export async function stat(path: string): Promise<Stats> {
  if (vfs.fileExists(path)) return new Stats("file");
  if (vfs.directoryExists(path)) return new Stats("dir");
  throw fileNotFound(path);
}

export async function readFile(path: string): Promise<string> {
  const content = vfs.readFile(path);
  if (content === undefined) throw fileNotFound(path);
  return content;
}

export async function readdir(path: string): Promise<string[]> {
  return vfs.readDirectory(path);
}

export async function opendir(path: string): Promise<AsyncIterable<Dirent>> {
  const names = vfs.readDirectory(path);
  const base = path.endsWith("/") ? path : path + "/";
  const entries: Dirent[] = names.map((name) => {
    const isFile = vfs.fileExists(base + name);
    return {
      name,
      isFile: () => isFile,
      isDirectory: () => !isFile,
    };
  });
  return {
    async *[Symbol.asyncIterator]() {
      yield* entries;
    },
  };
}

function fileNotFound(path: string) {
  return Object.assign(
    new Error(`ENOENT: no such file or directory, '${path}'`),
    { code: "ENOENT" },
  );
}

export default { stat, readFile, readdir, opendir };
