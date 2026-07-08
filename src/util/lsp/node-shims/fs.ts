// Browser stand-in for the synchronous `fs` API the language server touches:
// reads are served from the virtual disk (`../vfs`), everything else is a
// harmless no-op. `documents.get()` / `documents.exists()` already wrap these in
// try/catch and treat a throw as "file not found", so an absent file simply
// throws.
import * as vfs from "../vfs";

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
  isSymbolicLink() {
    return false;
  }
}

export function statSync(path: string): Stats {
  if (vfs.fileExists(path)) return new Stats("file");
  if (vfs.directoryExists(path)) return new Stats("dir");
  throw fileNotFound(path);
}

export const lstatSync = statSync;

export function readFileSync(path: string, _encoding?: unknown): string {
  const content = vfs.readFile(path);
  if (content === undefined) throw fileNotFound(path);
  return content;
}

export function accessSync(path: string): void {
  if (!vfs.fileExists(path) && !vfs.directoryExists(path)) {
    throw fileNotFound(path);
  }
}

export function existsSync(path: string): boolean {
  return vfs.fileExists(path) || vfs.directoryExists(path);
}

export function readdirSync(path: string): string[] {
  return vfs.readDirectory(path);
}

export function realpathSync(path: string): string {
  return path;
}

export function writeFileSync(path: string, content: string): void {
  vfs.writeFile(path, content);
}

function fileNotFound(path: string) {
  return Object.assign(
    new Error(`ENOENT: no such file or directory, '${path}'`),
    { code: "ENOENT" },
  );
}

export default {
  statSync,
  lstatSync,
  readFileSync,
  accessSync,
  existsSync,
  readdirSync,
  realpathSync,
  writeFileSync,
};
