# CLI

The `marko-run` CLI develops, builds, and previews Marko Run applications. Run it with `npm exec marko-run` or from `package.json` scripts.

All commands (`dev`, `build`, and `preview`) accept an optional `[entry]` server/runtime entry file and these shared options:

| Option           | Description                                                                                    |
| :--------------- | :--------------------------------------------------------------------------------------------- |
| `-c`, `--config` | Path to a Vite config file (auto-discovers `vite.config.{js,cjs,mjs,ts,mts}` by default)       |
| `-e`, `--env`    | Path to a dotenv file                                                                          |

## `dev`

Starts the development server in watch mode (default command when omitted):

```sh
npm exec marko-run
npm exec marko-run dev [entry]
```

| Option         | Description                                                                   |
| :------------- | :---------------------------------------------------------------------------- |
| `-p`, `--port` | Port to listen on (defaults to Vite `server.port`, `PORT` env var, or `3000`) |

## `build`

Creates a production build:

```sh
npm exec marko-run build [entry]
```

| Option           | Description                                                           |
| :--------------- | :-------------------------------------------------------------------- |
| `-o`, `--output` | Output directory (defaults to Vite `build.outDir`, or `dist`)         |

## `preview`

Builds the production output and starts a local preview server:

```sh
npm exec marko-run preview [entry]
```

| Option           | Description                                                                      |
| :--------------- | :------------------------------------------------------------------------------- |
| `-o`, `--output` | Output directory to build and serve (defaults to Vite `build.outDir`, or `dist`) |
| `-p`, `--port`   | Port to listen on (defaults to Vite `preview.port`, `PORT` env var, or `3000`)   |
| `-f`, `--file`   | Built entry file to start (defaults to `index.mjs` or `index.js` in output dir)  |

## Next Steps

- [Vite Plugin](./vite-plugin.md)
- [Adapters](./adapters.md)
