# Getting Started

Marko Run (`@marko/run`) is the application framework for Marko. It turns a directory of Marko templates into a full web application with [file-based routing](./file-based-routing.md), nested layouts, middleware, streaming server-side rendering, and [adapters](./adapters.md) for deploying to different platforms.

Marko Run is powered by [Vite](https://vitejs.dev/) and works with zero configuration. The package ships with a default Vite config and a Node-based adapter, so a single `+page.marko` file is enough to serve an application.

## Using a Template

Marko's CLI provides a variety of templates, many of which use Marko Run.

```sh
npm init marko
```

After choosing a template and project name:

```sh
cd PROJECT_NAME
npm run dev
```

## Manual Setup

Marko Run requires just one dependency, whether starting fresh or adding it to an existing Marko project.

1. Install the package

   ```sh
   npm install @marko/run
   ```

2. Create the first page at `src/routes/+page.marko`

   ```marko
   <h1>Hello Marko Run</h1>
   ```

3. Start the development server

   ```sh
   npm exec marko-run
   ```

The application is now available at `http://localhost:3000` 🚀

> [!NOTE]
> No Vite config file is required. When one is needed, for example to apply an [adapter](./adapters.md), see [Marko Run's Vite plugin](./vite-plugin.md).

## CLI

The `marko-run` CLI has three commands: `dev`, `build`, and `preview`. All commands accept these options:

| Option           | Description                                                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `-c`, `--config` | Path to a Vite config file (by default, looks for a `vite.config` file with a `.js`, `.cjs`, `.mjs`, `.ts`, or `.mts` extension) |
| `-e`, `--env`    | Path to a dotenv file                                                                                                            |

### `dev`

Starts a development server in watch mode. This is the default command, so both of the following are equivalent:

```sh
npm exec marko-run
npm exec marko-run dev
```

| Option         | Description                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------- |
| `-p`, `--port` | Port to listen on (defaults: `preview.port` in the Vite config, the `PORT` env variable, or 3000) |

### `build`

Creates a production build.

```sh
npm exec marko-run build
```

| Option           | Description                                                                 |
| ---------------- | --------------------------------------------------------------------------- |
| `-o`, `--output` | Directory to write built files (default: `build.outDir` in the Vite config) |

### `preview`

Creates a production build and starts a production-like server.

```sh
npm exec marko-run preview
```

| Option           | Description                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| `-o`, `--output` | Directory to serve files from, and write built files to (default: `build.outDir` in the Vite config) |
| `-p`, `--port`   | Port the server should listen on (defaults: the `PORT` env variable or 3000)                         |
| `-f`, `--file`   | Output file to start                                                                                 |

## Next Steps

- [File-based Routing](./file-based-routing.md)
- [TypeScript](./typescript.md)
- [Adapters](./adapters.md)
