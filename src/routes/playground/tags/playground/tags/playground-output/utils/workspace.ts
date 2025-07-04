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
const resolveFs = {
  isFile(file: string) {
    return file in getFiles();
  },
  readPkg(file: string) {
    return JSON.parse(getFiles()[file] || "");
  },
} satisfies ResolveOptions["fs"];

export class Workspace {
  constructor(
    public entryFile: string,
    public target: "server" | "client" | "hydrate",
  ) {
    this.entryFile = entryFile;
    this.target = target;
  }
  #pending: Promise<void> | undefined;
  update() {
    const serverTarget = this.target !== "client";
    const browserTarget = this.target !== "server";
    const pendingBrowser =
      browserTarget &&
      rollup({
        input: this.entryFile,
        fs: rollupFS,
        plugins: [resolvePlugin({ browser: true }), fsPlugin()],
      });

    const pendingServer =
      serverTarget &&
      rollup({
        input: this.entryFile,
        fs: rollupFS,
        plugins: [resolvePlugin({ browser: false }), fsPlugin()],
      });

    const p = (async () => {
      const browserBuild = await pendingBrowser;
      const serverBuild = await pendingServer;
      if (this.#pending !== p!) return;
      this.#pending = undefined;
    })();
    return this.#pending = p;
  }
}

function resolvePlugin(opts: { browser: boolean }): Plugin {
  const noopModule = "\0resolve-plugin-noop";
  return {
    name: "resolve-plugin",
    resolveId(source, importer) {
      const resolved = resolveSync(source, {
        from: importer || "/main",
        fs: resolveFs,
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
