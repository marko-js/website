import { expect, test } from "vitest";
import * as compiler from "@marko/compiler";
import * as translator from "marko/translator";
import markoModules from "@marko/compiler/modules";

import { FileSystem } from "./fs";
import { setResolveFileSystem } from "./modules-shim";

// Everything in the playground's virtual filesystem hangs off `/`, which is
// the layout resolve-sync's upward walk cannot reach on its own: probes from a
// root-level file produce "//node_modules/..." and probes from nested files
// stop before the root. These tests pin the "//" resolution root workaround.
const fs = new FileSystem({
  "/marko.json": JSON.stringify({ "tags-dir": "." }),
  "/package.json": JSON.stringify({ dependencies: { "fake-widgets": "1" } }),
  "/index.marko": "<fake-widget/>\n",
  "/node_modules/fake-widgets/package.json": JSON.stringify({
    name: "fake-widgets",
    version: "1.0.0",
    main: "./dist/index.js",
  }),
  "/node_modules/fake-widgets/dist/index.js": "export default 1;\n",
  "/node_modules/fake-widgets/marko.json": JSON.stringify({
    "tags-dir": "./dist/tags",
  }),
  "/node_modules/fake-widgets/dist/tags/fake-widget/index.marko":
    "<span>widget</span>\n",
});

test("resolves installed packages from the root", () => {
  setResolveFileSystem(fs);
  expect(markoModules.tryResolve!("fake-widgets/marko.json", "/")).toBe(
    "/node_modules/fake-widgets/marko.json",
  );
  expect(markoModules.tryResolve!("fake-widgets", "/")).toBe(
    "/node_modules/fake-widgets/dist/index.js",
  );
});

test("resolves installed packages from nested files", () => {
  setResolveFileSystem(fs);
  expect(
    markoModules.tryResolve!(
      "fake-widgets/marko.json",
      "/node_modules/other/dist/deep",
    ),
  ).toBe("/node_modules/fake-widgets/marko.json");
});

test("discovers installed taglibs when compiling a root template", () => {
  setResolveFileSystem(fs);
  compiler.taglib.clearCaches();
  const { code } = compiler.compileSync("<fake-widget/>", "/index.marko", {
    output: "html",
    translator,
    fileSystem: fs as any,
  });
  expect(code).toContain("fake-widget");
});
