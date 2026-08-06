import { expect, test } from "vitest";
import * as compiler from "@marko/compiler";
import * as translator from "marko/translator";
import markoModules from "@marko/compiler/modules";

import { FileSystem } from "./fs";
import { setResolveFileSystem } from "./modules-shim";

test("resolves installed packages from the root-mounted filesystem", () => {
  const fs = new FileSystem({
    "/marko.json": `{ "tags-dir": "." }`,
    "/package.json": `{ "dependencies": { "fake-widgets": "1" } }`,
    "/node_modules/fake-widgets/package.json": `{ "name": "fake-widgets" }`,
    "/node_modules/fake-widgets/marko.json": `{ "tags-dir": "./tags" }`,
    "/node_modules/fake-widgets/tags/fake-widget/index.marko": "<span/>",
  });
  setResolveFileSystem(fs);
  compiler.taglib.clearCaches();

  const markoJson = "/node_modules/fake-widgets/marko.json";
  expect(markoModules.tryResolve!("fake-widgets/marko.json", "/")).toBe(
    markoJson,
  );
  expect(markoModules.tryResolve!("fake-widgets/marko.json", "/a/b")).toBe(
    markoJson,
  );
  expect(
    compiler.compileSync("<fake-widget/>", "/index.marko", {
      output: "html",
      translator,
      fileSystem: fs as any,
    }).code,
  ).toContain("fake-widget");
});
