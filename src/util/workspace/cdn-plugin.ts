import type { Plugin } from "@rollup/browser";

export function cdnPlugin(): Plugin {
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
        return {
          id: `https://esm.sh/${id}?bundle`,
          external: true,
        };
      }
    },
  };
}
