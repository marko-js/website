# Vite Plugin

Marko Run's Vite plugin discovers [route files](./file-based-routing.md), generates the router, and registers [`@marko/vite`](https://github.com/marko-js/vite) to compile `.marko` templates.

Most projects rely on the built-in default config. Add a `vite.config.ts` when passing plugin options or registering additional Vite plugins:

```ts
import { defineConfig } from "vite";
import marko from "@marko/run/vite";

export default defineConfig({
  plugins: [marko()],
});
```

## Options

Marko Run's Vite plugin forwards [`@marko/vite`](https://github.com/marko-js/vite) options (except `isEntry`, which Marko Run manages) alongside the options below.

### `routesDir`

Directory containing [routable files](./file-based-routing.md#routable-files), resolved relative to Vite's `root` (`process.cwd()` by default). Defaults to `src/routes`.

> [!WARNING]
> Keeping the default `src/routes` convention ensures consistency with Marko Run templates, tooling, and examples.

### `adapter`

The [adapter](./adapters.md) used for dev, build, and preview.

By default, Marko Run loads the first dependency in `package.json` starting with `@marko/run-adapter` or containing `marko-run-adapter`, falling back to the built-in Node adapter. Set `adapter` only to pass adapter options, choose among multiple installed adapters, or pass `null` to disable auto-discovery.

### `trailingSlashes`

Controls how the router handles trailing slashes against canonical slashless routes. Defaults to `RedirectWithout`.

| Value             | Description                                                                        |
| :---------------- | :--------------------------------------------------------------------------------- |
| `RedirectWithout` | Redirect requests with a trailing slash to the path without it (default)           |
| `RedirectWith`    | Redirect requests without a trailing slash to the path with it                     |
| `RewriteWithout`  | Serve paths with a trailing slash as if it were absent, without redirecting        |
| `RewriteWith`     | Serve paths without a trailing slash as if it were present, without redirecting    |
| `Ignore`          | Match both with and without a trailing slash without redirecting or rewriting URLs |

> [!TIP]
> Redirect modes ensure every page resolves to a single canonical URL for search engines.

## Next Steps

- [Adapters](./adapters.md)
- [File-based Routing](./file-based-routing.md)
- [TypeScript](./typescript.md#generated-types)
