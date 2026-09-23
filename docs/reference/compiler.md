# Compiler API

The `@marko/compiler` package compiles `.marko` templates into JavaScript modules. The [bundler integrations](../introduction/integrations.md#bundlers) call it for every template, so applications rarely use it directly. It is the API for building a bundler integration, a test transform, or other tooling around Marko templates.

```js
import * as compiler from "@marko/compiler";

const { code, map } = await compiler.compileFile("./src/card.marko", {
  output: "dom",
  sourceMaps: true,
});
```

## Compile Functions

Each compile function has an asynchronous form and a synchronous `*Sync` form with the same arguments.

### `compile(src, filename, options)`

| Parameter  | Details                                                        |
| :--------- | :------------------------------------------------------------- |
| `src`      | The template source as a string                                |
| `filename` | The template's path, used to resolve tags, imports and its id  |
| `options`  | Optional [options](#options) that override the configured ones |

Returns a `Promise` of the [compile result](#compile-result). `compileSync(src, filename, options)` returns the result directly.

The `filename` does not need to exist on disk, which suits sources a bundler holds in memory. Tag discovery and relative imports resolve from its directory.

```js
import { compileSync } from "@marko/compiler";

const { code } = compileSync(
  "<p>Order #${input.orderId} has shipped</p>",
  "/app/src/tags/shipping-notice.marko",
);
```

### `compileFile(filename, options)`

Reads `filename` through the [`fileSystem`](#filesystem) option, then compiles it as `compile` does. `compileFileSync(filename, options)` is the synchronous form.

## Compile Result

| Property | Details                                                                                 |
| :------- | :-------------------------------------------------------------------------------------- |
| `code`   | The compiled JavaScript, or `null` when [`code`](#code) is `false`                      |
| `map`    | The source map when [`sourceMaps`](#sourcemaps) is `true` or `"both"`, otherwise `null` |
| `ast`    | The final Babel AST when [`ast`](#ast) is `true`, otherwise `null`                      |
| `meta`   | Metadata gathered while compiling the template                                          |

### Metadata

| Property       | Details                                                                                                    |
| :------------- | :--------------------------------------------------------------------------------------------------------- |
| `id`           | The template's id, shared by its server and browser output                                                 |
| `watchFiles`   | Files other than the template that affected the output, such as `marko.json` files, for a bundler to watch |
| `analyzedTags` | Templates whose analysis this template used, which invalidate it when they change                          |
| `diagnostics`  | Errors, warnings, deprecations and suggestions, each with a `type`, a `label` and a source `loc`           |
| `api`          | The component API the template uses, `"tags"` or `"class"`                                                 |

### Errors

A template that fails to compile throws a `CompileError`. Its `message` carries the file position and a code frame, so logging the error shows where it occurred. Integrations that print errors in their own format read its other properties.

| Property   | Details                                                    |
| :--------- | :--------------------------------------------------------- |
| `label`    | The error text without position or code frame              |
| `loc`      | The source range, with `start` and `end` lines and columns |
| `frame`    | The code frame                                             |
| `filename` | The template the error belongs to                          |

When a template has several errors, a single `CompileErrors` is thrown with the individual `CompileError`s in its `errors` array.

## Configuration

`configure(options)` sets the default [options](#options) for every later compile. Each call replaces the defaults from the previous one. Options passed to a compile function override the configured defaults for that call only.

```js
import * as compiler from "@marko/compiler";

compiler.configure({ sourceMaps: true, modules: "cjs" });

// Compiled with `sourceMaps: true` and `modules: "esm"`.
const result = await compiler.compileFile("./src/receipt.marko", {
  modules: "esm",
});
```

The `MARKO_CONFIG` environment variable, when set to a JSON object, provides the initial defaults.

## Options

### `output`

| Value       | Output                                                               |
| :---------- | :------------------------------------------------------------------- |
| `"html"`    | Server output that renders HTML (the default)                        |
| `"dom"`     | Browser output that renders and updates the DOM                      |
| `"migrate"` | The template source after running migrations, without translating it |
| `"source"`  | The template source as parsed, useful with [`ast`](#ast)             |

A template compiled once with `"html"` and once with `"dom"` produces the server and browser halves of the same component. See [targeted compilation](../explanation/targeted-compilation.md).

### `entry`

Compiles the template as an entry point instead of a plain module. Requires [`linkAssets`](#linkassets).

| Value    | Entry                                                                                                                                        |
| :------- | :------------------------------------------------------------------------------------------------------------------------------------------- |
| `"page"` | With `output: "html"`, the server entry that renders a page and writes its asset tags. With `output: "dom"`, the browser entry for that page |
| `"load"` | With `output: "dom"`, the browser entry for a template imported [lazily](./lazy-loading.md)                                                  |

### `linkAssets`

Connects the server output to the browser assets a bundler builds. It belongs on every compile, server and browser alike.

| Property  | Details                                                                                                                                                                                                                                                                                                                              |
| :-------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onAsset` | Called as `onAsset(kind, file, id)` when a server compile finds a page entry (`kind` is `"page"`) or a lazily imported template (`"load"`). Asset `id` needs a browser entry, built by compiling `file` with `output: "dom"` and `entry: kind`                                                                                       |
| `runtime` | The module that server output imports to write asset tags. Every template imports it by this id, so it is usually absolute or virtual. It exports `flush($global, type, id)`, which returns the HTML tags for asset `id`: the render-blocking ones, such as stylesheets, when `type` is `"block"`, and the rest when it is `"defer"` |

The server build compiles each page with `entry: "page"`, which reports the page, and each template it bundles with `output: "html"`, which reports the templates they load lazily. Each reported asset then gets a browser entry.

```js
/* build.js */
import path from "node:path";
import { compileFile } from "@marko/compiler";

const assets = new Map();
const options = {
  linkAssets: {
    runtime: path.resolve("asset-runtime.js"),
    onAsset(kind, file, id) {
      assets.set(id, { kind, file });
    },
  },
};

const page = "./src/pages/checkout.marko";
const entry = await compileFile(page, {
  ...options,
  output: "html",
  entry: "page",
});
const template = await compileFile(page, { ...options, output: "html" });

for (const [id, { kind, file }] of assets) {
  const browser = await compileFile(file, {
    ...options,
    output: "dom",
    entry: kind,
  });
  // Bundle `browser.code`, then record the tags that load it under `id`.
}
```

The runtime module reads the tags the build recorded.

```js
/* asset-runtime.js */
import manifest from "./dist/asset-manifest.json" with { type: "json" };

export function flush($global, type, id) {
  return manifest[id]?.[type] ?? "";
}
```

### `resolveVirtualDependency`

A template can produce more than one module. Each `<style>` block becomes its own stylesheet, and some generated modules register values for the browser. The compiler calls `resolveVirtualDependency(filename, dep)` for each one and imports the path it returns.

| Parameter         | Details                                                |
| :---------------- | :----------------------------------------------------- |
| `filename`        | The template that produced the module                  |
| `dep.virtualPath` | A suggested path, such as `./card.marko.css`           |
| `dep.code`        | The module's contents                                  |
| `dep.map`         | Its source map, when [`sourceMaps`](#sourcemaps) is on |

The bundler serves the returned path with `dep.code`. A path that keeps the extension of `virtualPath` gets the bundler's usual handling for stylesheets and scripts. Without this option, `<style>` block contents are left out of the output.

```js
import path from "node:path";

const virtualModules = new Map();

function resolveVirtualDependency(filename, { virtualPath, code, map }) {
  const id = path.join(path.dirname(filename), "__virtual__", virtualPath);
  virtualModules.set(id, { code, map });
  return id;
}
```

### `modules`

The module format of the output, `"esm"` (the default) or `"cjs"`.

### `optimize`

Compiles for production: templates import the production runtime instead of its debug build and use shorter internal names. By default it is on when `NODE_ENV` is set to anything other than `"development"`. A `MARKO_DEBUG` environment variable overrides that, turning it off unless set to `false` or `0`.

### `optimizeKnownTemplates`

A list of template paths that receive short, sequential ids when [`optimize`](#optimize) is on. Server and browser compiles must use the same list.

### `runtimeId`

Distinguishes the Marko runtimes on a page that loads more than one of them. It must start with a letter or underscore and contain only letters, numbers and underscores.

### `sourceMaps`

| Value      | Output                                   |
| :--------- | :--------------------------------------- |
| `false`    | No source map (the default)              |
| `true`     | A source map in the result's `map`       |
| `"inline"` | A source map comment inlined into `code` |
| `"both"`   | Both of the above                        |

### `code`

When `false`, skips generating `code`, which saves time when only `meta` or `ast` is needed. Defaults to `true`.

### `ast`

When `true`, includes the final Babel AST in the result. Defaults to `false`.

### `stripTypes`

Removes TypeScript types from the output. When unset, types are removed for every `output` except `"source"` and `"migrate"`.

### `translator`

The translator that turns templates into JavaScript, as a module id or a translator object. By default it is the translator of the installed `marko` package, or of a `@marko/runtime-*` package listed in the application's `package.json`.

### `fileSystem`

An `fs`-compatible object the compiler reads through, providing `readFileSync`, `statSync` and `readdirSync` (and `readFile` for `compileFile`). Defaults to Node's `fs`, and lets a bundler share its own cached file system.

### `cache`

A `Map` that holds compiled templates, so a template used by several others is analyzed once. Entries are reused until the template or a file it depends on changes. Since each template's analysis is reused between them, compiles that share a cache are expected to use the same options apart from `output`. By default every compile shares one `Map`.

### `babelConfig`

[Babel options](https://babeljs.io/docs/options) merged into the configuration the compiler uses to parse and generate code.

### `getTemplateId`

A function `(filename) => id` that replaces the default template id, the template's percent-encoded path relative to the project root.

### `errorRecovery`

When `true`, recoverable errors are recorded in the result's `meta.diagnostics` instead of being thrown, so tools such as editors can report every problem in a template.

### `applyFixes`

Selects which migration fixes run. When set, only diagnostics whose index is a key of this `Map` apply their fix, receiving the mapped value. By default every fix applies.

## Tag Libraries

The `taglib` namespace controls how the compiler discovers tags.

| Function               | Details                                                                                      |
| :--------------------- | :------------------------------------------------------------------------------------------- |
| `register(id, props)`  | Registers a tag library. Without `props`, loads the `marko.json` at the path or package `id` |
| `excludeDir(dirname)`  | Stops tag discovery from searching `dirname`                                                 |
| `excludePackage(name)` | Stops tag discovery from loading tags from the package `name`                                |
| `buildLookup(dirname)` | Returns the tags available to templates in `dirname`                                         |
| `clearCaches()`        | Clears cached tag libraries, so changed `marko.json` files are read again                    |

## Runtime Information

| Export                         | Details                                                                                |
| :----------------------------- | :------------------------------------------------------------------------------------- |
| `getRuntimeEntryFiles(output)` | The runtime modules templates compiled for `output` import, for a bundler to prebundle |
| `getRuntimeVersion()`          | The version of the runtime the translator targets                                      |
| `version`                      | The version of `@marko/compiler`                                                       |
