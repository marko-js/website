# Vite Plugin

Marko Run's Vite plugin discovers the application's [route files](./file-based-routing.md), generates the routing code, and registers the [`@marko/vite`](https://github.com/marko-js/vite) plugin to compile `.marko` files.

Since Marko Run ships with a default Vite config, a config file is only needed when customizing behavior:

```ts
import { defineConfig } from "vite";
import marko from "@marko/run/vite"; // Import the Vite plugin

export default defineConfig({
  plugins: [marko()], // Register the Vite plugin
});
```

## Options

Marko Run's Vite plugin accepts the following options, along with all options of the underlying `@marko/vite` plugin:

| Option            | Type       | Default           | Description                                                                                                                   |
| ----------------- | ---------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `routesDir`       | `string`   | `src/routes`      | Directory containing the [routable files](./file-based-routing.md#routable-files), relative to the Vite config                |
| `adapter`         | `Adapter`  | discovered        | The [adapter](./adapters.md) used to develop, build, and deploy the application. Pass `null` to opt out of adapter discovery. |
| `trailingSlashes` | `string`   | `RedirectWithout` | How the router treats trailing slashes in request paths (see [below](#trailing-slashes))                                      |
| `emitRoutes`      | `function` |                   | Callback that receives the discovered routes whenever they are built, and may return a promise                                |

## Trailing Slashes

Marko Run routes are canonically defined without trailing slashes. The `trailingSlashes` option controls how requests that end with one are treated:

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
