# Adapters

Adapters change the development, build, and preview process to fit different deployment platforms and runtimes. Application code stays written in [web standard APIs](./runtime.md#context). By swapping the adapter, the same routes can be served by a Node process, deployed to an edge platform, or rendered to static files.

## Choosing an Adapter

[Marko Run's Vite plugin](./vite-plugin.md) resolves the adapter in this order:

1. The `adapter` specified in the plugin options
2. The first dependency in `package.json` whose name starts with `@marko/run-adapter` or contains `marko-run-adapter`
3. The default Node-based adapter that ships with `@marko/run`

For most applications, installing an adapter package is all that is needed. To configure an adapter (or choose between several installed ones), pass it to the plugin explicitly:

```ts
import { defineConfig } from "vite";
import marko from "@marko/run/vite";
import netlify from "@marko/run-adapter-netlify"; // Import the adapter

export default defineConfig({
  plugins: [
    marko({
      adapter: netlify({ edge: true }), // Configure and apply the adapter
    }),
  ],
});
```

## Node

[`@marko/run-adapter-node`](https://github.com/marko-js/run/tree/main/packages/adapters/node) previews and deploys apps on Connect-style servers such as Express.

```sh
npm install @marko/run-adapter-node
```

Beyond building a standalone server, this adapter provides middleware that converts Connect-style requests into [WHATWG requests](https://developer.mozilla.org/en-US/docs/Web/API/Request) and writes [WHATWG responses](https://developer.mozilla.org/en-US/docs/Web/API/Response) back. This lets an application mount its Marko Run routes inside an existing server.

The **router middleware** fully handles requests that match a route:

```ts
import express from "express";
import { routerMiddleware } from "@marko/run-adapter-node/middleware";

express()
  .use("/assets", express.static("assets"))
  .use(routerMiddleware()) // register the router middleware
  .listen(8080);
```

The **match middleware** instead attaches the matched route onto the request object, where it can be invoked later. This is useful when other middleware needs to run between finding a match and invoking the route:

```ts
import express from "express";
import { matchMiddleware } from "@marko/run-adapter-node/middleware";

express()
  .use("/assets", express.static("assets"))
  .use(matchMiddleware()) // register the match middleware
  .use((req, res, next) => {
    if (req.route) {
      // `req.route.config` contains the route's metadata
    }
    next();
  })
  .use((req, res, next) => {
    if (req.route) {
      req.route.invoke(req, res, next); // finally invoke the route
    } else {
      next();
    }
  })
  .listen(8080);
```

## Static

[`@marko/run-adapter-static`](https://github.com/marko-js/run/tree/main/packages/adapters/static) builds the application into static files that can be served from any file server or CDN.

```sh
npm install @marko/run-adapter-static
```

At build time, the adapter renders every statically known route and crawls relative anchor links in the rendered pages to discover more. The `urls` option provides additional entry points beyond those discovered automatically:

```ts
import { defineConfig } from "vite";
import marko from "@marko/run/vite";
import staticAdapter from "@marko/run-adapter-static";

export default defineConfig({
  plugins: [
    marko({
      adapter: staticAdapter({
        urls: ["/products/lamp", "/products/chair"],
      }),
    }),
  ],
});
```

> [!NOTE]
> The `urls` option can also be an async function that receives the discovered routes and returns URL strings.

## Netlify

[`@marko/run-adapter-netlify`](https://github.com/marko-js/run/tree/main/packages/adapters/netlify) deploys apps to Netlify Functions or Edge Functions.

```sh
npm install @marko/run-adapter-netlify
```

Netlify applications require a [`netlify.toml`](https://docs.netlify.com/configure-builds/file-based-configuration/) configuration. This example is a starting point for apps deployed to Netlify Functions:

```toml
[build]
  command = "marko-run build"
  publish = "dist/public"
  functions = "dist"
```

To build for [Edge Functions](https://docs.netlify.com/edge-functions/overview/) instead, configure the adapter with `edge: true`:

```ts
import { defineConfig } from "vite";
import marko from "@marko/run/vite";
import netlifyAdapter from "@marko/run-adapter-netlify";

export default defineConfig({
  plugins: [
    marko({
      adapter: netlifyAdapter({ edge: true }),
    }),
  ],
});
```

and specify the `edge_functions` directory in `netlify.toml` instead of `functions`:

```toml
[build]
  command = "marko-run build"
  publish = "dist/public"
  edge_functions = "dist"
```

## Custom Adapters

An adapter is an object implementing the `Adapter` interface from `@marko/run/vite`, with hooks into the dev server, build, and preview lifecycle. The [official adapters](https://github.com/marko-js/run/tree/main/packages/adapters) serve as reference implementations.

## Next Steps

- [Vite Plugin](./vite-plugin.md) shows where the adapter is configured
- [Runtime](./runtime.md#embedding) covers embedding the router directly when no adapter fits
- [Getting Started](./getting-started.md#cli) documents the CLI commands adapters hook into
