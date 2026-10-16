import { describe, expect, it } from "vitest";
import * as compiler from "@marko/compiler";
import * as translator from "marko/translator";
import markoModules from "@marko/compiler/modules";

import { FileSystem, rootDir } from "./fs";
import { setResolveFileSystem } from "./modules-shim";

function libraryWorkspace() {
  return new FileSystem({
    [`${rootDir}marko.json`]: JSON.stringify({ "tags-dir": "." }),
    [`${rootDir}package.json`]: JSON.stringify({
      dependencies: { "ui-lib": "1.0.0" },
    }),
    [`${rootDir}index.marko`]: "<ui-badge/>",
    [`${rootDir}node_modules/ui-lib/package.json`]: JSON.stringify({
      name: "ui-lib",
      version: "1.0.0",
      peerDependencies: { marko: "^6" },
    }),
    [`${rootDir}node_modules/ui-lib/marko.json`]: JSON.stringify({
      "taglib-id": "ui-lib",
      "tags-dir": "./tags",
    }),
    [`${rootDir}node_modules/ui-lib/tags/ui-badge/index.marko`]:
      "<span>badge</span>",
  });
}

describe("modules-shim", () => {
  it("resolves package files from the workspace directory", () => {
    setResolveFileSystem(libraryWorkspace());
    expect(markoModules.tryResolve!("ui-lib/marko.json", rootDir)).toBe(
      `${rootDir}node_modules/ui-lib/marko.json`,
    );
  });

  it("discovers tags from an installed component library", () => {
    const fs = libraryWorkspace();
    setResolveFileSystem(fs);
    compiler.taglib.clearCaches();
    const { code } = compiler.compileSync(
      fs.files[`${rootDir}index.marko`],
      `${rootDir}index.marko`,
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
  it("resolves a peer package from inside node_modules", () => {
    const fs = libraryWorkspace();
    fs.files[`${rootDir}node_modules/ui-lib/tags/ui-badge/style.js`] =
      'import "theme/badge";';
    fs.files[`${rootDir}node_modules/theme/package.json`] = JSON.stringify({
      name: "theme",
      version: "1.0.0",
      main: "./index.js",
    });
    fs.files[`${rootDir}node_modules/theme/badge.css`] = ".badge{}";
    setResolveFileSystem(fs);
    expect(
      markoModules.tryResolve!(
        "theme/badge.css",
        `${rootDir}node_modules/ui-lib/tags/ui-badge`,
      ),
    ).toBe(`${rootDir}node_modules/theme/badge.css`);
  });
});
