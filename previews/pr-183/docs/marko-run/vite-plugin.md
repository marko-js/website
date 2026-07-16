# Vite Plugin

Marko Run's Vite plugin discovers the application's [route files](./file-based-routing.md), generates the routing code, and registers the [`@marko/vite`](https://github.com/marko-js/vite) plugin to compile `.marko` files.

Marko Run prefers convention over configuration. It ships with a default Vite config, routes live in `src/routes`, and [adapters](#adapter) are discovered automatically, so most applications never need a `vite.config` file at all. When one is needed, register the plugin and pass options there:

```ts
import { defineConfig } from "vite";
import marko from "@marko/run/vite"; // Import the Vite plugin

export default defineConfig({
  plugins: [marko()], // Register the Vite plugin
});
```

## Options

Along with the options below, Marko Run's Vite plugin accepts all options of the underlying [`@marko/vite`](https://github.com/marko-js/vite) plugin.

### `routesDir`

The directory containing the [routable files](./file-based-routing.md#routable-files), relative to the Vite config file. Defaults to `src/routes`.

> [!WARNING]
> Changing the routes directory is discouraged. The default is a convention shared across Marko Run projects, templates, and examples, so keeping it makes any project immediately familiar.

### `adapter`

The [adapter](./adapters.md) used to develop, build, and deploy the application.

Adapters are discovered automatically by package name. The first dependency in `package.json` whose name starts with `@marko/run-adapter` or contains `marko-run-adapter` is used, and the default Node-based adapter applies when none is found. Installing an adapter package is therefore all most applications need. Set this option only to configure an adapter or choose between several installed ones, or pass `null` to opt out of adapter discovery.

### `trailingSlashes`

How the router treats trailing slashes in request paths. Marko Run routes are canonically defined without trailing slashes, and requests are matched against one of the following behaviors. Defaults to RedirectWithout.

| Value             | Description                                                                     |
| ----------------- | ------------------------------------------------------------------------------- |
| `RedirectWithout` | Redirect requests with a trailing slash to the path without it (default)        |
| `RedirectWith`    | Redirect requests without a trailing slash to the path with it                  |
| `RewriteWithout`  | Serve paths with a trailing slash as if it were absent, without redirecting     |
| `RewriteWith`     | Serve paths without a trailing slash as if it were present, without redirecting |
| `Ignore`          | Match paths exactly as requested                                                |

> [!TIP]
> The redirect options are recommended for public sites since they ensure each page is served from a single canonical URL, which search engines treat as one page.

## Next Steps

- [Adapters](./adapters.md)
- [File-based Routing](./file-based-routing.md)
- [TypeScript](./typescript.md#generated-types)
