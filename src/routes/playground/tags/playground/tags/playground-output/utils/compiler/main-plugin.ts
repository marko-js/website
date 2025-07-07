import type { Plugin, RollupFsModule } from "@rollup/browser";

import fs, { getFiles } from "./fs";
import { resolveSync, type ResolveOptions } from "resolve-sync";

export interface MainPluginOptions {
  code: string;
  browser: boolean;
}

const mainId = "\0main";
const excludeId = "\0exclude";

export function mainPlugin({ code, browser }: MainPluginOptions): Plugin {
  return {
    name: "main",
    options(inputOptions) {
      inputOptions.fs = rollupFS;
      inputOptions.input = mainId;
    },
    resolveId(id, importer) {
      if (id === mainId) {
        return mainId;
      }

      if (importer === mainId) {
        return id;
      }

      const suffix = /\?.*$/.exec(id)?.[0];
      if (suffix) {
        id = id.slice(0, -suffix.length);
      }
      const resolved = resolveSync(id, {
        browser,
        silent: true,
        fs: resolveFs,
        from: importer || mainId,
      });

      if (resolved === false) {
        return excludeId;
      }
      
      if (resolved) {
        return resolved + (suffix || "");
      }
    },
    load(id) {
      if (id === mainId) {
        return code;
      }

      const suffix = /\?.*$/.exec(id)?.[0];
      if (suffix) {
        id = id.slice(0, -suffix.length);
      }

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

function unsupported(name: string) {
  return (..._: any[]): any => {
    throw new Error(`fs.${name} is unsupported`);
  };
}
