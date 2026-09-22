# Getting Started

Marko Run ([`@marko/run`](https://github.com/marko-js/run)) is the application framework for Marko. It turns a directory of Marko templates into a full web application with [file-based routing](./file-based-routing.md), nested layouts, middleware, streaming server-side rendering, and [adapters](./adapters.md) for deploying to different platforms.

Marko Run is powered by [Vite](https://vitejs.dev/) and works with zero configuration. The package ships with a default Vite config and a Node-based adapter, so a single `+page.marko` file is enough to serve an application.

## Using a Template

Marko provides project templates through `npm init marko`, many of which use Marko Run.

```sh
npm init marko
```

After choosing a template and project name:

```sh
cd PROJECT_NAME
npm run dev
```

## Manual Setup

Marko Run requires only one dependency in addition to `marko`, whether starting fresh or adding it to an existing Marko project.

1. Install the package

   ```sh
   npm install @marko/run
   ```

2. Create the first page at `src/routes/+page.marko`

   ```marko
   <h1>Hello Marko Run</h1>
   ```

3. Start the development server with the [CLI](./cli.md)

   ```sh
   npm exec marko-run
   ```

The application is now available at `http://localhost:3000` 🚀

> [!NOTE]
> No Vite config file is required, and [adapters](./adapters.md) are discovered automatically by package name. When a config file is needed, for example to set plugin options or register additional Vite plugins, see [Marko Run's Vite plugin](./vite-plugin.md).

## Next Steps

- [File-based Routing](./file-based-routing.md)
- [TypeScript](./typescript.md)
- [Adapters](./adapters.md)
