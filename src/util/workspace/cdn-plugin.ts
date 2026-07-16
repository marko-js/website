import type { Plugin } from "@rollup/browser";

import { packageJsonPath, type Workspace } from "../workspace";

const simpleRange = /^[\^~]?\d[\w.\-+]*$/;

export function cdnPlugin({ ws: { fs } }: { ws: Workspace }): Plugin {
  let deps: Record<string, string> | undefined;
  try {
    const pkg = JSON.parse(fs.files[packageJsonPath] || "{}");
    deps = {
      ...pkg.peerDependencies,
      ...pkg.devDependencies,
      ...pkg.dependencies,
    };
  } catch {
    deps = undefined;
  }

  return {
    name: "cdn",
    async resolveId(id, importer, opts) {
      const resolved = await this.resolve(id, importer, opts);
      if (resolved) {
        return resolved;
      }

      if (/:/.test(id)) {
        return { id, external: true };
      }

      if (/^[^\0.\/]/.test(id)) {
        const [, name, subpath = ""] = /^(@[^/]+\/[^/]+|[^/]+)(\/.*)?$/.exec(
          id,
        )!;
        const range = deps?.[name];
        return {
          id: `https://esm.sh/${
            range && simpleRange.test(range) ? `${name}@${range}${subpath}` : id
          }?bundle`,
          external: true,
        };
      }
    },
  };
}
