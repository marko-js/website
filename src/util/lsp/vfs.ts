// A tiny in-memory "disk" for the in-browser language server. It stands in for
// the pieces of Node's `fs` that the server and TypeScript touch when running in
// a worker: the bundled `lib.*.d.ts` files, the Marko type definitions, a
// project `tsconfig.json`, and the user's open project files.
//
// The server keeps reading through the normal `documents`/`ts.System` paths --
// those bottom out at the Node `fs` shim (`node-shims/fs.ts`) and the `ts.System`
// shim (`system.ts`), both of which read from this map.

// Backed by a `globalThis` singleton so every bundled copy of this module reads
// and writes the same virtual disk. The worker imports it directly, but the
// pre-bundled `@marko/compiler` reaches its own copy through the `fs` shim (its
// taglib finder scans the disk for sibling `.marko` tags); both must see the
// same files.
const store = ((
  globalThis as typeof globalThis & {
    __markoLspVfs?: {
      files: Map<string, string>;
      directories: Set<string>;
    };
  }
).__markoLspVfs ??= {
  files: new Map<string, string>(),
  directories: new Set<string>(["/"]),
});
const files = store.files;
const directories = store.directories;

/** Absolute, POSIX-style path -- the only kind that exists on the virtual disk. */
export function writeFile(path: string, content: string): void {
  path = normalize(path);
  files.set(path, content);
  registerDirs(path);
}

export function deleteFile(path: string): void {
  files.delete(normalize(path));
}

export function readFile(path: string): string | undefined {
  return files.get(normalize(path));
}

export function fileExists(path: string): boolean {
  return files.has(normalize(path));
}

export function directoryExists(path: string): boolean {
  return directories.has(ensureTrailingSlash(normalize(path)));
}

/** Immediate children (files and directories) of a directory. */
export function readDirectory(path: string): string[] {
  const dir = ensureTrailingSlash(normalize(path));
  const seen = new Set<string>();
  for (const file of files.keys()) {
    if (file.startsWith(dir)) {
      const rest = file.slice(dir.length);
      const slash = rest.indexOf("/");
      seen.add(slash === -1 ? rest : rest.slice(0, slash));
    }
  }
  return [...seen];
}

export function getDirectories(path: string): string[] {
  const dir = ensureTrailingSlash(normalize(path));
  const seen = new Set<string>();
  for (const file of files.keys()) {
    if (file.startsWith(dir)) {
      const rest = file.slice(dir.length);
      const slash = rest.indexOf("/");
      if (slash !== -1) seen.add(rest.slice(0, slash));
    }
  }
  return [...seen];
}

export function allFiles(): IterableIterator<string> {
  return files.keys();
}

function registerDirs(path: string) {
  let index = path.indexOf("/", 1);
  while (index !== -1) {
    directories.add(path.slice(0, index + 1));
    index = path.indexOf("/", index + 1);
  }
}

function normalize(path: string) {
  // Collapse `\` to `/` and strip a `file://` scheme if one slipped through.
  path = path.replace(/\\/g, "/");
  if (path.startsWith("file://")) path = path.slice("file://".length);
  return path.startsWith("/") ? path : "/" + path;
}

function ensureTrailingSlash(path: string) {
  return path.endsWith("/") ? path : path + "/";
}
