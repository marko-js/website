import type { Plugin, RollupFsModule } from "@rollup/browser";

import { resolveSync, type ResolveOptions } from "resolve-sync";
import type { Workspace } from "../workspace";

export interface MainPluginOptions {
  ws: Workspace;
  code: string;
  browser: boolean;
}

const mainId = "\0main";
const excludeId = "\0exclude";

export function mainPlugin({
  ws: { fs },
  code,
  browser,
}: MainPluginOptions): Plugin {
  const rollupFS: RollupFsModule = {
    appendFile: unsupported,
    copyFile: unsupported,
    lstat: unsupported,
    mkdir: unsupported,
    mkdtemp: unsupported,
    async readFile(path) {
      return fs.readFileSync(path) as any;
    },
    async readdir(path) {
      return fs.readdirSync(path) as any;
    },
    realpath: unsupported,
    rename: unsupported,
    rmdir: unsupported,
    async stat(path) {
      return fs.statSync(path) as any;
    },
    unlink: unsupported,
    writeFile: unsupported,
  };

  const resolveFs: ResolveOptions["fs"] = {
    isFile(file: string) {
      return file in fs.files;
    },
    readPkg(file: string) {
      return JSON.parse(fs.files[file] || "");
    },
  };

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

      const content = fs.files[id];
      if (content !== undefined) {
        const sourceMap = fs.files[id + ".map"];
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

function unsupported(..._: any[]): any {
  throw new Error(`fs api is unsupported`);
}
