// Injects the browser-side defaults the language tools would otherwise resolve
// from a project's `node_modules`: the Marko compiler, its translator, and the
// type-definition file paths. On Node these come from disk; in a worker there is
// nothing to resolve, so they are supplied up front.
import "./globals";

import * as defaultCompiler from "@marko/compiler";
import defaultConfig from "@marko/compiler/config";
import { Project } from "@marko/language-tools";
import * as defaultTranslator from "marko/translator";

// Where the seeded Marko type-definition files live on the virtual disk. The
// asset bundler writes the file contents at exactly these paths (see
// `virtual:marko-lsp-assets` in `assets-plugin.ts`).
export const MARKO_INTERNAL_TYPES =
  "/node_modules/@marko/language-tools/marko.internal.d.ts";
export const MARKO_RUNTIME_TYPES = "/node_modules/marko/index.d.ts";

Project.setDefaultTypePaths({
  internalTypesFile: MARKO_INTERNAL_TYPES,
  markoTypesFile: MARKO_RUNTIME_TYPES,
});

Project.setDefaultCompilerMeta(defaultCompiler, {
  ...defaultConfig,
  translator: defaultTranslator,
});
