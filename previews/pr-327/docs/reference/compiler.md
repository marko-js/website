# Compiler API

`@marko/compiler` compiles `.marko` templates into JavaScript modules. [Bundler integrations](../introduction/integrations.md#bundlers) invoke it automatically; use this API directly when building bundler plugins, test transforms, or custom tooling.

```js
import * as compiler from "@marko/compiler";

const { code, map } = await compiler.compileFile("./src/card.marko", {
  output: "dom",
  sourceMaps: true,
});
```

## Compile Functions

Each compile function provides an async form and a synchronous `*Sync` counterpart with identical arguments.

### `compile(src, filename, options)`

| Parameter  | Details                                                          |
| :--------- | :--------------------------------------------------------------- |
| `src`      | Template source string                                           |
| `filename` | Template path used to resolve tags, relative imports, and its ID |
| `options`  | Optional [options](#options) overriding configured defaults      |

Returns a `Promise` of the [compile result](#compile-result); `compileSync(src, filename, options)` returns it synchronously. `filename` does not need to exist on disk.

```js
import { compileSync } from "@marko/compiler";

const { code } = compileSync(
  "<p>Order #${input.orderId} has shipped</p>",
  "/app/src/tags/shipping-notice.marko",
);
```

### `compileFile(filename, options)`

Reads `filename` via [`fileSystem`](#filesystem) and compiles it. `compileFileSync(filename, options)` is the synchronous form.

## Compile Result

| Property | Details                                                                                                                |
| :------- | :--------------------------------------------------------------------------------------------------------------------- |
| `code`   | Compiled JavaScript, or `null` when [`code`](#code) is `false`                                                         |
| `map`    | Source map when [`sourceMaps`](#sourcemaps) is `true` or `"both"` (and `code` is enabled without `entry`), else `null` |
| `ast`    | Final Babel AST when [`ast`](#ast) is `true`, otherwise `null`                                                         |
| `meta`   | Metadata gathered during compilation                                                                                   |

### Metadata

| Property       | Details                                                                                                     |
| :------------- | :---------------------------------------------------------------------------------------------------------- |
| `id`           | Template ID shared between server and browser outputs                                                       |
| `watchFiles`   | Non-template files affecting output (such as `marko.json`) for bundler file watching                        |
| `analyzedTags` | Optional list of templates whose analysis informed this compile and invalidate it on change                 |
| `diagnostics`  | Errors, warnings, deprecations, and suggestions with `type`, `label`, `loc`, and optional `fix`             |
| `api`          | Component API (`"tags"` or `"class"`), or `undefined` for custom translators without `preferAPI`            |

### Errors

Failed compiles throw a `CompileError` (check `err.name === "CompileError"` or `"CompileErrors"`, as these classes are not exported). Its `message` includes the file location and code frame; integrations formatting their own diagnostics read:

| Property   | Details                                                           |
| :--------- | :---------------------------------------------------------------- |
| `label`    | Error text without location or code frame                         |
| `loc`      | Optional source range (`start`, optional `end` lines and columns) |
| `frame`    | Formatted code frame                                              |
| `filename` | Template path                                                     |

Multiple errors throw a `CompileErrors` object with an `errors` array of `CompileError` instances.

## Configuration

`configure(options)` replaces the default [options](#options) for all subsequent compiles. Per-call options override defaults for that call only. Initial defaults can also be supplied as a JSON string in the `MARKO_CONFIG` environment variable.

```js
import * as compiler from "@marko/compiler";

compiler.configure({ sourceMaps: true, modules: "cjs" });

// Compiled with `sourceMaps: true` and `modules: "esm"`
const result = await compiler.compileFile("./src/receipt.marko", {
  modules: "esm",
});
```

## Require Hook

`@marko/compiler/register` installs a Node.js CommonJS `require` hook for `.marko` files (always compiling with `modules: "cjs"`):

```js
const register = require("@marko/compiler/register");

register({
  output: "html",
  sourceMaps: "inline",
  extensions: [".marko"],
});
```

## Options

### `output`

| Value       | Output                                                               |
| :---------- | :------------------------------------------------------------------- |
| `"html"`    | Server output that renders HTML (default)                            |
| `"dom"`     | Browser output that renders and updates the DOM                      |
| `"migrate"` | Template source after running migrations, without translating        |
| `"source"`  | Parsed template source, useful with [`ast`](#ast)                    |

Compiling the same template with `"html"` and `"dom"` produces its server and browser halves (see [Targeted Compilation](../explanation/targeted-compilation.md)).

### `entry`

Compiles the template as an entry point rather than a plain module. Requires [`linkAssets`](#linkassets).

| Value    | Entry                                                                                                                                    |
| :------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| `"page"` | With `output: "html"`, wraps the page to write its asset tags. With `output: "dom"`, emits the browser entry for that page               |
| `"load"` | With `output: "dom"`, emits the browser entry for a [lazily loaded](./lazy-loading.md) template                                          |

### `linkAssets`

Connects server output to browser asset bundles. Pass the same `linkAssets` configuration to both server and browser compiles, and render pages through their `entry: "page"` module so asset tags flush into the HTML.

| Property  | Details                                                                                                                                |
| :-------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| `onAsset` | `onAsset(kind, file, id)` called for each page (`"page"`) or lazy import (`"load"`) needing a matching `output: "dom"` entry           |
| `runtime` | Absolute or virtual module ID imported by server output; exports `flush($global, type, id)` returning `"block"` or `"defer"` HTML tags |

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

```js
/* asset-runtime.js */
import manifest from "./dist/asset-manifest.json" with { type: "json" };

export function flush($global, type, id) {
  return manifest[id]?.[type] ?? "";
}
```

### `resolveVirtualDependency`

Templates can emit auxiliary virtual modules for `<style>` blocks and browser registration helpers. The compiler calls `resolveVirtualDependency(filename, dep)` for each virtual module and imports the returned specifier:

| Parameter         | Details                                                                          |
| :---------------- | :------------------------------------------------------------------------------- |
| `filename`        | Template that produced the virtual module                                        |
| `dep.virtualPath` | Suggested path (such as `./card.marko.css`)                                      |
| `dep.code`        | Virtual module source                                                            |
| `dep.map`         | Source map when [`sourceMaps`](#sourcemaps) is `true` or `"both"`                |

Preserving `virtualPath`'s extension lets the bundler apply standard CSS/JS handling. Without this option, `<style>` blocks are omitted from output; browser builds with cross-template registered imports require it.

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

Output module format: `"esm"` (default) or `"cjs"`.

### `optimize`

Enables production output: imports the production runtime and shortens internal identifiers. Defaults to `true` when `NODE_ENV` is set to anything other than `"development"`. `MARKO_DEBUG` overrides this, disabling optimization unless set to `false` or `0`.

### `optimizeKnownTemplates`

Ordered list of template paths assigned short sequential IDs when [`optimize`](#optimize) is enabled. Server and browser builds must share the same list.

### `runtimeId`

Isolates multiple Marko runtimes on one page. Must start with a letter or underscore and contain only letters, numbers, and underscores.

### `sourceMaps`

| Value      | Output                                   |
| :--------- | :--------------------------------------- |
| `false`    | No source map (default)                  |
| `true`     | Source map in result `map`               |
| `"inline"` | Source map comment inlined into `code`   |
| `"both"`   | Both `map` and inline comment            |

### `code`

Defaults to `true`. Set to `false` to skip code generation when only `meta` or `ast` is needed.

### `ast`

Defaults to `false`. Set to `true` to include the final Babel AST in the result.

### `stripTypes`

Strips TypeScript syntax from output. Defaults to `true` for every `output` except `"source"` and `"migrate"`.

### `translator`

Translator module ID or object. Defaults to the installed `marko` package's translator (or a `@marko/runtime-*` dependency in `package.json`).

### `fileSystem`

An `fs`-compatible object (`readFileSync`, `statSync`, `readdirSync`, plus `readFile` for `compileFile`, and optional `realpathSync` to resolve symlinked packages such as pnpm stores). Defaults to Node's `fs`.

### `cache`

A `Map` caching analyzed templates across compiles until a template or dependency changes. Compiles sharing a cache must use identical options apart from `output` and `entry` (`"source"` and `"migrate"` bypass the cache). Defaults to a shared process-wide `Map`.

### `babelConfig`

[Babel options](https://babeljs.io/docs/options) merged into the compiler's parse and generate configuration.

### `getTemplateId`

A `(filename) => id` hook overriding the default top-level template ID (percent-encoded root-relative path, or short hash/sequential ID when `optimize` is enabled). Unsafe characters in the returned ID are percent-encoded.

### `errorRecovery`

When `true`, records recoverable errors in `meta.diagnostics` instead of throwing (skipping translation and returning empty `code` when errors occur), useful for editor tooling.

### `applyFixes`

A `Map` selecting which migration fixes apply by diagnostic index and passing each mapped value to its fix. Defaults to applying all fixes.

## Tag Libraries

The `taglib` namespace controls tag discovery:

| Function                                                   | Details                                                                                                                                                     |
| :--------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `register(id, props)`                                      | Registers a tag library. Without `props`, loads a `.json` file path directly or `<id>/marko.json` for a package name                                        |
| `excludeDir(dirname)`                                      | Excludes `dirname` from tag discovery                                                                                                                       |
| `excludePackage(name)`                                     | Excludes package `name` from tag discovery                                                                                                                  |
| `buildLookup(dirname, translator?, onError?, fileSystem?)` | Builds the tag lookup for `dirname` using configured defaults; `onError` handles failed tag libraries without throwing                                      |
| `clearCaches()`                                            | Clears cached tag libraries after editing `marko.json`, `marko-tag.json`, or `package.json` (also clear [`cache`](#cache) to recompile dependent templates) |

## Runtime Information

| Export                                      | Details                                                                              |
| :------------------------------------------ | :----------------------------------------------------------------------------------- |
| `getRuntimeEntryFiles(output, translator?)` | Runtime modules imported by compiled templates for `output`, for bundler prebundling |
| `getRuntimeVersion(translator?)`            | Runtime version targeted by the translator                                           |
| `version`                                   | Installed `@marko/compiler` version                                                  |
