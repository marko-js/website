# CLI

The `marko-run` CLI develops, builds, and previews Marko Run applications. It is installed with `@marko/run` and run with `npm exec marko-run` or from package.json scripts.

The CLI has three commands: `dev`, `build`, and `preview`. All commands accept these options:

| Option           | Description                                                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `-c`, `--config` | Path to a Vite config file (by default, looks for a `vite.config` file with a `.js`, `.cjs`, `.mjs`, `.ts`, or `.mts` extension) |
| `-e`, `--env`    | Path to a dotenv file                                                                                                            |

## `dev`

Starts a development server in watch mode. This is the default command, so both of the following are equivalent:

```sh
npm exec marko-run
npm exec marko-run dev
```

| Option         | Description                                                                                                          |
| -------------- | -------------------------------------------------------------------------------------------------------------------- |
| `-p`, `--port` | Port to listen on (defaults: `server.port` then `preview.port` in the Vite config, the `PORT` env variable, or 3000) |

## `build`

Creates a production build.

```sh
npm exec marko-run build
```

| Option           | Description                                                                 |
| ---------------- | --------------------------------------------------------------------------- |
| `-o`, `--output` | Directory to write built files (default: `build.outDir` in the Vite config) |

## `preview`

Creates a production build and starts a production-like server.

```sh
npm exec marko-run preview
```

| Option           | Description                                                                                                                         |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `-o`, `--output` | Directory to serve files from, and write built files to (default: `build.outDir` in the Vite config)                                |
| `-p`, `--port`   | Port the server should listen on (defaults: `preview.port` then `server.port` in the Vite config, the `PORT` env variable, or 3000) |
| `-f`, `--file`   | Output file to start                                                                                                                |

## Next Steps

- [Vite Plugin](./vite-plugin.md)
- [Adapters](./adapters.md)
