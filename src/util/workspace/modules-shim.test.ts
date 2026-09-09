import { describe, expect, it } from "vitest";
import * as compiler from "@marko/compiler";
import * as translator from "marko/translator";
import markoModules from "@marko/compiler/modules";

import { FileSystem } from "./fs";
import { setResolveFileSystem } from "./modules-shim";

// A workspace with a component library installed under `node_modules`, the
// shape `fetchNodeModules` produces for a package.json dependency that ships
// a `marko.json`.
function libraryWorkspace() {
  return new FileSystem({
    "/marko.json": JSON.stringify({ "tags-dir": "." }),
    "/package.json": JSON.stringify({ dependencies: { "ui-lib": "1.0.0" } }),
    "/index.marko": "<ui-badge/>",
    "/node_modules/ui-lib/package.json": JSON.stringify({
      name: "ui-lib",
      version: "1.0.0",
      peerDependencies: { marko: "^6" },
    }),
    "/node_modules/ui-lib/marko.json": JSON.stringify({
      "taglib-id": "ui-lib",
      "tags-dir": "./tags",
    }),
    "/node_modules/ui-lib/tags/ui-badge/index.marko": "<span>badge</span>",
  });
}

describe("modules-shim", () => {
  // Resolving a bare specifier from the workspace root makes `resolveSync`
  // probe `//node_modules/...`; the shim has to collapse that double slash
  // for the virtual file map or installed taglibs are never discovered.
  it("resolves package files from the workspace root", () => {
    setResolveFileSystem(libraryWorkspace());
    expect(markoModules.tryResolve!("ui-lib/marko.json", "/")).toBe(
      "/node_modules/ui-lib/marko.json",
    );
  });

  it("discovers tags from an installed component library", () => {
    const fs = libraryWorkspace();
    setResolveFileSystem(fs);
    compiler.taglib.clearCaches();
    const { code } = compiler.compileSync(
      fs.files["/index.marko"],
      "/index.marko",
      {
        output: "html",
        translator,
        stripTypes: true,
        fileSystem: fs as any,
      },
    );
    expect(code).toContain("badge");
  });
});

describe("modules-shim deep importers", () => {
  // A module inside one installed package importing from another installed
  // package: the node_modules walk has to reach the workspace root's
  // `/node_modules` even though the importer is nested several directories
  // deep (this is how a component library's `style.js` pulls in its peer
  // dependency's CSS).
  it("resolves a peer package from inside node_modules", () => {
    const fs = libraryWorkspace();
    fs.files["/node_modules/ui-lib/tags/ui-badge/style.js"] =
      'import "theme/badge";';
    fs.files["/node_modules/theme/package.json"] = JSON.stringify({
      name: "theme",
      version: "1.0.0",
      main: "./index.js",
    });
    fs.files["/node_modules/theme/badge.css"] = ".badge{}";
    setResolveFileSystem(fs);
    expect(
      markoModules.tryResolve!(
        "theme/badge.css",
        "/node_modules/ui-lib/tags/ui-badge",
      ),
    ).toBe("/node_modules/theme/badge.css");
  });
});
