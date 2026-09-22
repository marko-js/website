// A `ts.System` backed by the virtual disk. TypeScript uses `ts.sys` directly
// (outside the language-service host) for config discovery and module
// resolution, so the browser build installs this in place of the Node system
// that does not exist in a worker (via `setSystem` from
// `@marko/language-server/browser`).
import type ts from "typescript/lib/tsserverlibrary";

import * as vfs from "./vfs";

export function createBrowserSystem(
  typescript: typeof ts,
  currentDirectory = "/",
): ts.System {
  const system: ts.System = {
    args: [],
    newLine: "\n",
    useCaseSensitiveFileNames: true,
    write() {},
    readFile(path) {
      return vfs.readFile(path);
    },
    writeFile(path, data) {
      vfs.writeFile(path, data);
    },
    fileExists(path) {
      return vfs.fileExists(path);
    },
    directoryExists(path) {
      return vfs.directoryExists(path);
    },
    createDirectory() {},
    getExecutingFilePath() {
      return currentDirectory;
    },
    getCurrentDirectory() {
      return currentDirectory;
    },
    getDirectories(path) {
      return vfs.getDirectories(path);
    },
    readDirectory(path, extensions, excludes, includes, depth) {
      // Reuse TypeScript's own glob matcher against the virtual disk so that
      // `include`/`exclude` in tsconfig behave exactly as they do on Node.
      return (typescript as any).matchFiles(
        path,
        extensions,
        excludes,
        includes,
        /* useCaseSensitiveFileNames */ true,
        currentDirectory,
        depth,
        getAccessibleFileSystemEntries,
        (p: string) => p,
        (p: string) => vfs.directoryExists(p),
      );
    },
    exit() {},
    resolvePath(path) {
      return path;
    },
    realpath(path) {
      return path;
    },
  };

  return system;

  function getAccessibleFileSystemEntries(path: string) {
    const files: string[] = [];
    const directories: string[] = [];
    const base = path.endsWith("/") ? path : path + "/";
    for (const entry of vfs.readDirectory(path)) {
      if (vfs.fileExists(base + entry)) files.push(entry);
      else directories.push(entry);
    }
    return { files, directories };
  }
}
