import { rollup, type Plugin, type RollupFsModule } from "@rollup/browser";
import { resolveSync, type ResolveOptions } from "resolve-sync";
import fs, { getFiles } from "./fs-shim";

const rollupFS: RollupFsModule = {
  appendFile: unsupported("appendFile"),
  copyFile: unsupported("copyFile"),
  lstat: unsupported("lstat"),
  mkdir: unsupported("mkdir"),
  mkdtemp: unsupported("mkdtemp"),
  async readFile(path, opts) {
    return fs.readFileSync(path, opts as any) as any;
  },
  async readdir(path, opts) {
    return fs.readdirSync(path, opts as any) as any;
  },
  realpath: unsupported("realpath"),
  rename: unsupported("rename"),
  rmdir: unsupported("rmdir"),
  async stat(path) {
    return fs.statSync(path);
  },
  unlink: unsupported("unlink"),
  writeFile: unsupported("writeFile"),
};
const resolveFS = {
  isFile(file: string) {
    return file in getFiles();
  },
  readPkg(file: string) {
    return JSON.parse(getFiles()[file] || "");
  },
} satisfies ResolveOptions["fs"];

export function bundle(entryFile: string, target: "server" | "client") {
  rollup({
    input: entryFile,
    fs: rollupFS,
    plugins: [fsPlugin(), resolvePlugin({ browser: target === "client" })],
  });
}

function resolvePlugin(opts: { browser: boolean }): Plugin {
  const noopModule = "\0resolve-plugin-noop";
  return {
    name: "resolve-plugin",
    resolveId(source, importer) {
      const resolved = resolveSync(source, {
        from: importer || "/main",
        fs: resolveFS,
        browser: opts.browser,
      });

      if (resolved === false) {
        return noopModule;
      }

      return resolved;
    },
  };
}

function fsPlugin(): Plugin {
  return {
    name: "fs-plugin",
    load(id) {
      const files = getFiles();
      const content = files[id];
      if (content !== undefined) {
        const sourceMap = files[id + ".map"];
        if (sourceMap) {
          return {
            code: content,
            map: JSON.parse(sourceMap),
          };
        }

        return content;
      }
    },
  };
}

function unsupported(name: string) {
  return (..._: any[]): any => {
    throw new Error(`fs.${name} is unsupported`);
  };
}
