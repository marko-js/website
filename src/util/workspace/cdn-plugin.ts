import type { Plugin } from "@rollup/browser";

export function cdnPlugin({
  versions,
}: {
  versions: Record<string, string>;
}): Plugin {
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
        const version = versions[name];
        return {
          id: `https://esm.sh/${version ? `${name}@${version}${subpath}` : id}?bundle`,
          external: true,
        };
      }
    },
  };
}
