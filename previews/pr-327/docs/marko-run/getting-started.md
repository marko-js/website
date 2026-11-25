# Getting Started

Marko Run ([`@marko/run`](https://github.com/marko-js/run)) is the official application framework for Marko. It turns a directory of templates into a web application with [file-based routing](./file-based-routing.md), nested layouts, middleware, streaming SSR, and platform [adapters](./adapters.md).

Powered by [Vite](https://vite.dev/), Marko Run ships with a default Vite config and Node adapter so a single `src/routes/+page.marko` file is enough to start serving requests.

## Using a Template

Scaffold a new project with `npm init marko`:

```sh
npm init marko -- -t basic -n my-app
cd my-app
npm run dev
```

Available starter templates (from [`marko-js/examples`](https://github.com/marko-js/examples/tree/main/examples)): `basic` (Marko Run starter), `app` (full Marko Run app with styling and tests), `library` (component library), and `vite-express` (custom Express + `@marko/vite`). Non-interactive environments accept defaults automatically; pass `-t <template>`, `-n` / `--name <dir>`, `-y` / `--yes`, `--no-install`, or `--no-git` to configure scaffolding directly.

## Manual Setup

Marko Run requires only `@marko/run` alongside `marko`:

1. Install the package:

   ```sh
   npm install @marko/run
   ```

2. Create `src/routes/+page.marko`:

   ```marko
   <h1>Hello Marko Run</h1>
   ```

3. Start the development server with the [CLI](./cli.md):

   ```sh
   npm exec marko-run
   ```

The server listens at `http://localhost:3000`.

> [!NOTE]
> Installed [adapters](./adapters.md) are discovered automatically by package name. Add a `vite.config.ts` only when customizing plugin options or registering additional Vite plugins (see [Vite Plugin](./vite-plugin.md)).

## Next Steps

- [File-based Routing](./file-based-routing.md)
- [TypeScript](./typescript.md)
- [Adapters](./adapters.md)
