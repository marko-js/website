# Adapters

Adapters tailor Marko Run's dev server, build output, and preview process to a target runtime or deployment platform. Application routes stay written in [Web standard APIs](./runtime.md#context), so swapping the adapter moves the same app across Node.js, Cloudflare Workers, Vercel, Netlify, or static files.

## Choosing an Adapter

[Marko Run's Vite plugin](./vite-plugin.md) resolves the adapter in this order:

1. An `adapter` passed explicitly in plugin options
2. The first dependency in `package.json` starting with `@marko/run-adapter` or containing `marko-run-adapter`
3. The built-in Node adapter shipped with `@marko/run`

In most projects, installing the adapter package is enough. Pass it explicitly in `vite.config.ts` only to configure options or choose among multiple installed adapters:

```ts
import { defineConfig } from "vite";
import marko from "@marko/run/vite";
import staticAdapter from "@marko/run-adapter-static";

export default defineConfig({
  plugins: [marko({ adapter: staticAdapter() })],
});
```

## Node

[`@marko/run-adapter-node`](https://github.com/marko-js/run/tree/main/packages/adapters/node) deploys Marko Run apps on Node.js and provides Connect/Express-compatible middleware for embedding inside an existing server:

```sh
npm install @marko/run-adapter-node
```

`routerMiddleware(options?)` handles matching routes end to end (`options` accepts `origin`, `trustProxy`, and `createPlatform`):

```ts
import express from "express";
import { routerMiddleware } from "@marko/run-adapter-node/middleware";

express()
  .use("/assets", express.static("assets"))
  .use(routerMiddleware())
  .listen(8080);
```

To inspect matched route metadata before invoking the route, pair `matchMiddleware()` with `invokeMiddleware(options?)`:

```ts
import express from "express";
import {
  matchMiddleware,
  invokeMiddleware,
} from "@marko/run-adapter-node/middleware";

express()
  .use("/assets", express.static("assets"))
  .use(matchMiddleware())
  .use((req, res, next) => {
    if (req.route) {
      // `req.route.config` holds the matched route's metadata
    }
    next();
  })
  .use(invokeMiddleware())
  .listen(8080);
```

## Static

[`@marko/run-adapter-static`](https://github.com/marko-js/run/tree/main/packages/adapters/static) pre-renders routes to static HTML files for any file server or CDN:

```sh
npm install @marko/run-adapter-static
```

During build, the adapter renders every static route and crawls same-origin `<a>` (excluding `download` and `nofollow`/`enclosure`/`external`), qualifying `<link>`, and `<iframe>` references. Use `urls` (an array or async function receiving discovered routes) to add extra entry points:

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

Each crawled route writes HTML files matching [`trailingSlashes`](./vite-plugin.md#trailingslashes) (default `RedirectWithout`). For `/about`:

| Value             | Without trailing slash                                    | With trailing slash                                                          |
| :---------------- | :-------------------------------------------------------- | :--------------------------------------------------------------------------- |
| `RedirectWithout` | `about.html`                                              | `about/index.html` (redirecting to `/about` when linked as `/about/`)        |
| `RedirectWith`    | `about.html` (redirecting to `/about/`)                   | `about/index.html`                                                           |
| `RewriteWithout`  | `about.html`                                              | `about.html` (when the host serves it for `/about/`)                         |
| `RewriteWith`     | `about/index.html` (when the host serves it for `/about`) | `about/index.html`                                                           |

Hosts that only resolve directory index files (`about/index.html`) pair best with `RedirectWith` or `RewriteWith`.

## Cloudflare

[`@marko/run-adapter-cloudflare`](https://github.com/marko-js/run/tree/main/packages/adapters/cloudflare) runs routes inside Cloudflare Workers (`workerd` during dev via `@cloudflare/vite-plugin`) and builds a Worker bundle ready for `wrangler deploy`:

```sh
npm install @marko/run-adapter-cloudflare
npm install -D wrangler
```

The adapter defaults `compatibility_date`, `nodejs_compat`, and an `ASSETS` binding automatically when no `wrangler.jsonc` / `wrangler.toml` overrides them, and types `ctx.platform` as `CloudflarePlatformInfo`. Local `marko-run preview` uses `wrangler dev` against the built Worker output.

## Vercel

[`@marko/run-adapter-vercel`](https://github.com/marko-js/run/tree/main/packages/adapters/vercel) emits a Vercel [Build Output API v3](https://vercel.com/docs/build-output-api/v3) bundle under `.vercel/output` with streaming Node.js Functions and types `ctx.platform` as `VercelPlatformInfo`:

```sh
npm install @marko/run-adapter-vercel
```

Optional function settings (`runtime`, `regions`, `memory`, `maxDuration`) can be passed to the adapter in `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import marko from "@marko/run/vite";
import vercel from "@marko/run-adapter-vercel";

export default defineConfig({
  plugins: [
    marko({
      adapter: vercel({ regions: ["iad1"], maxDuration: 30 }),
    }),
  ],
});
```

## Netlify

[`@marko/run-adapter-netlify`](https://github.com/marko-js/run/tree/main/packages/adapters/netlify) deploys to Netlify Functions or Edge Functions (`marko-run preview` requires `netlify-cli`):

```sh
npm install @marko/run-adapter-netlify
```

Configure `netlify.toml` for Netlify Functions:

```toml
[build]
  command = "marko-run build"
  publish = "dist/public"
  functions = "dist"
```

For [Edge Functions](https://docs.netlify.com/edge-functions/overview/), pass `edge: true` in `vite.config.ts` and set `edge_functions` in `netlify.toml`:

```ts
/* vite.config.ts */
import { defineConfig } from "vite";
import marko from "@marko/run/vite";
import netlify from "@marko/run-adapter-netlify";

export default defineConfig({
  plugins: [marko({ adapter: netlify({ edge: true }) })],
});
```

```toml
/* netlify.toml */
[build]
  command = "marko-run build"
  publish = "dist/public"
  edge_functions = "dist"
```

## Custom Adapters

An adapter implements the `Adapter` interface from `@marko/run/vite` with hooks for dev, build, and preview. See the [official adapters](https://github.com/marko-js/run/tree/main/packages/adapters) as reference implementations.

## Next Steps

- [Vite Plugin](./vite-plugin.md)
- [Runtime](./runtime.md#embedding)
- [CLI](./cli.md)
