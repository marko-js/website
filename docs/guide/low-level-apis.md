# Low-Level APIs

Marko's compiler exposes programmatic compilation and tag-library hooks for tooling, bundler plugins, and custom syntax extensions. Standard application code should rely on [core tags](../reference/core-tag.md) and [custom tags](../reference/custom-tag.md) directly.

## Compiler API

Use [`@marko/compiler`](../reference/compiler.md) to compile `.marko` templates programmatically into server HTML modules, browser DOM modules, or Babel ASTs, and to wire virtual dependencies and asset manifests into custom build tools.

## Taglib Hooks

A tag library's `marko.json` can register Babel-based `migrators` (run when `output: "migrate"` or before translation) and `translators` (run during HTML/DOM code generation) for custom tags. Register custom libraries programmatically via `compiler.taglib.register` (see [Tag Libraries](../reference/compiler.md#tag-libraries)) or ship a `marko.json` at a package root.
