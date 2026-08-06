import markoModules from "@marko/compiler/modules";
import { beforeAll, expect, test } from "vitest";

import { FileSystem } from "./fs";
import { setResolveFileSystem } from "./modules-shim";

// Assigned when `modules-shim` is imported, hence non-null here.
const tryResolve = markoModules.tryResolve!;

// The workspace layout: playground files and their `node_modules` both sit at
// the root of the virtual filesystem.
beforeAll(() => {
  setResolveFileSystem(
    new FileSystem({
      "/package.json": JSON.stringify({ dependencies: { "@scope/ui": "1" } }),
      "/index.marko": "",
      "/components/panel.marko": "",
      "/node_modules/iso-date/package.json": JSON.stringify({
        main: "index.js",
      }),
      "/node_modules/iso-date/index.js": "",
      "/node_modules/@scope/ui/package.json": JSON.stringify({
        exports: { ".": "./dist/ui.mjs", "./marko.json": "./marko.json" },
      }),
      "/node_modules/@scope/ui/marko.json": "{}",
      "/node_modules/@scope/ui/dist/ui.mjs": "",
      "/node_modules/@scope/ui/dist/helpers.js": "",
    }),
  );
});

test("resolves a bare specifier from the workspace root", () => {
  expect(tryResolve("iso-date")).toBe("/node_modules/iso-date/index.js");
});

test("resolves a scoped package through its exports map", () => {
  expect(tryResolve("@scope/ui")).toBe("/node_modules/@scope/ui/dist/ui.mjs");
  expect(tryResolve("@scope/ui/marko.json")).toBe(
    "/node_modules/@scope/ui/marko.json",
  );
});

test("resolves a bare specifier from nested directories", () => {
  expect(tryResolve("iso-date", "/components")).toBe(
    "/node_modules/iso-date/index.js",
  );
  expect(tryResolve("iso-date", "/node_modules/@scope/ui/dist")).toBe(
    "/node_modules/iso-date/index.js",
  );
});

test("relative and absolute specifiers are unaffected", () => {
  expect(tryResolve("./components/panel.marko")).toBe(
    "/components/panel.marko",
  );
  expect(tryResolve("./helpers.js", "/node_modules/@scope/ui/dist")).toBe(
    "/node_modules/@scope/ui/dist/helpers.js",
  );
  expect(tryResolve("/index.marko")).toBe("/index.marko");
});

test("a missing package terminates the walk without resolving", () => {
  expect(tryResolve("missing")).toBeUndefined();
  expect(tryResolve("missing", "/components")).toBeUndefined();
});
