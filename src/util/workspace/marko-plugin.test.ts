import { describe, expect, it } from "vitest";
import path from "path";
import runtimeFiles from "virtual:marko-runtime-files";

// Mirrors resolveRuntimeModule in marko-plugin.ts (not exported to keep the
// plugin surface minimal); asserts the captured dist can satisfy every import
// shape the playground sees.
function resolveRuntimeModule(id: string, importer?: string) {
  if (id[0] === ".") {
    if (!(importer && importer in runtimeFiles)) return;
    id = path.join(importer, "..", id);
  } else if (!id.startsWith("marko/")) {
    return;
  }
  if (id in runtimeFiles) return id;
  const withExtension = `${id}.mjs`;
  if (withExtension in runtimeFiles) return withExtension;
}

describe("marko runtime files", () => {
  it("captures the runtime entries", () => {
    for (const entry of [
      "marko/dom",
      "marko/html",
      "marko/debug/dom",
      "marko/debug/html",
    ]) {
      const resolved = resolveRuntimeModule(entry);
      expect(resolved, entry).toBeDefined();
      expect(runtimeFiles[resolved!]).toBeTypeOf("string");
    }
  });

  it("resolves every relative and bare import within the captured files", () => {
    for (const id in runtimeFiles) {
      for (const [, ...specs] of runtimeFiles[id].matchAll(
        /\bfrom\s*"([^"]+)"|\bimport\s*"([^"]+)"|\bimport\("([^"]+)"\)/g,
      )) {
        const spec = specs.find(Boolean);
        if (!(spec && /^\.\.?\/|^marko\//.test(spec))) continue;
        expect(
          resolveRuntimeModule(spec, id),
          `${spec} from ${id}`,
        ).toBeDefined();
      }
    }
  });

  it("resolves translator feature imports", () => {
    expect(resolveRuntimeModule("marko/dom/controllable-input.feat")).toBe(
      "marko/dom/controllable-input.feat.mjs",
    );
    expect(resolveRuntimeModule("marko/debug/dom/catch.feat")).toBe(
      "marko/debug/dom/catch.feat.mjs",
    );
  });
});
